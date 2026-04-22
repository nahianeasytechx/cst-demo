import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiPlus, FiExternalLink, FiStar } from 'react-icons/fi';
import { formatBDT } from '../utils/formatters';
import './SearchResults.css';

export default function SearchResults({ results, vendorPrice, onAddSelected, onClose }) {
  const [selected, setSelected] = useState(new Set());

  if (!results || results.length === 0) {
    return (
      <div className="search-results-empty">
        <p>No results found. Try a different search term.</p>
      </div>
    );
  }

  const toggleSelect = (index) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === results.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(results.map((_, i) => i)));
    }
  };

  const handleAddSelected = () => {
    const selectedResults = results
      .filter((_, i) => selected.has(i))
      .map(r => ({
        seller: r.seller,
        price: r.price,
        url: r.url,
        stock: r.stock || 'In Stock',
      }));
    onAddSelected(selectedResults);
    onClose();
  };

  return (
    <motion.div
      className="search-results"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="search-results-header">
        <span className="search-results-count">{results.length} results found</span>
        <div className="search-results-actions">
          <button className="btn btn-ghost btn-sm" onClick={selectAll}>
            {selected.size === results.length ? 'Deselect All' : 'Select All'}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleAddSelected}
            disabled={selected.size === 0}
          >
            <FiPlus size={14} /> Add {selected.size > 0 ? `${selected.size} ` : ''}Selected
          </button>
        </div>
      </div>

      <div className="search-results-list">
        <AnimatePresence>
          {results.map((result, index) => {
            const isSelected = selected.has(index);
            const priceDiff = vendorPrice && result.price > 0
              ? ((result.price - vendorPrice) / vendorPrice * 100)
              : null;

            return (
              <motion.div
                key={index}
                className={`search-result-item ${isSelected ? 'selected' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => toggleSelect(index)}
              >
                <div className="search-result-check">
                  {isSelected ? <FiCheck size={16} /> : <div className="check-empty" />}
                </div>

                {result.thumbnail && (
                  <img
                    src={result.thumbnail}
                    alt=""
                    className="search-result-thumb"
                    loading="lazy"
                  />
                )}

                <div className="search-result-info">
                  <span className="search-result-title">{result.title}</span>
                  <span className="search-result-seller">
                    {result.seller}
                    {result.rating && (
                      <span className="search-result-rating">
                        <FiStar size={11} /> {result.rating}
                        {result.reviews ? ` (${result.reviews.toLocaleString()})` : ''}
                      </span>
                    )}
                  </span>
                </div>

                <div className="search-result-price-col">
                  <span className="search-result-price">
                    {result.priceFormatted || `$${result.price}`}
                  </span>
                  {priceDiff !== null && (
                    <span className={`search-result-diff ${priceDiff < -5 ? 'lower' : priceDiff > 5 ? 'higher' : 'similar'}`}>
                      {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(0)}%
                    </span>
                  )}
                </div>

                {result.url && (
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="search-result-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FiExternalLink size={14} />
                  </a>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
