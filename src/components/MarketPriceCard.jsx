import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCST } from '../context/CSTContext';
import { analyzeItem } from '../utils/priceAnalysis';
import { formatBDT, formatVariance } from '../utils/formatters';
import { searchPrices } from '../services/priceProvider';
import { FiDollarSign, FiPlus, FiX, FiSearch, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { HiLightBulb } from 'react-icons/hi';
import StatusBadge from './StatusBadge';
import SearchResults from './SearchResults';
import './MarketPriceCard.css';

export default function MarketPriceCard({ item, index }) {
  const { vendorInfo, dispatch } = useCST();
  const analyzed = analyzeItem(item);

  const [searchState, setSearchState] = useState('idle'); // idle | loading | done | error
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [showResults, setShowResults] = useState(false);

  const addSource = () => {
    dispatch({
      type: 'ADD_MARKET_SOURCE',
      payload: { itemId: item.id, source: {} },
    });
  };

  const updateSource = (sourceIndex, field, value) => {
    dispatch({
      type: 'UPDATE_MARKET_SOURCE',
      payload: {
        itemId: item.id,
        sourceIndex,
        source: { [field]: value },
      },
    });
  };

  const removeSource = (sourceIndex) => {
    dispatch({
      type: 'REMOVE_MARKET_SOURCE',
      payload: { itemId: item.id, sourceIndex },
    });
  };

  const handleSearch = async () => {
    const vendorName = vendorInfo?.vendorName || '';
    const query = [vendorName, item.itemName, item.brand, item.specs]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (!query) {
      setSearchState('error');
      setSearchError('Please enter an item name first.');
      return;
    }

    setSearchState('loading');
    setSearchError('');
    setSearchResults([]);

    try {
      const { results } = await searchPrices(query + ' price');
      setSearchResults(results);
      setSearchState('done');
      setShowResults(true);
    } catch (error) {
      setSearchState('error');
      if (error.message === 'BRIGHTDATA_KEY_MISSING') {
        setSearchError('BRIGHTDATA_KEY_MISSING');
      } else if (error.message === 'BRIGHTDATA_KEY_INVALID') {
        setSearchError('Invalid API key. Check your Bright Data API key in environment variables.');
      } else if (error.message === 'BRIGHTDATA_RATE_LIMIT') {
        setSearchError('Rate limit reached. Try again later.');
      } else {
        setSearchError(error.message || 'Search failed. Please try again.');
      }
    }
  };

  const handleAddSearchResults = (selectedResults) => {
    selectedResults.forEach(result => {
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
  };

  const hasAnalysis = analyzed.medianMarketPrice > 0;

  return (
    <motion.div
      className="market-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      {/* Card Header */}
      <div className="market-card-header">
        <div className="market-card-title-row">
          <span className="market-card-number">#{index + 1}</span>
          <div className="market-card-info">
            <h4 className="market-card-name">{item.itemName || 'Unnamed Item'}</h4>
            <p className="market-card-specs">
              {[item.brand, item.sku, item.specs].filter(Boolean).join(' • ') || 'No specifications'}
            </p>
          </div>
        </div>
        <div className="market-card-price-tag">
          <span className="price-label">Quoted</span>
          <span className="price-value">{formatBDT(item.unitPrice)}</span>
          <span className="price-qty">× {item.quantity} {item.unit}</span>
        </div>
      </div>

      {/* Market Sources */}
      <div className="market-sources">
        <div className="sources-header">
          <span className="sources-title">
            <FiDollarSign size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Market Price Sources
          </span>
          <span className="sources-count">{(item.marketSources || []).length} source(s)</span>
        </div>

        <AnimatePresence>
          {(item.marketSources || []).map((source, sIdx) => (
            <motion.div
              key={sIdx}
              className="source-row"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <input
                className="form-input source-seller"
                type="text"
                placeholder="Seller name"
                value={source.seller || ''}
                onChange={(e) => updateSource(sIdx, 'seller', e.target.value)}
              />
              <input
                className="form-input source-price"
                type="number"
                placeholder="Price (BDT)"
                value={source.price || ''}
                onChange={(e) => updateSource(sIdx, 'price', e.target.value)}
              />
              <input
                className="form-input source-url"
                type="text"
                placeholder="Product URL"
                value={source.url || ''}
                onChange={(e) => updateSource(sIdx, 'url', e.target.value)}
              />
              <select
                className="form-select source-stock"
                value={source.stock || 'In Stock'}
                onChange={(e) => updateSource(sIdx, 'stock', e.target.value)}
              >
                <option value="In Stock">In Stock</option>
                <option value="Pre-order">Pre-order</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
              <button
                className="btn btn-danger btn-icon btn-sm"
                onClick={() => removeSource(sIdx)}
                title="Remove source"
              >
                <FiX size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="source-actions-row">
          <button className="btn btn-ghost add-source-btn" onClick={addSource}>
            <FiPlus size={14} /> Add Manually
          </button>
          <button
            className={`btn ${searchState === 'loading' ? 'btn-ghost' : 'btn-primary'} search-prices-btn btn-sm`}
            onClick={handleSearch}
            disabled={searchState === 'loading'}
          >
            {searchState === 'loading' ? (
              <><FiLoader size={14} className="search-spinner" /> Searching...</>
            ) : (
              <><FiSearch size={14} /> Search Market Prices</>
            )}
          </button>
        </div>

        {/* Search Error */}
        {searchState === 'error' && searchError && (
          <motion.div
            className="search-error"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiAlertCircle size={14} />
            {searchError === 'BRIGHTDATA_KEY_MISSING' ? (
              <span>API key not configured on server. Add <code>BRIGHTDATA_KEY</code> to your Vercel environment variables.</span>
            ) : (
              <span>{searchError}</span>
            )}
          </motion.div>
        )}

        {/* Search Results */}
        <AnimatePresence>
          {showResults && searchState === 'done' && (
            <SearchResults
              results={searchResults}
              vendorPrice={item.unitPrice}
              onAddSelected={handleAddSearchResults}
              onClose={() => setShowResults(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Analysis Results */}
      {hasAnalysis && (
        <motion.div
          className="analysis-results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="analysis-grid">
            <div className="analysis-metric">
              <span className="metric-label">Lowest</span>
              <span className="metric-value text-success">{formatBDT(analyzed.lowestMarketPrice)}</span>
            </div>
            <div className="analysis-metric">
              <span className="metric-label">Median</span>
              <span className="metric-value">{formatBDT(analyzed.medianMarketPrice)}</span>
            </div>
            <div className="analysis-metric">
              <span className="metric-label">Highest</span>
              <span className="metric-value">{formatBDT(analyzed.highestMarketPrice)}</span>
            </div>
            <div className="analysis-metric">
              <span className="metric-label">Variance</span>
              <span className={`metric-value ${analyzed.variance > 5 ? 'text-danger' : analyzed.variance < -5 ? 'text-success' : ''}`}>
                {formatVariance(analyzed.variance)}
              </span>
            </div>
            <div className="analysis-metric">
              <span className="metric-label">Status</span>
              <StatusBadge flag={analyzed.statusFlag} size="sm" />
            </div>
            <div className="analysis-metric">
              <span className="metric-label">Saving/Unit</span>
              <span className="metric-value text-success">{formatBDT(analyzed.savingPerUnit)}</span>
            </div>
          </div>

          {analyzed.savingTotal > 0 && (
            <div className="total-saving-bar">
              <span><HiLightBulb size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />Potential Total Saving:</span>
              <strong>{formatBDT(analyzed.savingTotal)}</strong>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
