import { useState } from 'react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const submit = (evt) => {
    evt.preventDefault();
    setStatus('Hook up your auth endpoint to continue.');
  };

  return (
    <section className="max-w-xl mx-auto">
      <div className="panel space-y-4">
        <div>
          <p className="pill w-fit">Admin</p>
          <h2 className="text-2xl font-display">Login</h2>
          <p className="text-cloud">This form mirrors the legacy template. Wire it to your Flask auth route when ready.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold" htmlFor="username">Username</label>
            <input
              id="username"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Enter username"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter password"
              required
            />
          </div>
          <button className="primary-btn w-full justify-center" type="submit">
            Login
          </button>
          {status && <p className="text-cloud text-sm">{status}</p>}
        </form>
      </div>
    </section>
  );
};

export default Login;
