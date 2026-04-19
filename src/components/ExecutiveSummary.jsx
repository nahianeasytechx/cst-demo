import { motion } from 'framer-motion';
import { formatBDT, formatVariance } from '../utils/formatters';
import { FiBarChart2, FiTarget, FiAlertOctagon, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { HiShieldCheck } from 'react-icons/hi2';
import './ExecutiveSummary.css';

export default function ExecutiveSummary({ summary }) {
  if (!summary) return null;

  const getRecommendationClass = (rec) => {
    switch (rec) {
      case 'ACCEPT': return 'rec-accept';
      case 'NEGOTIATE': return 'rec-negotiate';
      case 'REJECT': return 'rec-reject';
      default: return 'rec-negotiate';
    }
  };

  const flagCards = [
    { icon: <FiAlertOctagon size={18} />, label: 'Overpriced', count: summary.counts.overpriced, total: summary.totalItems, cssClass: 'overpriced' },
    { icon: <FiAlertTriangle size={18} />, label: 'Slightly High', count: summary.counts.slightlyHigh, total: summary.totalItems, cssClass: 'high' },
    { icon: <FiCheckCircle size={18} />, label: 'Fair', count: summary.counts.fair, total: summary.totalItems, cssClass: 'fair' },
    { icon: <HiShieldCheck size={18} />, label: 'Good Deal', count: summary.counts.goodDeal, total: summary.totalItems, cssClass: 'good' },
  ];

  return (
    <motion.div
      className="exec-summary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="exec-summary-header">
        <h2><FiBarChart2 size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />Executive Summary</h2>
      </div>

      {/* Key Metrics */}
      <div className="exec-metrics">
        <motion.div
          className="exec-metric-card"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <span className="exec-metric-label">Total Items</span>
          <span className="exec-metric-value">{summary.totalItems}</span>
        </motion.div>

        <motion.div
          className="exec-metric-card"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="exec-metric-label">Quoted Value</span>
          <span className="exec-metric-value text-mono">{formatBDT(summary.totalQuoted)}</span>
        </motion.div>

        <motion.div
          className="exec-metric-card"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="exec-metric-label">Fair Market Value</span>
          <span className="exec-metric-value text-mono">{formatBDT(summary.totalFairMarket)}</span>
        </motion.div>

        <motion.div
          className="exec-metric-card highlight"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="exec-metric-label">Potential Overpayment</span>
          <span className="exec-metric-value text-mono text-danger">
            {formatBDT(summary.totalPotentialSaving)} ({formatVariance(summary.overpaymentPercent)})
          </span>
        </motion.div>
      </div>

      {/* Status Flag Distribution */}
      <div className="flag-distribution">
        {flagCards.map((flag, i) => (
          <motion.div
            key={flag.label}
            className={`flag-card ${flag.cssClass}`}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <span className="flag-icon-svg">{flag.icon}</span>
            <span className="flag-count">{flag.count}</span>
            <span className="flag-label">{flag.label}</span>
            <span className="flag-of">of {flag.total}</span>
          </motion.div>
        ))}
      </div>

      {/* Recommendation */}
      <motion.div
        className={`exec-recommendation ${getRecommendationClass(summary.recommendation)}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="rec-header">
          <FiTarget size={18} />
          <span className="rec-label">Recommended Action</span>
        </div>
        <div className="rec-action">{summary.recommendation}</div>
        <p className="rec-reasoning">{summary.reasoning}</p>
      </motion.div>
    </motion.div>
  );
}
