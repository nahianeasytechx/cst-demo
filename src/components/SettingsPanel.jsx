import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings, FiX, FiCheck, FiInfo, FiServer } from 'react-icons/fi';
import './SettingsPanel.css';

export default function SettingsPanel({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="settings-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="settings-panel"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="settings-header">
              <h2><FiSettings size={20} /> Settings</h2>
              <button className="btn btn-ghost btn-sm" onClick={onClose}>
                <FiX size={18} />
              </button>
            </div>

            <div className="settings-body">
              {/* Market Price Search */}
              <div className="settings-section">
                <h3 className="settings-section-title">
                  <FiServer size={16} /> Market Price Search
                </h3>
                <p className="settings-section-desc">
                  Market price searching uses <strong>Bright Data SERP API</strong>. The API key is managed
                  server-side via the <code>BRIGHTDATA_KEY</code> environment variable — it is never exposed in the browser.
                </p>
                <div className="settings-status configured">
                  <FiCheck size={14} /> Managed via server environment variables
                </div>

                <div className="settings-help">
                  <p><strong>Setup (for deployment):</strong></p>
                  <ol>
                    <li>Get an API key from <a href="https://brightdata.com/" target="_blank" rel="noopener noreferrer">brightdata.com</a></li>
                    <li>Add <code>BRIGHTDATA_KEY</code> to your Vercel project environment variables</li>
                    <li>Redeploy — market search will work automatically</li>
                  </ol>
                  <p className="settings-limit">
                    Free tier: 250 searches/month, 50/hour
                  </p>
                </div>
              </div>

              {/* OCR Info */}
              <div className="settings-section">
                <h3 className="settings-section-title">
                  <FiInfo size={16} /> OCR (Image Scanning)
                </h3>
                <p className="settings-section-desc">
                  Image-to-text scanning uses <strong>Tesseract.js</strong> and runs entirely in your browser. No API key needed — completely free with no limits.
                </p>
                <div className="settings-status configured">
                  <FiCheck size={14} /> Always available — no setup required
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
