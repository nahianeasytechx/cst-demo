import { HiDocumentReport } from 'react-icons/hi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <HiDocumentReport size={16} style={{ color: 'var(--accent-blue)' }} />
          <span className="footer-name">CST-AI v1.0</span>
          <span className="footer-divider">—</span>
          <span className="footer-desc">Built for data-driven procurement</span>
        </div>
        <div className="footer-credit">
          Designed by <strong>Mehedi Hasan Jony</strong>
        </div>
      </div>
    </footer>
  );
}
