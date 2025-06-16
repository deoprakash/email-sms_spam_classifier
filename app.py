from flask import Flask, render_template, request
import joblib
from flask_cors  import CORS

import nltk
from nltk.stem.porter import PorterStemmer
from nltk.corpus import stopwords
from sklearn.base import BaseEstimator, TransformerMixin
import string

nltk.download('punkt')
nltk.download('stopwords')

app = Flask(__name__)
CORS(app)

# Load trained pipeline

model = joblib.load('Model/email_classifier.pkl')

ps = PorterStemmer()

class TextPreprocessor(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        return [self.transform_text(text) for text in X]

    def transform_text(self, text):
        text = str(text).lower()
        text = nltk.word_tokenize(text)
        y = [i for i in text if i.isalnum()]
        y = [i for i in y if i not in stopwords.words('english') and i not in string.punctuation]
        y = [ps.stem(i) for i in y]
        return " ".join(y)


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

        prediction_class = model.predict([user_input])[0]
        prediction_proba = model.predict_proba([user_input])[0]
        confidence = round(max(prediction_proba) * 100, 2)
        prediction = 'Spam' if prediction_class == 1 else 'Not Spam'

        return render_template('spam.html', prediction=prediction, message=user_input, confidence=confidence)

    except Exception as e:
        print("Error:", str(e))
        return render_template('spam.html', prediction="Error during prediction", message="", confidence=0)


if __name__ == '__main__':
    app.run(debug=True)
