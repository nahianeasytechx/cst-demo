import { motion, AnimatePresence } from 'framer-motion';
import { useCST } from '../context/CSTContext';
import { formatBDT } from '../utils/formatters';
import { FiPackage, FiPlus, FiX } from 'react-icons/fi';
import './LineItemTable.css';

export default function LineItemTable() {
  const { lineItems, dispatch } = useCST();

  const addItem = () => {
    dispatch({ type: 'ADD_LINE_ITEM', payload: {} });
  };

  const updateItem = (id, field, value) => {
    dispatch({
      type: 'UPDATE_LINE_ITEM',
      payload: { id, [field]: value },
    });
  };

  const removeItem = (id) => {
    dispatch({ type: 'REMOVE_LINE_ITEM', payload: id });
  };

  const totalValue = lineItems.reduce(
    (sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0),
    0
  );

  return (
    <div className="line-item-section">
      <div className="line-item-header">
        <h3 className="line-item-title">
          <FiPackage size={20} style={{ color: 'var(--accent-blue)' }} />
          Line Items
        </h3>
        <div className="line-item-meta">
          <span className="item-count">{lineItems.length} item{lineItems.length !== 1 ? 's' : ''}</span>
          {totalValue > 0 && (
            <span className="item-total">Total: <strong>{formatBDT(totalValue)}</strong></span>
          )}
        </div>
      </div>

      <div className="line-items-container">
        <AnimatePresence>
          {lineItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="line-item-card"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              layout
            >
              <div className="item-card-header">
                <span className="item-number">#{index + 1}</span>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeItem(item.id)}
                  title="Remove item"
                >
                  <FiX size={14} />
                </button>
              </div>

              <div className="item-card-grid">
                <div className="form-group item-name-field">
                  <label className="form-label">Item Name *</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Full product/service description"
                    value={item.itemName || ''}
                    onChange={(e) => updateItem(item.id, 'itemName', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SKU / Model No.</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Product code"
                    value={item.sku || ''}
                    onChange={(e) => updateItem(item.id, 'sku', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Manufacturer"
                    value={item.brand || ''}
                    onChange={(e) => updateItem(item.id, 'brand', e.target.value)}
                  />
                </div>

                <div className="form-group item-specs-field">
                  <label className="form-label">Specifications</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Size, capacity, grade, color, etc."
                    value={item.specs || ''}
                    onChange={(e) => updateItem(item.id, 'specs', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select
                    className="form-select"
                    value={item.unit || 'pcs'}
                    onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                  >
                    <option value="pcs">pcs</option>
                    <option value="sets">sets</option>
                    <option value="kg">kg</option>
                    <option value="sqft">sqft</option>
                    <option value="ltr">ltr</option>
                    <option value="box">box</option>
                    <option value="roll">roll</option>
                    <option value="meter">meter</option>
                    <option value="lot">lot</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    placeholder="0"
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit Price (BDT) *</label>
                  <input
                    className="form-input price-input"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={item.unitPrice || ''}
                    onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Line Total</label>
                  <div className="line-total-display">
                    {formatBDT((Number(item.unitPrice) || 0) * (Number(item.quantity) || 0))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.button
        className="btn btn-secondary add-item-btn"
        onClick={addItem}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <FiPlus size={18} /> Add Line Item
      </motion.button>
    </div>
  );
}
