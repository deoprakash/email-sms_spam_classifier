import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io(API_BASE, {
      transports: ['polling'], // use polling since backend is running without a websocket server
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    // Listen for new predictions
    newSocket.on('new_prediction', (data) => {
      console.log('new_prediction received', data);
      const activity = {
        id: Date.now(),
        message: data.message,
        prediction: data.prediction,
        confidence: data.confidence,
        timestamp: new Date().toLocaleTimeString(),
      };

      setActivities((prev) => [activity, ...prev].slice(0, 10)); // Keep last 10
    });

    // Handle connection events
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  if (activities.length === 0) {
    return (
      <div className="section-card p-5 rounded-3xl border border-white/10 bg-gradient-to-br from-ink/90 via-slate/90 to-ink/90">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          Live Activity Feed
        </h3>
        <p className="text-cloud/60 text-sm text-center py-4">
          Waiting for predictions...
        </p>
      </div>
    );
  }

  return (
    <div className="section-card p-5 rounded-3xl border border-white/10 bg-gradient-to-br from-ink/90 via-slate/90 to-ink/90">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        Live Activity Feed
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-3 rounded-xl bg-navy/50 border border-white/5 hover:border-white/10 transition-all duration-200 animate-fadeIn"
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`pill text-xs font-bold ${
                  activity.prediction === 'SPAM'
                    ? 'bg-punch/20 text-punch'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {activity.prediction}
              </span>
              <span className="text-cloud/60 text-xs">{activity.timestamp}</span>
            </div>
            <p className="text-cloud/80 text-sm truncate mb-2">
              {activity.message.length > 80
                ? activity.message.slice(0, 80) + '...'
                : activity.message}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-navy/80 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    activity.prediction === 'SPAM'
                      ? 'bg-gradient-to-r from-punch to-purple-500'
                      : 'bg-gradient-to-r from-emerald-500 to-cyan'
                  }`}
                  style={{ width: `${activity.confidence}%` }}
                ></div>
              </div>
              <span className="text-xs text-cloud/70 font-mono">
                {activity.confidence}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLog;
