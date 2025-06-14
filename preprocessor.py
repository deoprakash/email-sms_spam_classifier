# text_preprocessor.py

import nltk
from nltk.stem.porter import PorterStemmer
from nltk.corpus import stopwords
from sklearn.base import BaseEstimator, TransformerMixin
import string

nltk.download('punkt')
nltk.download('stopwords')

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
