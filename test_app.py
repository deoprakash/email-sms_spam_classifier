import pytest
import sys
import os
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from app import app, socketio
from tools import db_helper, model_trainer
from preprocessor import transform_text


@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


class TestPreprocessor:
    """Test text preprocessing"""
    
    def test_transform_text_basic(self):
        """Test basic text transformation"""
        text = "This is a test message"
        result = transform_text(text)
        assert isinstance(result, str)
        assert len(result) > 0
    
    def test_transform_text_empty(self):
        """Test with empty string"""
        result = transform_text("")
        assert result == ""
    
    def test_transform_text_special_chars(self):
        """Test with special characters"""
        text = "Hello!!! How are you???"
        result = transform_text(text)
        assert isinstance(result, str)


class TestAPI:
    """Test Flask API endpoints"""
    
    def test_home_route(self, client):
        """Test home page"""
        response = client.get('/')
        assert response.status_code == 200
    
    def test_api_predict_missing_data(self, client):
        """Test prediction with missing data"""
        response = client.post('/api/predict', json={})
        assert response.status_code == 400
    
    def test_api_predict_empty_message(self, client):
        """Test prediction with empty message"""
        response = client.post('/api/predict', json={'message': '   '})
        assert response.status_code == 400
    
    def test_api_metrics(self, client):
        """Test metrics endpoint"""
        response = client.get('/api/metrics')
        assert response.status_code == 200
        data = response.get_json()
        assert 'throughput' in data
        assert 'total_predictions' in data
        assert 'spam_percentage' in data
    
    def test_api_hourly_metrics(self, client):
        """Test hourly metrics endpoint"""
        response = client.get('/api/metrics/hourly')
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
    
    def test_api_model_info(self, client):
        """Test model info endpoint"""
        response = client.get('/api/model/info')
        assert response.status_code == 200
        data = response.get_json()
        assert 'version' in data
    
    def test_api_model_history(self, client):
        """Test model history endpoint"""
        response = client.get('/api/model/history')
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)


class TestDatabase:
    """Test database operations"""
    
    def test_get_metrics(self):
        """Test metrics calculation"""
        metrics = db_helper.get_metrics()
        assert 'throughput' in metrics
        assert 'total_predictions' in metrics
        assert 'spam_percentage' in metrics
    
    def test_get_hourly_metrics(self):
        """Test hourly metrics"""
        hourly = db_helper.get_hourly_metrics(hours=12)
        assert isinstance(hourly, list)
        # Should return 12 hours even if some have 0
        assert len(hourly) <= 12


class TestModelTrainer:
    """Test model training pipeline"""
    
    def test_get_training_data(self):
        """Test training data retrieval"""
        X, y = model_trainer.get_training_data()
        # May be None if no data
        if X is not None:
            assert len(X) == len(y)
    
    def test_get_model_history(self):
        """Test model history retrieval"""
        history = model_trainer.get_model_history(limit=5)
        assert isinstance(history, list)


class TestIntegration:
    """Integration tests"""
    
    def test_full_prediction_flow(self, client):
        """Test complete prediction flow"""
        # Make prediction
        response = client.post('/api/predict', json={
            'message': 'Buy cheap products now! Click here'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'prediction' in data
        assert data['prediction'] in ['SPAM', 'HAM']
        assert 'confidence' in data
        assert 0 <= data['confidence'] <= 100


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
