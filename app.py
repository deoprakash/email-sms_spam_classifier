from flask import Flask, render_template, request
import joblib
from flask_cors  import CORS
from preprocessor import transform_text

app = Flask(__name__)
CORS(app)

# Load trained pipeline

model = joblib.load('Model/pipeline.pkl')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/spam')
def spam():
    return render_template('spam.html')

@app.route('/documentation')
def documentation():
    return render_template('documentation.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        user_input = request.form.get('message', '')
        if not user_input.strip():
            return render_template('spam.html', prediction="No input provided", message="", confidence=0)
        
        processed = transform_text(user_input)
        prediction_class = model.predict([processed])[0]
        prediction_proba = model.predict_proba([processed])[0]
        confidence = round(max(prediction_proba) * 100, 2)
        prediction = 'Spam' if prediction_class == 1 else 'Not Spam'

        return render_template('spam.html', prediction=prediction, message=user_input, confidence=confidence)

    except Exception as e:
        print("Error:", str(e))
        return render_template('spam.html', prediction="Error during prediction", message="", confidence=0)


if __name__ == '__main__':
    app.run(debug=True)
