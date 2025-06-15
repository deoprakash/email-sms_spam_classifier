from flask import Flask, render_template, request
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
        user_input = request.form['message']
        prediction_class = model.predict([user_input])[0]
        prediction_proba = model.predict_proba([user_input])[0]  # Returns [P(Not Spam), P(Spam)]
        
        confidence = round(max(prediction_proba) * 100, 2)  # In percentage

        prediction = 'Spam' if prediction_class == 1 else 'Not Spam'
        print(f"Prediction: {prediction}, Confidence: {confidence}")
        return render_template('index.html', prediction=prediction, message=user_input, confidence=confidence)


if __name__ == '__main__':
    app.run(debug=True)
