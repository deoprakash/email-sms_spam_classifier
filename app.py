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
        result = model.predict([user_input])[0]
        prediction = 'Spam' if result == 1 else 'Not Spam'
        return render_template('index.html', prediction=prediction, message=user_input)

if __name__ == '__main__':
    app.run(debug=True)
