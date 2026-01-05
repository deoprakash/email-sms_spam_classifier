from flask import Flask, request, jsonify
import joblib
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from apscheduler.schedulers.background import BackgroundScheduler
from preprocessor import transform_text
from tools import db_helper, model_trainer

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Change this to a random secret key
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Load trained pipeline
model = joblib.load('Model/pipeline.pkl')

# Initialize scheduler for model retraining
scheduler = BackgroundScheduler()

def scheduled_retrain_job():
    """Scheduled job for model retraining"""
    print("[Scheduler] Running scheduled retrain job...")
    result = model_trainer.retrain_model()
    
    # Reload model if deployed
    if result.get('status') == 'deployed':
        global model
        model = joblib.load('Model/pipeline.pkl')
        print("[Scheduler] Model reloaded successfully")
        socketio.emit('model_updated', {
            'status': 'deployed',
            'metrics': result.get('metrics'),
            'accuracy_delta': result.get('delta')
        }, namespace='/')

# Schedule retraining: Weekly on Sunday at 2 AM
scheduler.add_job(scheduled_retrain_job, 'cron', day_of_week=6, hour=2, minute=0)

# For testing: uncomment to retrain every 10 minutes
# scheduler.add_job(scheduled_retrain_job, 'interval', minutes=10)

if not scheduler.running:
    scheduler.start()
    print("[Scheduler] Retraining scheduler started")



@app.route('/')
def home():
    """API health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Email/SMS Spam Classifier API',
        'endpoints': {
            'predict': '/api/predict (POST)',
            'metrics': '/api/metrics (GET)',
            'model_info': '/api/model/info (GET)',
            'model_history': '/api/model/history (GET)',
            'model_retrain': '/api/model/retrain (POST)'
        }
    }), 200

@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict spam/ham for a given message"""
    try:
        data = request.get_json(silent=True) or {}
        user_input = (data.get('message') or '').strip()
        
        if not user_input:
            return jsonify({'error': 'No message provided'}), 400
        
        processed = transform_text(user_input)
        prediction_class = int(model.predict([processed])[0])
        prediction_proba = model.predict_proba([processed])[0]
        confidence = round(float(max(prediction_proba) * 100), 2)
        prediction = 'SPAM' if prediction_class == 1 else 'HAM'
        db_helper.save_to_db(user_input, prediction)

        result = {
            "prediction": prediction,
            "confidence": confidence,
            "message": user_input
        }

        # Emit real-time event to all connected clients
        socketio.emit('new_prediction', result, namespace='/')

        return jsonify(result)

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": "Error during prediction"}), 500


@app.route('/api/metrics', methods=['GET'])
def api_metrics():
    """Return real-time system metrics"""
    try:
        metrics = db_helper.get_metrics()
        return jsonify(metrics)
    except Exception as e:
        print("Error fetching metrics:", str(e))
        return jsonify({
            "throughput": "—",
            "false_positives": "—",
            "latency_p95": "—",
            "total_predictions": 0,
            "spam_percentage": 0
        }), 500


@app.route('/api/metrics/hourly', methods=['GET'])
def api_hourly_metrics():
    """Return real hourly prediction data for the last 12 hours"""
    try:
        hourly_data = db_helper.get_hourly_metrics(hours=12)
        return jsonify(hourly_data)
    except Exception as e:
        print("Error fetching hourly metrics:", str(e))
        return jsonify([]), 500


@app.route('/api/model/info', methods=['GET'])
def api_model_info():
    """Return current model version and performance"""
    try:
        history = model_trainer.get_model_history(limit=1)
        if history:
            latest = history[0]
            return jsonify({
                'version': 'v1.0',
                'last_trained': latest['created_at'],
                'accuracy': latest['metrics']['accuracy'],
                'precision': latest['metrics']['precision'],
                'recall': latest['metrics']['recall'],
                'f1': latest['metrics']['f1'],
                'deployed': latest['deployed']
            })
        return jsonify({'version': 'v1.0', 'status': 'no_history'}), 200
    except Exception as e:
        print("Error fetching model info:", str(e))
        return jsonify({'error': str(e)}), 500


@app.route('/api/model/history', methods=['GET'])
def api_model_history():
    """Return model retraining history"""
    try:
        limit = request.args.get('limit', 10, type=int)
        history = model_trainer.get_model_history(limit=limit)
        return jsonify(history)
    except Exception as e:
        print("Error fetching model history:", str(e))
        return jsonify([]), 500


@app.route('/api/model/retrain', methods=['POST'])
def api_manual_retrain():
    """Manually trigger model retraining"""
    try:
        result = model_trainer.retrain_model()
        
        # Reload model if deployed
        if result.get('status') == 'deployed':
            global model
            model = joblib.load('Model/pipeline.pkl')
            print("[API] Model reloaded successfully")
            socketio.emit('model_updated', {
                'status': 'deployed',
                'metrics': result.get('metrics'),
                'accuracy_delta': result.get('delta')
            }, namespace='/')
        
        return jsonify(result)
    except Exception as e:
        print("Error during manual retrain:", str(e))
        return jsonify({'status': 'error', 'error': str(e)}), 500


@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print('Client connected')
    # Send current metrics on connection
    try:
        metrics = db_helper.get_metrics()
        emit('metrics_update', metrics)
        
        # Send model info
        model_info = model_trainer.get_model_history(limit=1)
        if model_info:
            emit('model_status', {'deployed': model_info[0]['deployed']})
    except Exception as e:
        print('Error sending initial data:', str(e))


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print('Client disconnected')


if __name__ == '__main__':
    socketio.run(app, debug=True, host='127.0.0.1', port=5000)
