import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertTriangle, FiAlertOctagon, FiHelpCircle } from 'react-icons/fi';
import { HiShieldCheck } from 'react-icons/hi2';

const iconMap = {
  good: <HiShieldCheck size={14} />,
  fair: <FiCheckCircle size={14} />,
  high: <FiAlertTriangle size={14} />,
  overpriced: <FiAlertOctagon size={14} />,
  unverifiable: <FiHelpCircle size={14} />,
};

export default function StatusBadge({ flag, size = 'md' }) {
  if (!flag) return null;

  return (
    <motion.span
      className={`status-badge ${flag.cssClass} ${size === 'sm' ? 'status-badge-sm' : ''}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, type: 'spring' }}
    >
      {iconMap[flag.cssClass] || null}
      <span>{flag.label}</span>
    </motion.span>
  );
}
