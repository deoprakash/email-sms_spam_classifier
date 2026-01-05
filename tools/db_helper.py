import sqlite3
from datetime import datetime, timedelta


def _ensure_columns(conn):
    """Ensure optional columns exist for latency and feedback."""
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(predictions)")
    cols = {row[1] for row in cursor.fetchall()}
    if 'latency_ms' not in cols:
        cursor.execute("ALTER TABLE predictions ADD COLUMN latency_ms REAL")
    if 'actual_label' not in cols:
        cursor.execute("ALTER TABLE predictions ADD COLUMN actual_label TEXT")
    if 'is_correct' not in cols:
        cursor.execute("ALTER TABLE predictions ADD COLUMN is_correct INTEGER")
    conn.commit()

def init_db():
    """Initialize database tables"""
    conn = sqlite3.connect('spam_classifier.db')
    cursor = conn.cursor()
    
    # Create predictions table if not exists
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT NOT NULL,
            prediction TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create model_history table for tracking retraining
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS model_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            metrics TEXT NOT NULL,
            improved INTEGER DEFAULT 0,
            accuracy_delta REAL DEFAULT 0.0,
            deployed INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    _ensure_columns(conn)
    conn.close()


# Initialize on import
init_db()

def save_to_db(message, prediction, latency_ms=None):
    conn = sqlite3.connect('spam_classifier.db')
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO predictions (message, prediction, latency_ms) VALUES(?, ?, ?)",
        (message, prediction, latency_ms),
    )
    conn.commit()
    row_id = cursor.lastrowid
    conn.close()
    return row_id


def update_feedback(prediction_id, actual_label):
    """Store ground-truth label and correctness for a prediction."""
    if actual_label not in ('SPAM', 'HAM'):
        raise ValueError('actual_label must be SPAM or HAM')

    conn = sqlite3.connect('spam_classifier.db')
    cursor = conn.cursor()

    cursor.execute("SELECT prediction FROM predictions WHERE id = ?", (prediction_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise ValueError('prediction_id not found')

    predicted = row[0]
    is_correct = 1 if predicted == actual_label else 0

    cursor.execute(
        "UPDATE predictions SET actual_label = ?, is_correct = ? WHERE id = ?",
        (actual_label, is_correct, prediction_id),
    )
    conn.commit()
    conn.close()
    return {'id': prediction_id, 'predicted': predicted, 'actual': actual_label, 'is_correct': bool(is_correct)}


def _percentile(data, pct):
    if not data:
        return None
    data = sorted(data)
    if len(data) == 1:
        return data[0]
    k = (len(data) - 1) * pct
    f = int(k)
    c = min(f + 1, len(data) - 1)
    if f == c:
        return data[int(k)]
    return data[f] + (data[c] - data[f]) * (k - f)


def get_metrics():
    """Calculate real-time metrics from the database using real data only."""
    conn = sqlite3.connect('spam_classifier.db')
    cursor = conn.cursor()
    
    # Total predictions in last 24h
    yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d %H:%M:%S')
    cursor.execute("SELECT COUNT(*) FROM predictions WHERE timestamp >= ?", (yesterday,))
    total_24h = cursor.fetchone()[0]
    
    # Total predictions ever
    cursor.execute("SELECT COUNT(*) FROM predictions")
    total_all_time = cursor.fetchone()[0]
    
    # Spam count all time
    cursor.execute("SELECT COUNT(*) FROM predictions WHERE prediction = 'SPAM'")
    spam_count_all = cursor.fetchone()[0]

    # False positives: only from labeled feedback
    cursor.execute("SELECT COUNT(*) FROM predictions WHERE actual_label IS NOT NULL")
    labeled_total = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM predictions WHERE prediction = 'SPAM' AND actual_label = 'HAM'")
    false_positive_count = cursor.fetchone()[0]

    if labeled_total > 0:
        false_positive_rate = round((false_positive_count / labeled_total) * 100, 1)
        fp_display = f"{false_positive_rate}% ({false_positive_count}/{labeled_total})"
    else:
        fp_display = 'N/A (no feedback yet)'

    # Latency p95 from last 24h where captured
    cursor.execute(
        "SELECT latency_ms FROM predictions WHERE latency_ms IS NOT NULL AND timestamp >= ?",
        (yesterday,),
    )
    latencies = [row[0] for row in cursor.fetchall() if row[0] is not None]
    p95 = _percentile(latencies, 0.95)
    latency_display = f"~{int(p95)} ms" if p95 is not None else 'N/A'

    conn.close()

    return {
        'throughput': f"{total_24h} msgs/day",
        'false_positives': fp_display,
        'latency_p95': latency_display,
        'total_predictions': total_all_time,
        'spam_percentage': round((spam_count_all / max(total_all_time, 1)) * 100, 1) if total_all_time > 0 else 0
    }


def get_hourly_metrics(hours=12):
    """Get real hourly prediction counts for the last N hours (fills missing hours with 0)."""
    conn = sqlite3.connect('spam_classifier.db')
    cursor = conn.cursor()

    # Pull aggregated counts keyed by full hour (date + hour) to avoid day-boundary collisions
    cursor.execute(
        f"""
        SELECT 
            strftime('%Y-%m-%d %H', timestamp) AS hour_key,
            COUNT(*) AS count,
            SUM(CASE WHEN prediction = 'SPAM' THEN 1 ELSE 0 END) AS spam_count
        FROM predictions
        WHERE timestamp >= datetime('now', '-{hours} hours')
        GROUP BY hour_key
    """
    )

    rows = cursor.fetchall()
    conn.close()

    # Build a lookup for quick access
    aggregates = {row[0]: (row[1], row[2] or 0) for row in rows}

    hourly_data = []
    now = datetime.now()

    # Oldest to newest over the requested window
    for i in range(hours - 1, -1, -1):
        dt = now - timedelta(hours=i)
        hour_key = dt.strftime('%Y-%m-%d %H')
        count, spam = aggregates.get(hour_key, (0, 0))

        hour_24 = dt.hour
        if hour_24 == 0:
            hour_label = '12a'
        elif hour_24 < 12:
            hour_label = f'{hour_24}a'
        elif hour_24 == 12:
            hour_label = '12p'
        else:
            hour_label = f'{hour_24 - 12}p'

        hourly_data.append({
            'hour': hour_label,
            'predictions': count,
            'spam': spam,
            'ham': count - spam,
        })

    return hourly_data
    