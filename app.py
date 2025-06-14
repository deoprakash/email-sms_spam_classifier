from flask import Flask, render_template, request, jsonify
import joblib
from preprocessor import TextPreprocessor 
from flask_cors  import CORS

app = Flask(__name__)
CORS(app)

# Load trained pipeline

model = joblib.load('Model/email_classifier.pkl')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        data = request.get_json()
        message = data['message']
        prediction = model.predict([message])[0]
        return jsonify({'prediction': int(prediction)})

if __name__ == '__main__':
    app.run(debug=True)
