import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiDocumentReport } from 'react-icons/hi';
import { MdDashboard } from 'react-icons/md';
import { FiPlusCircle, FiSun, FiMoon } from 'react-icons/fi';
import { RiFileAddLine } from 'react-icons/ri';
import { useTheme } from '../hooks/useTheme';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: <MdDashboard size={18} /> },
    { path: '/new', label: 'New Analysis', icon: <RiFileAddLine size={18} /> },
  ];

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <HiDocumentReport size={24} className="brand-icon-svg" />
          <div className="brand-text">
            <span className="brand-name">CST-AI</span>
            <span className="brand-version">v1.0</span>
          </div>
        </Link>

        <div className="navbar-links">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          <Link to="/new" className="btn btn-primary btn-sm">
            <FiPlusCircle size={16} /> New CST
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
