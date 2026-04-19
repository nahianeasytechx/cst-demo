import { motion } from 'framer-motion';
import { formatBDT, formatVariance } from '../utils/formatters';
import { FiExternalLink, FiPhone, FiFileText } from 'react-icons/fi';
import { HiMiniMagnifyingGlass } from 'react-icons/hi2';
import StatusBadge from './StatusBadge';
import './ItemAnalysis.css';

export default function ItemAnalysis({ item, index }) {
  return (
    <motion.div
      className="item-analysis"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <div className="ia-header">
        <div className="ia-title-section">
          <span className="ia-badge">
            <HiMiniMagnifyingGlass size={14} style={{ marginRight: 4 }} />
            Item {index + 1}
          </span>
          <h3 className="ia-title">{item.itemName || 'Unnamed Item'}</h3>
          <p className="ia-specs">
            <strong>Specifications:</strong> {[item.brand, item.sku, item.specs].filter(Boolean).join(', ') || 'N/A'}
          </p>
          <p className="ia-qty">
            <strong>Quantity:</strong> {item.quantity} {item.unit}
          </p>
        </div>
        <StatusBadge flag={item.statusFlag} />
      </div>

      {/* Price Comparison Table */}
      <div className="ia-comparison">
        <table className="data-table">
          <thead>
            <tr>
              <th>Price Comparison</th>
              <th>Amount (BDT)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Vendor Quoted (Unit)</td>
              <td className="text-mono">{formatBDT(item.unitPrice)}</td>
            </tr>
            <tr>
              <td>Lowest Market Price</td>
              <td className="text-mono text-success">{formatBDT(item.lowestMarketPrice)}</td>
            </tr>
            <tr>
              <td>Median Market Price</td>
              <td className="text-mono">{formatBDT(item.medianMarketPrice)}</td>
            </tr>
            <tr>
              <td>Highest Market Price</td>
              <td className="text-mono">{formatBDT(item.highestMarketPrice)}</td>
            </tr>
            <tr className="highlight-row">
              <td><strong>Variance</strong></td>
              <td className={`text-mono ${item.variance > 5 ? 'text-danger' : item.variance < -5 ? 'text-success' : ''}`}>
                <strong>{formatVariance(item.variance)}</strong>
              </td>
            </tr>
            <tr>
              <td>Potential Saving / Unit</td>
              <td className="text-mono text-success">{formatBDT(item.savingPerUnit)}</td>
            </tr>
            <tr className="highlight-row">
              <td><strong>Potential Saving Total</strong></td>
              <td className="text-mono text-success"><strong>{formatBDT(item.savingTotal)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Market Sources */}
      {item.marketSources && item.marketSources.length > 0 && (
        <div className="ia-sources">
          <h4 className="ia-sources-title">
            <FiExternalLink size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Market Price Sources
          </h4>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Seller</th>
                <th>Price (BDT)</th>
                <th>Stock</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {item.marketSources.map((source, sIdx) => (
                <tr key={sIdx}>
                  <td className="text-muted">{sIdx + 1}</td>
                  <td>{source.seller || 'N/A'}</td>
                  <td className="text-mono">{formatBDT(source.price)}</td>
                  <td>
                    <span className={`stock-indicator ${source.stock === 'In Stock' ? 'in-stock' : 'other-stock'}`}>
                      {source.stock || 'N/A'}
                    </span>
                  </td>
                  <td>
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="source-link">
                        Visit <FiExternalLink size={12} />
                      </a>
                    ) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Best Contact */}
      {item.marketSources && item.marketSources.length > 0 && (
        <div className="ia-best-contact">
          <FiPhone size={15} style={{ flexShrink: 0 }} />
          <div>
            <span className="best-contact-label">Best Contact for Cheapest Price: </span>
            <strong>
              {item.marketSources.reduce((best, s) => (Number(s.price) < Number(best.price) ? s : best), item.marketSources[0]).seller}
            </strong>
            {' — '}
            <a
              href={item.marketSources.reduce((best, s) => (Number(s.price) < Number(best.price) ? s : best), item.marketSources[0]).url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Link <FiExternalLink size={12} />
            </a>
          </div>
        </div>
      )}

      {/* Notes */}
      {item.variance > 5 && (
        <div className="ia-notes">
          <FiFileText size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <p>
            Vendor price is <strong>{Math.abs(item.variance).toFixed(1)}% above market median</strong>.
            {item.marketSources && item.marketSources.length > 2 &&
              ` All ${item.marketSources.length} online sellers have it at lower rates.`
            }
            {item.savingTotal > 0 && ` Potential total saving of ${formatBDT(item.savingTotal)}.`}
            {item.variance > 15 ? ' Strong negotiation case.' : ' Worth negotiating.'}
          </p>
        </div>
      )}
    </motion.div>
  );
}
