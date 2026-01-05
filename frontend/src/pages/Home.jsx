import { Link } from 'react-router-dom';
import ActivityLog from '../components/ActivityLog';
import ModelStatus from '../components/ModelStatus';

const features = [
  {
    icon: 'AI',
    title: 'Advanced NLP Engine',
    copy: 'TF-IDF vectorization paired with Naive Bayes to deliver reliable spam detection for SMS and email content.'
  },
  {
    icon: '⚡',
    title: 'Instant Analysis',
    copy: 'Low-latency scoring with clear confidence values so you can trust each decision in real time.'
  },
  {
    icon: '🛡️',
    title: 'Private by Design',
    copy: 'Inputs stay local to your session—no retention, no sharing—just quick classification.'
  }
];

const Home = () => {
  return (
    <div className="space-y-12">
      <section className="max-w-6xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-stretch">
        <div className="space-y-6 section-card p-6 md:p-7">
          <div className="flex items-center gap-3">
            <span className="pill">Live overview</span>
            <span className="pill bg-gold/20 text-gold">Today</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue via-cyan to-gold">
            Email/SMS Spam Detection
          </h1>
          <p className="text-cloud text-lg">
            A sleek dashboard for monitoring and classifying incoming comms. Track activity, see confidence at a glance, and jump into the classifier in one click.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/spam" className="primary-btn">
              Enter Classifier
              <span aria-hidden>→</span>
            </Link>
            <Link to="/documentation" className="ghost-btn">
              View Docs
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm text-cloud/80">
              <span>Spam share</span>
              <span className="font-semibold text-gold">38%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[38%] bg-gradient-to-r from-punch via-blue to-gold" />
            </div>
          </div>
        </div>

        <div className="section-card p-5 md:p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display">Activity</h3>
            <span className="pill">24h</span>
          </div>
          <div className="bg-gradient-to-b from-ink to-slate rounded-2xl p-4 border border-white/5 shadow-glow">
            <div className="flex justify-between text-xs text-cloud/70 mb-3">
              <span>7a</span><span>11a</span><span>3p</span><span>7p</span><span>11p</span>
            </div>
            <div className="relative h-36 flex items-end gap-2">
              {[25, 40, 32, 70, 18, 55, 62, 45, 52, 68, 38, 48].map((h, idx) => (
                <div key={idx} className="flex-1 flex flex-col justify-end">
                  <div className="mx-auto w-full rounded-full bg-gradient-to-t from-blue via-cyan to-gold" style={{ height: `${h}%`, minHeight: '10%' }} />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="section-card p-3 flex items-center justify-between">
              <span className="text-cloud/80">Messages</span>
              <span className="font-semibold text-white">1,248</span>
            </div>
            <div className="section-card p-3 flex items-center justify-between">
              <span className="text-cloud/80">Avg. confidence</span>
              <span className="font-semibold text-gold">92%</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-display">Model Performance</h2>
          <span className="pill">Auto-Retraining</span>
        </div>
        <ModelStatus />
      </section>

      <section className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-display">Live Activity Stream</h2>
          <span className="pill">Real-time</span>
        </div>
        <ActivityLog />
      </section>

      <section className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-display">Ongoing Checks</h2>
          <span className="pill">Realtime</span>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item) => (
            <article className="feature-card" key={item.title}>
              <div className="flex items-center justify-between mb-3">
                <div className="feature-icon">{item.icon}</div>
                <span className="pill bg-gold/15 text-gold text-xs">Stable</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-cloud text-sm leading-relaxed">{item.copy}</p>
              <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-[65%] bg-gradient-to-r from-blue via-cyan to-gold" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
