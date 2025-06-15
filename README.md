# 📧 Email/SMS Spam Classifier

A modern web application to classify messages as **SPAM** or **HAM** using machine learning. Built with Flask and styled in a professional dark-slate theme.

## 🌐 Live Demo

Visit the app locally at: `http://localhost:5000`  
Or deploy on platforms like Render, Vercel, or GitHub Pages (for frontend only).

---

## 🧠 Algorithm & Approach

This classifier uses the **Multinomial/Bernoulli Naive Bayes** algorithm with **TF-IDF vectorization** for effective spam detection.

### Preprocessing Steps

- Lowercasing all characters  
- Tokenization using NLTK  
- Removing stopwords and punctuations  
- Stemming using `PorterStemmer`  

### Features

- TF-IDF Vectorizer
- Naive Bayes Classifier
- NLTK Preprocessing Pipeline

---

## 🖼️ Interface Features

- Dark-themed modern UI
- Real-time spam classification
- Confidence score with a progress bar
- Particle background & animated effects (optional)
- Responsive design

---

## 🔧 Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript (Dark Slate Theme)
- **ML**: scikit-learn, NLTK

---

## 🚀 How to Run

```bash
# 1. Clone the repo
git clone https://github.com/your-username/email-sms-spam-classifier.git

# 2. Navigate into the directory
cd email-sms-spam-classifier

# 3. Create and activate virtual environment (optional)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run the app
python app.py
```

Then open `http://localhost:5000` in your browser.

---

## 🧪 Example Usage

**Message**: `Congratulations! You've won a $1000 Walmart Gift Card.`  
**Prediction**: `SPAM`  
**Confidence**: `96.4%`

---

## 📁 Project Structure

```
email-sms-spam-classifier/
│
├── app.py                  # Flask app
├── model.pkl               # Trained ML model
├── vectorizer.pkl          # TF-IDF Vectorizer
├── templates/
│   └── index.html
├── static/
│   └── style.css
├── requirements.txt
└── README.md
```

---

## 👤 Author

**DEO PRAKASH**  
GitHub: [@deoprakash](https://github.com/deoprakash)  
Year: 2025

---

## 📜 License

This project is licensed under the MIT License.