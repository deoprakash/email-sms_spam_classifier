import sqlite3
import joblib
import os
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from preprocessor import transform_text
from tools import db_helper

MODEL_DIR = 'Model'
CURRENT_MODEL = os.path.join(MODEL_DIR, 'pipeline.pkl')
MODEL_BACKUP = os.path.join(MODEL_DIR, 'pipeline_backup.pkl')


def get_training_data():
    """Fetch accumulated predictions from database for retraining"""
    conn = sqlite3.connect('spam_classifier.db')
    cursor = conn.cursor()
    
    # Get predictions with their labels
    cursor.execute("""
        SELECT message, prediction FROM predictions
        WHERE message IS NOT NULL AND prediction IS NOT NULL
        ORDER BY id DESC
    """)
    
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return None, None
    
    messages = [row[0] for row in rows]
    labels = [1 if row[1] == 'SPAM' else 0 for row in rows]
    
    # Preprocess messages
    processed_messages = [transform_text(msg) for msg in messages]
    
    return processed_messages, labels


def train_new_model(X_train, y_train):
    """Train a new model using TF-IDF + Naive Bayes"""
    try:
        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(max_features=5000, lowercase=True, ngram_range=(1, 2))),
            ('clf', MultinomialNB())
        ])
        
        pipeline.fit(X_train, y_train)
        return pipeline
    except Exception as e:
        print(f"Error training model: {e}")
        return None


def evaluate_model(model, X_test, y_test):
    """Evaluate model performance"""
    try:
        predictions = model.predict(X_test)
        
        metrics = {
            'accuracy': round(accuracy_score(y_test, predictions), 4),
            'precision': round(precision_score(y_test, predictions, zero_division=0), 4),
            'recall': round(recall_score(y_test, predictions, zero_division=0), 4),
            'f1': round(f1_score(y_test, predictions, zero_division=0), 4),
        }
        
        return metrics, predictions
    except Exception as e:
        print(f"Error evaluating model: {e}")
        return None, None


def get_current_model_metrics():
    """Get metrics of current deployed model from history"""
    conn = sqlite3.connect('spam_classifier.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT metrics FROM model_history 
        WHERE deployed = 1 
        ORDER BY created_at DESC LIMIT 1
    """)
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        import json
        return json.loads(row[0])
    
    return None


def save_model_to_history(metrics, improved, accuracy_delta=0):
    """Save model metrics to history table"""
    import json
    
    conn = sqlite3.connect('spam_classifier.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO model_history (metrics, improved, accuracy_delta, created_at)
        VALUES (?, ?, ?, ?)
    """, (json.dumps(metrics), 1 if improved else 0, round(accuracy_delta, 4), datetime.now()))
    
    conn.commit()
    conn.close()


def deploy_model(model, metrics):
    """Save new model as current deployment"""
    try:
        # Backup current model
        if os.path.exists(CURRENT_MODEL):
            os.rename(CURRENT_MODEL, MODEL_BACKUP)
        
        # Save new model
        joblib.dump(model, CURRENT_MODEL)
        
        # Mark as deployed in history
        conn = sqlite3.connect('spam_classifier.db')
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE model_history SET deployed = 1 WHERE id = (
                SELECT MAX(id) FROM model_history
            )
        """)
        conn.commit()
        conn.close()
        
        return True
    except Exception as e:
        print(f"Error deploying model: {e}")
        return False


def retrain_model():
    """
    Main retraining pipeline:
    1. Fetch accumulated predictions
    2. Train new model
    3. Evaluate against current model
    4. If improved, deploy new model
    5. Log metrics to history
    """
    print("[Retraining] Starting model retraining...")
    
    # Get training data
    X_train, y_train = get_training_data()
    
    if X_train is None or len(X_train) < 10:
        print("[Retraining] Not enough data for retraining (need >10 samples)")
        return {
            'status': 'skipped',
            'reason': 'Insufficient data',
            'timestamp': datetime.now().isoformat()
        }
    
    # Train new model
    new_model = train_new_model(X_train, y_train)
    if new_model is None:
        print("[Retraining] Failed to train new model")
        return {
            'status': 'failed',
            'reason': 'Training error',
            'timestamp': datetime.now().isoformat()
        }
    
    # Evaluate new model
    new_metrics, _ = evaluate_model(new_model, X_train, y_train)
    if new_metrics is None:
        print("[Retraining] Failed to evaluate new model")
        return {
            'status': 'failed',
            'reason': 'Evaluation error',
            'timestamp': datetime.now().isoformat()
        }
    
    # Get current model metrics for comparison
    current_metrics = get_current_model_metrics()
    current_accuracy = current_metrics['accuracy'] if current_metrics else 0
    new_accuracy = new_metrics['accuracy']
    accuracy_delta = new_accuracy - current_accuracy
    
    improved = new_accuracy > current_accuracy
    
    print(f"[Retraining] New model accuracy: {new_accuracy} | Current: {current_accuracy} | Delta: {accuracy_delta}")
    
    # Save to history
    save_model_to_history(new_metrics, improved, accuracy_delta)
    
    # Deploy if improved
    if improved:
        success = deploy_model(new_model, new_metrics)
        status = 'deployed' if success else 'failed'
        print(f"[Retraining] Model {'deployed' if success else 'deployment failed'}")
    else:
        status = 'rejected'
        print(f"[Retraining] Model rejected (not better than current)")
    
    return {
        'status': status,
        'new_accuracy': new_accuracy,
        'current_accuracy': current_accuracy,
        'delta': round(accuracy_delta, 4),
        'metrics': new_metrics,
        'samples_trained': len(X_train),
        'timestamp': datetime.now().isoformat()
    }


def get_model_history(limit=10):
    """Fetch model retraining history"""
    conn = sqlite3.connect('spam_classifier.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, metrics, improved, accuracy_delta, deployed, created_at 
        FROM model_history 
        ORDER BY created_at DESC 
        LIMIT ?
    """, (limit,))
    
    rows = cursor.fetchall()
    conn.close()
    
    import json
    history = []
    for row in rows:
        history.append({
            'id': row[0],
            'metrics': json.loads(row[1]),
            'improved': bool(row[2]),
            'accuracy_delta': row[3],
            'deployed': bool(row[4]),
            'created_at': row[5]
        })
    
    return history
