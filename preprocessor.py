# preprocessor.py
import nltk
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
import string

nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('stopwords')

ps = PorterStemmer()

def transform_text(text):
    text = str(text).lower()
    text = nltk.word_tokenize(text)
    text = [t for t in text if t.isalnum()]
    text = [t for t in text if t not in stopwords.words('english') and t not in string.punctuation]
    text = [ps.stem(t) for t in text]
    return " ".join(text)
