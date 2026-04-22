import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCST } from '../context/CSTContext';
import MarketPriceCard from '../components/MarketPriceCard';
import { analyzeItem, generateExecutiveSummary } from '../utils/priceAnalysis';
import { formatBDT, formatVariance } from '../utils/formatters';
import { searchPrices, isPriceSearchConfigured } from '../services/priceProvider';
import { FiSearch, FiArrowLeft, FiBarChart2, FiPackage, FiAlertOctagon, FiAlertTriangle, FiCheckCircle, FiLoader, FiZap } from 'react-icons/fi';
import { HiShieldCheck } from 'react-icons/hi2';
import './AnalysisPage.css';

export default function AnalysisPage() {
  const { vendorInfo, lineItems, generateReport, dispatch } = useCST();
  const navigate = useNavigate();
  const [bulkSearching, setBulkSearching] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

  const liveSummary = useMemo(() => {
    const analyzed = lineItems.map(item => analyzeItem(item));
    return generateExecutiveSummary(analyzed);
  }, [lineItems]);

  const handleGenerate = () => {
    const report = generateReport();
    navigate(`/report/${report.id}`);
  };

  const handleBack = () => {
    navigate('/new');
  };

  const handleBulkSearch = async () => {
    if (!isPriceSearchConfigured()) {
      alert('GEMINI_API_KEY not configured on the server. Add it to your Vercel environment variables.');
      return;
    }

    setBulkSearching(true);
    const total = lineItems.length;
    setBulkProgress({ current: 0, total });

    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      const query = [item.itemName, item.brand, item.specs].filter(Boolean).join(' ').trim();

      if (!query) {
        setBulkProgress({ current: i + 1, total });
        continue;
      }

      try {
        const { results } = await searchPrices(query + ' price');

        // Add top 3 results as market sources
        const topResults = results.slice(0, 3);
        topResults.forEach(result => {
          dispatch({
            type: 'ADD_MARKET_SOURCE',
            payload: {
              itemId: item.id,
              source: {
                seller: result.seller,
                price: result.price,
                url: result.url,
                stock: result.stock || 'In Stock',
              },
            },
          });
        });
      } catch (error) {
        console.warn(`Search failed for "${query}":`, error.message);
      }

      setBulkProgress({ current: i + 1, total });

      // Rate limit delay: ~1.5s between requests
      if (i < lineItems.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    setBulkSearching(false);
  };

  if (lineItems.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <FiPackage size={48} className="empty-icon-svg" />
          <h2>No Items to Analyze</h2>
          <p>Please add line items first before proceeding to market research.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/new')}>
            <FiArrowLeft size={18} /> Back to Input
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-page page-container-wide">
      {/* Header */}
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>
          <span className="header-icon"><FiSearch size={26} /></span>
          Market Research & Analysis
        </h1>
        <p>Enter market prices for each item. Analysis calculates automatically in real time.</p>
      </motion.div>

      {/* Live Summary Bar */}
      <motion.div
        className="live-summary-bar"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="live-stat">
          <span className="live-label">Items</span>
          <span className="live-value">{liveSummary.totalItems}</span>
        </div>
        <div className="live-divider" />
        <div className="live-stat">
          <span className="live-label">Quoted Total</span>
          <span className="live-value text-mono">{formatBDT(liveSummary.totalQuoted)}</span>
        </div>
        <div className="live-divider" />
        <div className="live-stat">
          <span className="live-label">Fair Market</span>
          <span className="live-value text-mono">{formatBDT(liveSummary.totalFairMarket)}</span>
        </div>
        <div className="live-divider" />
        <div className="live-stat">
          <span className="live-label">Potential Saving</span>
          <span className="live-value text-mono text-success">{formatBDT(liveSummary.totalPotentialSaving)}</span>
        </div>
        <div className="live-divider" />
        <div className="live-stat">
          <span className="live-label">Overprice</span>
          <span className={`live-value text-mono ${liveSummary.overpaymentPercent > 5 ? 'text-danger' : ''}`}>
            {formatVariance(liveSummary.overpaymentPercent)}
          </span>
        </div>
        <div className="live-divider" />
        <div className="live-stat">
          <span className="live-label"><FiAlertOctagon size={14} /></span>
          <span className="live-value text-danger">{liveSummary.counts.overpriced}</span>
        </div>
        <div className="live-stat">
          <span className="live-label"><FiAlertTriangle size={14} /></span>
          <span className="live-value text-warning">{liveSummary.counts.slightlyHigh}</span>
        </div>
        <div className="live-stat">
          <span className="live-label"><FiCheckCircle size={14} /></span>
          <span className="live-value">{liveSummary.counts.fair}</span>
        </div>
        <div className="live-stat">
          <span className="live-label"><HiShieldCheck size={14} /></span>
          <span className="live-value text-success">{liveSummary.counts.goodDeal}</span>
        </div>
      </motion.div>

      {/* Bulk Search Bar */}
      <motion.div
        className="bulk-search-bar"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="bulk-search-info">
          <FiZap size={16} />
          <span>
            Auto-search market prices for all {lineItems.length} items at once
            <span className="bulk-search-hint"> (uses {lineItems.length} API searches)</span>
          </span>
        </div>
        <button
          className={`btn ${bulkSearching ? 'btn-ghost' : 'btn-primary'} btn-sm`}
          onClick={handleBulkSearch}
          disabled={bulkSearching}
        >
          {bulkSearching ? (
            <>
              <FiLoader size={14} className="bulk-spinner" />
              Searching {bulkProgress.current}/{bulkProgress.total}...
            </>
          ) : (
            <><FiSearch size={14} /> Search All Prices</>
          )}
        </button>
      </motion.div>

      {/* Item Cards */}
      <div className="analysis-items">
        {lineItems.map((item, index) => (
          <MarketPriceCard key={item.id} item={item} index={index} />
        ))}
      </div>

      {/* Action Bar */}
      <motion.div
        className="analysis-action-bar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button className="btn btn-secondary btn-lg" onClick={handleBack}>
          <FiArrowLeft size={18} /> Back to Input
        </button>
        <button className="btn btn-success btn-lg" onClick={handleGenerate}>
          <FiBarChart2 size={18} /> Generate CST Report
        </button>
      </motion.div>
    </div>
  );
}
