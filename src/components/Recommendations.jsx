import { motion } from 'framer-motion';
import { formatBDT } from '../utils/formatters';
import { FiTarget, FiExternalLink } from 'react-icons/fi';
import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import './Recommendations.css';

export default function Recommendations({ report }) {
  if (!report) return null;

  const { topNegotiationItems, alternativeVendors, negotiationPoints, counterOfferTotal, summary } = report;

  return (
    <motion.div
      className="recommendations"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <h2 className="rec-section-title">
        <FiTarget size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Final Recommendations
      </h2>

      {/* Top Items to Negotiate */}
      {topNegotiationItems && topNegotiationItems.length > 0 && (
        <div className="rec-block">
          <h3 className="rec-block-title">Top Items to Negotiate</h3>
          <div className="negotiate-items">
            {topNegotiationItems.map((item, i) => (
              <motion.div
                key={i}
                className="negotiate-item"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <span className="negotiate-rank">{i + 1}</span>
                <div className="negotiate-info">
                  <strong>{item.name}</strong>
                  <span className="negotiate-detail">
                    Overpriced by <span className="text-danger">{Math.abs(item.overpricePercent).toFixed(1)}%</span>
                    {' • '}Target price: <span className="text-success">{formatBDT(item.targetPrice)}</span>
                  </span>
                </div>
                <span className="negotiate-saving">{formatBDT(item.totalSaving)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Alternative Vendors */}
      {alternativeVendors && alternativeVendors.length > 0 && (
        <div className="rec-block">
          <h3 className="rec-block-title">Alternative Vendors Worth Contacting</h3>
          <div className="alt-vendors">
            {alternativeVendors.map((vendor, i) => (
              <div key={i} className="alt-vendor-row">
                <span className="alt-vendor-rank">{i + 1}</span>
                <strong>{vendor.name}</strong>
                <span className="alt-vendor-reason">
                  Lowest on {vendor.itemsLowest} item{vendor.itemsLowest !== 1 ? 's' : ''} ({vendor.totalItems} listed)
                </span>
                {vendor.url && (
                  <a href={vendor.url} target="_blank" rel="noopener noreferrer" className="alt-vendor-link">
                    Visit <FiExternalLink size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Negotiation Talking Points */}
      {negotiationPoints && negotiationPoints.length > 0 && (
        <div className="rec-block">
          <h3 className="rec-block-title">
            <HiOutlineChatBubbleLeftRight size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Negotiation Talking Points
          </h3>
          <div className="talking-points">
            {negotiationPoints.map((point, i) => (
              <div key={i} className="talking-point">
                <span className="tp-quote">"</span>
                <span>{point}</span>
                <span className="tp-quote">"</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Counter Offer */}
      <motion.div
        className="counter-offer"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="counter-title">Suggested Counter-Offer Total</h3>
        <div className="counter-values">
          <div className="counter-proposed">
            <span className="counter-label">Counter-Offer</span>
            <span className="counter-amount">{formatBDT(counterOfferTotal)}</span>
          </div>
          <div className="counter-vs">vs</div>
          <div className="counter-original">
            <span className="counter-label">Quoted</span>
            <span className="counter-amount-original">{formatBDT(summary?.totalQuoted)}</span>
          </div>
          <div className="counter-saving">
            <span className="counter-label">Saving</span>
            <span className="counter-saving-amount">
              {formatBDT((summary?.totalQuoted || 0) - counterOfferTotal)}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
