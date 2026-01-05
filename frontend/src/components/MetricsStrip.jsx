import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const MetricsStrip = () => {
  const [metrics, setMetrics] = useState({
    throughput: '—',
    false_positives: '—',
    latency_p95: '—',
    total_predictions: 0,
    spam_percentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initial fetch
    const fetchMetrics = async () => {
      try {
        const metricsResponse = await fetch(`${API_BASE}/api/metrics`);
        if (metricsResponse.ok) {
          const metrics_data = await metricsResponse.json();
          setMetrics({
            throughput: metrics_data.throughput || '—',
            false_positives: metrics_data.false_positives || '—',
            latency_p95: metrics_data.latency_p95 || '—',
            total_predictions: metrics_data.total_predictions || 0,
            spam_percentage: metrics_data.spam_percentage || 0,
          });
        }
      } catch (err) {
        console.warn('Failed to fetch metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();

    // Connect to WebSocket for real-time updates
    const newSocket = io(API_BASE, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    setSocket(newSocket);

    // Listen for metrics updates
    newSocket.on('metrics_update', (data) => {
      setMetrics({
        throughput: data.throughput || '—',
        false_positives: data.false_positives || '—',
        latency_p95: data.latency_p95 || '—',
        total_predictions: data.total_predictions || 0,
        spam_percentage: data.spam_percentage || 0,
      });
    });

    // Listen for new predictions to update metrics
    newSocket.on('new_prediction', () => {
      // Refetch metrics after each prediction
      fetchMetrics();
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const StatCard = ({ label, value, icon, color }) => (
    <div className="section-card p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-ink/80 via-slate/80 to-ink/80">
      <div className="flex items-center justify-between mb-3">
        <span className="text-cloud/80 text-sm font-semibold">{label}</span>
        <span className={`text-2xl ${color}`}>{icon}</span>
      </div>
      <div className="text-2xl font-bold text-white">
        {isLoading ? '...' : value}
      </div>
    </div>
  );

  return (
    <section className="mt-12 px-4 md:px-8 space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Throughput"
          value={metrics.throughput}
          icon="📊"
          color="text-gold"
        />
        <StatCard
          label="False Positives"
          value={metrics.false_positives}
          icon="⚠️"
          color="text-punch"
        />
        <StatCard
          label="Latency p95"
          value={metrics.latency_p95}
          icon="⚡"
          color="text-cyan"
        />
      </div>

      {/* Summary Stats */}
      <div className="section-card p-5 rounded-3xl border border-white/10 bg-gradient-to-r from-ink via-slate to-ink">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-cloud/80 mb-1">Total Predictions</p>
              <p className="text-3xl font-bold text-gold">
                {isLoading ? '...' : metrics.total_predictions}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-cloud/80 mb-1">SPAM Detection Rate</p>
              <p className="text-3xl font-bold text-punch">
                {isLoading ? '...' : `${metrics.spam_percentage.toFixed(1)}%`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MetricsStrip;
