import { Link, NavLink } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav className="glass-nav">
      <Link to="/" className="text-xl md:text-2xl font-display font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue via-cyan to-gold">Email/SMS Spam Classifier</Link>
      <div className="flex items-center gap-5 md:gap-8">
        <NavLink to="/" className="nav-link">Home</NavLink>
        <NavLink to="/spam" className="nav-link">Classifier</NavLink>
        <NavLink to="/documentation" className="nav-link">Documentation</NavLink>
        <a className="nav-link" href="https://github.com/deoprakash" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </nav>
  );
};

export default NavBar;
