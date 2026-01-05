const datasets = [
  { label: 'Dataset', value: 'SMS Spam Collection (UCI Repository)' },
  { label: 'Samples', value: '~5,500 labeled SMS messages' },
  { label: 'Labels', value: "'ham' (legit) or 'spam'" }
];

const steps = [
  'Lowercase text',
  'Tokenize with nltk.word_tokenize()',
  'Remove punctuation and non-alphanumeric tokens',
  'Remove English stopwords',
  'Stem tokens with PorterStemmer'
];

const metrics = [
  'Precision: share of predicted spam that is spam',
  'Recall: ability to detect all spam',
  'F1 Score: harmonic mean of precision and recall',
  'Accuracy: overall correct predictions'
];

const Documentation = () => {
  return (
    <section className="max-w-5xl mx-auto space-y-6">
      <div className="doc-container">
        <header className="doc-section">
          <div className="flex items-center gap-3">
            <span className="pill">Docs</span>
            <h2 className="text-2xl font-display">📘 Email/SMS Spam Classifier</h2>
          </div>
          <p>
            This frontend mirrors the original static pages in React. The backend runs a TF-IDF + Bernoulli Naive Bayes pipeline to classify incoming text as SPAM or HAM and returns a confidence score.
          </p>
        </header>

        <div className="doc-section">
          <h3>🧠 Project Overview</h3>
          <p>The model scores user-submitted messages, stores predictions, and exposes a JSON API at /api/predict.</p>
        </div>

        <div className="doc-section">
          <h3>📂 Dataset</h3>
          <ul className="list-disc list-inside">
            {datasets.map((item) => (
              <li key={item.label}><strong>{item.label}:</strong> {item.value}</li>
            ))}
          </ul>
        </div>

        <div className="doc-section">
          <h3>⚙️ Preprocessing Steps</h3>
          <ol className="list-decimal list-inside space-y-1">
            {steps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>

        <div className="doc-section">
          <h3>🔍 Feature Extraction</h3>
          <p>TF-IDF Vectorizer converts text to weighted numeric features capturing both frequency and uniqueness.</p>
        </div>

        <div className="doc-section">
          <h3>🤖 Algorithm</h3>
          <ul className="list-disc list-inside">
            <li>Pipeline: TF-IDF Vectorizer → BernoulliNB()</li>
            <li>Training Accuracy: ~98%</li>
          </ul>
        </div>

        <div className="doc-section">
          <h3>📊 Evaluation Metrics</h3>
          <ul className="list-disc list-inside">
            {metrics.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="doc-section">
          <h3>🧪 Example Result</h3>
          <pre className="bg-ink border border-white/10 rounded-xl p-4 text-cyan text-sm overflow-auto">
Test message: "Congratulations! You’ve won a free cruise to the Bahamas. Call now!"\nPrediction: SPAM\nConfidence: 96%
          </pre>
        </div>

        <div className="doc-section">
          <h3>💻 Tech Stack</h3>
          <ul className="list-disc list-inside">
            <li>Frontend: React + Vite</li>
            <li>Backend: Flask (CORS enabled)</li>
            <li>ML: NLTK, Scikit-learn</li>
            <li>Deployment ready for Render/railway-style hosts</li>
          </ul>
        </div>

        <div className="doc-section">
          <h3>🚀 How to Use</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Start the Flask server (port 5000).</li>
            <li>Run the React dev server (port 5173) or build + serve static files.</li>
            <li>Open the classifier page, enter a message, and submit.</li>
            <li>View prediction and confidence returned from the API.</li>
          </ol>
        </div>

        <div className="doc-section">
          <h3>📎 Links</h3>
          <p><a className="text-blue" href="https://github.com/deoprakash" target="_blank" rel="noreferrer">GitHub: @deoprakash</a></p>
          <p><a className="text-blue" href="mailto:deoprakash364@gmail.com">deoprakash364@gmail.com</a></p>
        </div>
      </div>
    </section>
  );
};

export default Documentation;
