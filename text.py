import joblib

vectorizer = joblib.load('Model/vectorizer.pkl')
print(type(vectorizer))
