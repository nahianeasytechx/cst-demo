import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCST } from '../context/CSTContext';
import { formatBDT, formatDate } from '../utils/formatters';
import { FiBarChart2, FiDollarSign, FiPackage, FiTrendingUp, FiDownload, FiSearch, FiTarget, FiPlus, FiTrash2, FiArrowRight, FiAlertOctagon, FiCheckCircle, FiPlay } from 'react-icons/fi';
import { HiDocumentReport } from 'react-icons/hi';
import { HiClipboardDocumentList } from 'react-icons/hi2';
import './Dashboard.css';

export default function Dashboard() {
  const { savedReports, deleteReport } = useCST();

  const totalReports = savedReports.length;
  const totalSavings = savedReports.reduce(
    (sum, r) => sum + (r.summary?.totalPotentialSaving || 0), 0
  );
  const totalItems = savedReports.reduce(
    (sum, r) => sum + (r.items?.length || 0), 0
  );
  const avgOverprice = savedReports.length > 0
    ? savedReports.reduce((sum, r) => sum + (r.summary?.overpaymentPercent || 0), 0) / savedReports.length
    : 0;

  const statsCards = [
    { icon: <FiBarChart2 size={24} />, label: 'Reports Generated', value: totalReports, accent: 'blue' },
    { icon: <FiDollarSign size={24} />, label: 'Total Savings Found', value: formatBDT(totalSavings), accent: 'green' },
    { icon: <FiPackage size={24} />, label: 'Items Analyzed', value: totalItems, accent: 'purple' },
    { icon: <FiTrendingUp size={24} />, label: 'Avg. Overprice', value: `${avgOverprice.toFixed(1)}%`, accent: 'orange' },
  ];

  return (
    <div className="dashboard">
      {/* Hero Section */}
      <motion.section
        className="hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-bg-effects">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-grid-pattern" />
        </div>

        <div className="hero-content">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <HiDocumentReport size={16} /> CST-AI v1.0 — Procurement Intelligence
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Your <span className="hero-accent">Cost Watchdog</span> for 
            <br />Smart Procurement Decisions
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Analyze vendor quotations, validate against live market prices, and generate 
            professional Comparative Statement reports — all in minutes.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/new" className="btn btn-primary btn-lg hero-cta">
              <FiPlus size={18} /> Start New Analysis
            </Link>
            <Link to="/new?demo=true" className="btn btn-secondary btn-lg">
              <FiPlay size={16} /> Try Demo
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Cards */}
      <section className="stats-section">
        <div className="stats-grid">
          {statsCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              className={`stat-card stat-${stat.accent}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <span className="stat-icon-svg">{stat.icon}</span>
              <div className="stat-info">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <h2 className="features-title">How CST-AI Works</h2>
        <div className="features-grid">
          {[
            { icon: <FiDownload size={28} />, title: 'Upload Quotation', desc: 'Upload vendor PDF, image, or paste text. Supports multiple vendors for comparison.' },
            { icon: <FiSearch size={28} />, title: 'Market Research', desc: 'Enter market prices from BD & international sources. Auto-calculates variance and status.' },
            { icon: <FiBarChart2 size={28} />, title: 'Generate CST Report', desc: 'Full Comparative Statement with executive summary, item analysis, and recommendations.' },
            { icon: <FiTarget size={28} />, title: 'Negotiate & Save', desc: 'Get negotiation scripts, counter-offer totals, and alternative vendor suggestions.' },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <div className="feature-step">Step {i + 1}</div>
              <span className="feature-icon-svg">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Reports */}
      {savedReports.length > 0 && (
        <section className="recent-section">
          <div className="flex-between mb-lg">
            <h2 className="recent-title">
              <HiClipboardDocumentList size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
              Recent Reports
            </h2>
          </div>

          <div className="recent-list">
            {savedReports.slice(0, 5).map((report, i) => (
              <motion.div
                key={report.id}
                className="recent-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <div className="recent-info">
                  <h4 className="recent-vendor">{report.vendorInfo?.vendorName || 'Untitled Report'}</h4>
                  <p className="recent-meta">
                    {report.items?.length || 0} items • {formatBDT(report.summary?.totalQuoted || 0)} quoted
                    • Generated {formatDate(report.generatedAt)}
                  </p>
                </div>
                <div className="recent-stats">
                  <span className={`status-badge ${report.summary?.counts?.overpriced > 0 ? 'overpriced' : 'fair'}`}>
                    {report.summary?.counts?.overpriced > 0 
                      ? <><FiAlertOctagon size={12} /> {report.summary.counts.overpriced} overpriced</>
                      : <><FiCheckCircle size={12} /> Fair pricing</>
                    }
                  </span>
                  <span className="recent-saving text-success text-mono">
                    {formatBDT(report.summary?.totalPotentialSaving || 0)} saving
                  </span>
                </div>
                <div className="recent-actions">
                  <Link to={`/report/${report.id}`} className="btn btn-ghost btn-sm">
                    View <FiArrowRight size={14} />
                  </Link>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteReport(report.id)}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
