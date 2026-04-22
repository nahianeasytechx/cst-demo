import { motion } from 'framer-motion';
import { FiDownload, FiPlus, FiMail, FiFileText, FiPhone, FiAlertTriangle } from 'react-icons/fi';
import './ReportActions.css';

export default function ReportActions({ onExportPDF, onNewAnalysis }) {
  return (
    <motion.div
      className="report-actions"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {/* Post-Report Options
      <div className="post-report">
        <h3 className="post-report-title">What would you like next?</h3>
        <div className="post-report-options">
          <button className="post-option" onClick={() => alert('Negotiation email draft feature — coming soon!')}>
            <FiMail size={24} className="post-option-icon-svg" />
            <span className="post-option-label">Draft Negotiation Email</span>
            <span className="post-option-desc">Auto-generate a professional email to this vendor</span>
          </button>
          <button className="post-option" onClick={() => alert('RFQ preparation feature — coming soon!')}>
            <FiFileText size={24} className="post-option-icon-svg" />
            <span className="post-option-label">Prepare an RFQ</span>
            <span className="post-option-desc">Generate an RFQ for alternative vendors</span>
          </button>
          <button className="post-option" onClick={() => alert('Call script feature — coming soon!')}>
            <FiPhone size={24} className="post-option-icon-svg" />
            <span className="post-option-label">Generate Call Script</span>
            <span className="post-option-desc">Talking points for negotiating by phone</span>
          </button>
        </div>
      </div> */}

      {/* Action Buttons */}
      <div className="action-bar">
        <button className="btn btn-primary btn-lg" onClick={onExportPDF}>
          <FiDownload size={18} /> Export as PDF
        </button>
        <button className="btn btn-secondary btn-lg" onClick={onNewAnalysis}>
          <FiPlus size={18} /> New Analysis
        </button>
      </div>

      {/* Disclaimers */}
      <div className="disclaimers">
        <h4 className="disclaimer-title">
          <FiAlertTriangle size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Disclaimers & Limitations
        </h4>
        <ul className="disclaimer-list">
          <li>Market prices are live at the time of this report and may fluctuate.</li>
          <li>Online prices often exclude: shipping, VAT, warranty, installation, after-sales service.</li>
          <li>For custom/imported items with no online match, physical market survey (Nilkhet, Bongshal, Elephant Road) is recommended.</li>
          <li>Verify SKU compatibility and warranty terms before final purchase.</li>
          <li>This report is a decision-support tool, not a final purchase order.</li>
        </ul>
      </div>
    </motion.div>
  );
}
