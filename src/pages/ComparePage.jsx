import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiBarChart2, FiDownload } from 'react-icons/fi';
import { HiShieldCheck } from 'react-icons/hi2';
import { HiSwitchHorizontal } from 'react-icons/hi';
import { FiTarget } from 'react-icons/fi';
import './ComparePage.css';

export default function ComparePage() {
  const navigate = useNavigate();

  return (
    <div className="compare-page page-container">
      <motion.div
        className="compare-coming-soon"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <HiSwitchHorizontal size={52} className="cs-icon-svg" />
        <h1 className="cs-title">Vendor Comparison</h1>
        <p className="cs-desc">
          Upload multiple vendor quotations to get a side-by-side vendor comparison matrix.
          The system will automatically highlight the best price per item and recommend the optimal vendor split.
        </p>

        <div className="cs-features">
          <div className="cs-feature">
            <FiBarChart2 size={18} />
            <span>Side-by-side price matrix</span>
          </div>
          <div className="cs-feature">
            <HiShieldCheck size={18} />
            <span>Best price per item highlighted</span>
          </div>
          <div className="cs-feature">
            <FiTarget size={18} />
            <span>Optimal vendor split recommendation</span>
          </div>
          <div className="cs-feature">
            <FiDownload size={18} />
            <span>Export comparison as PDF</span>
          </div>
        </div>

        <div className="cs-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/new')}>
            Start with Single Vendor <FiArrowRight size={18} />
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/')}>
            <FiArrowLeft size={18} /> Back to Dashboard
          </button>
        </div>

        <p className="cs-note">
          Multi-vendor comparison is automatically triggered when you upload multiple quotations in the Input page.
        </p>
      </motion.div>
    </div>
  );
}
