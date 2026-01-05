import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const ModelStatus = () => {
  const [modelInfo, setModelInfo] = useState({
    version: 'v1.0',
    last_trained: '—',
    accuracy: '—',
    precision: '—',
    recall: '—',
    f1: '—',
    deployed: false,
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);

  useEffect(() => {
    // Fetch initial model info
    const fetchModelInfo = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/model/info`);
        if (res.ok) {
          const data = await res.json();
          setModelInfo(data);
        }
      } catch (err) {
        console.warn('Failed to fetch model info:', err);
      }
    };

    // Fetch retraining history
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/model/history?limit=5`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.warn('Failed to fetch model history:', err);
      }
    };

    fetchModelInfo();
    fetchHistory();

    // Connect to WebSocket for real-time updates
    const socket = io(API_BASE, {
      transports: ['polling'], // backend running without websocket upgrade
      reconnection: true,
    });

    socket.on('model_updated', (data) => {
      console.log('Model updated:', data);
      fetchModelInfo();
      fetchHistory();
    });

    return () => {
      socket.close();
    };
  }, []);

  const handleManualRetrain = async () => {
    setIsRetraining(true);
    try {
      const res = await fetch(`${API_BASE}/api/model/retrain`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        console.log('Retrain result:', data);
        
        // Refresh model info and history
        setTimeout(() => {
          const fetchModelInfo = async () => {
            const res = await fetch(`${API_BASE}/api/model/info`);
            if (res.ok) {
              const data = await res.json();
              setModelInfo(data);
            }
          };
          const fetchHistory = async () => {
            const res = await fetch(`${API_BASE}/api/model/history?limit=5`);
            if (res.ok) {
              const data = await res.json();
              setHistory(data);
            }
          };
          fetchModelInfo();
          fetchHistory();
        }, 1000);
      }
    } catch (err) {
      console.error('Manual retrain failed:', err);
    } finally {
      setIsRetraining(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="section-card p-5 rounded-3xl border border-white/10 bg-gradient-to-br from-ink/90 via-slate/90 to-ink/90 space-y-6">
      {/* Model Info Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Model Version</h3>
          <p className="text-cloud/80 text-sm">{modelInfo.version}</p>
        </div>
        <div className={`pill text-xs font-bold ${modelInfo.deployed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
          {modelInfo.deployed ? '✓ Deployed' : 'Standby'}
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Accuracy" value={modelInfo.accuracy} />
        <MetricCard label="Precision" value={modelInfo.precision} />
        <MetricCard label="Recall" value={modelInfo.recall} />
        <MetricCard label="F1 Score" value={modelInfo.f1} />
      </div>

      {/* Last Trained */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-cloud/80">Last Trained</span>
        <span className="text-white font-mono">{formatDate(modelInfo.last_trained)}</span>
      </div>

      {/* Manual Retrain Button */}
      <button
        onClick={handleManualRetrain}
        disabled={isRetraining}
        className="w-full primary-btn justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRetraining ? (
          <>
            <span className="animate-spin">⟳</span>
            Retraining...
          </>
        ) : (
          <>
            🔄 Trigger Retraining
          </>
        )}
      </button>

      {/* Retraining History */}
      {history.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white">Recent Retraining</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-navy/50 border border-white/5 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-cloud/70">
                    {formatDate(item.created_at)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`pill text-xs ${item.improved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {item.improved ? '↑ Improved' : '↓ Rejected'}
                    </span>
                    {item.deployed && (
                      <span className="pill text-xs bg-gold/20 text-gold">Deployed</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-cloud/60">
                  Accuracy: <span className="text-white font-mono">{item.metrics.accuracy}</span>
                  {item.accuracy_delta !== 0 && (
                    <span className={item.improved ? 'text-emerald-400' : 'text-red-400'}>
                      {' '}({item.accuracy_delta > 0 ? '+' : ''}{item.accuracy_delta.toFixed(4)})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ label, value }) => (
  <div className="p-3 rounded-lg bg-navy/50 border border-white/5 text-center">
    <p className="text-cloud/70 text-xs mb-1">{label}</p>
    <p className="text-white font-semibold text-sm">
      {typeof value === 'number' ? value.toFixed(3) : value}
    </p>
  </div>
);

export default ModelStatus;
