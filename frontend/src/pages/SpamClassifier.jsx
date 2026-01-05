import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const SpamClassifier = () => {
  const [message, setMessage] = useState('');
  const [prediction, setPrediction] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [status, setStatus] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [predictionId, setPredictionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (evt) => {
    evt.preventDefault();
    setStatus('');
    setFeedbackStatus('');
    setIsLoading(true);
    setPrediction('');
    setConfidence(0);
    setPredictionId(null);

    try {
      const response = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload) {
        throw new Error(payload?.error || 'Prediction failed');
      }

      setPrediction(payload.prediction || '');
      setConfidence(Number(payload.confidence || 0));
      setPredictionId(payload.id || null);
      setStatus('Prediction updated');
    } catch (err) {
      setStatus(err.message || 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  const sendFeedback = () => {
    setFeedbackStatus('Feedback is disabled');
  };

  const loweredPrediction = (prediction || '').trim().toLowerCase();
  const isSpam = loweredPrediction === 'spam' || loweredPrediction === 'spm';

  return (
    <section className="max-w-5xl mx-auto">
      <div className="panel">
        <div className="flex flex-col gap-2 mb-5">
          <p className="pill w-fit">Live classifier</p>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-white">Email/SMS Spam Classifier</h1>
          <p className="text-cloud">Paste a message and get an instant SPAM/HAM verdict with confidence.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold" htmlFor="message">Enter message</label>
            <textarea
              id="message"
              className="textarea"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="primary-btn disabled:opacity-60" disabled={isLoading}>
              {isLoading ? 'Scoring...' : 'Classify Message'}
            </button>
            {status && <span className="pill" role="status">{status}</span>}
          </div>
        </form>

        {(prediction || confidence) && (
          <div className="grid gap-4 mt-6 sm:grid-cols-2 md:grid-cols-3">
            <div className="result-card">
              <div className="text-sm font-semibold text-white/80">Message</div>
              <div className="text-cloud mt-2">{message}</div>
            </div>
            <div className="result-card">
              <div className="text-sm font-semibold text-white/80">Prediction</div>
              <div className={`prediction-chip ${isSpam ? 'spam' : 'ham'} mt-2`}>
                {prediction || '—'}
              </div>
            </div>
            <div className="result-card">
              <div className="text-sm font-semibold text-white/80">Confidence</div>
              <div className="confidence-bar mt-2" aria-label="confidence">
                <div className="confidence-fill" style={{ width: `${confidence}%` }} />
              </div>
              <div className="text-cloud mt-2">{confidence}%</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SpamClassifier;
