import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCST } from '../context/CSTContext';
import FileUpload from '../components/FileUpload';
import VendorForm from '../components/VendorForm';
import LineItemTable from '../components/LineItemTable';
import { demoVendorInfo, demoLineItems } from '../utils/demoData';
import { FiDownload, FiClipboard, FiEdit3, FiPlay, FiTrash2, FiArrowRight, FiFile, FiInfo } from 'react-icons/fi';
import { RiFileAddLine } from 'react-icons/ri';
import './InputPage.css';

export default function InputPage() {
  const { vendorInfo, lineItems, dispatch } = useCST();
  const [activeTab, setActiveTab] = useState('upload');
  const [pastedText, setPastedText] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      loadDemo();
    }
  }, [searchParams]);

  const loadDemo = () => {
    dispatch({ type: 'SET_VENDOR_INFO', payload: demoVendorInfo });
    dispatch({ type: 'SET_LINE_ITEMS', payload: demoLineItems });
  };

  const handleVendorChange = (updates) => {
    dispatch({ type: 'SET_VENDOR_INFO', payload: updates });
  };

  const handleProceed = () => {
    if (lineItems.length === 0) {
      alert('Please add at least one line item before proceeding.');
      return;
    }
    if (!vendorInfo.vendorName) {
      alert('Please enter the vendor name.');
      return;
    }
    navigate('/analyze');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      dispatch({ type: 'RESET' });
      setPastedText('');
    }
  };

  const canProceed = lineItems.length > 0 && vendorInfo.vendorName;

  return (
    <div className="input-page page-container-wide">
      {/* Header */}
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>
          <span className="header-icon"><RiFileAddLine size={28} /></span>
          New Quotation Analysis
        </h1>
        <p>Upload or enter vendor quotation details to begin your CST analysis.</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="input-quick-actions"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <button className="btn btn-secondary" onClick={loadDemo}>
          <FiPlay size={15} /> Load Demo Data
        </button>
        <button className="btn btn-ghost" onClick={handleReset}>
          <FiTrash2 size={15} /> Clear All
        </button>
      </motion.div>

      {/* Input Method Tabs */}
      <motion.div
        className="input-method-section"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="card">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <FiFile size={15} /> Upload PDF / Image
            </button>
            <button
              className={`tab ${activeTab === 'paste' ? 'active' : ''}`}
              onClick={() => setActiveTab('paste')}
            >
              <FiClipboard size={15} /> Paste Text
            </button>
            <button
              className={`tab ${activeTab === 'manual' ? 'active' : ''}`}
              onClick={() => setActiveTab('manual')}
            >
              <FiEdit3 size={15} /> Manual Entry
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
              >
                <FileUpload
                  onTextExtracted={(text, fileName) => {
                    console.log('File uploaded:', fileName);
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'paste' && (
              <motion.div
                key="paste"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="paste-section"
              >
                <div className="form-group">
                  <label className="form-label">Paste quotation text below</label>
                  <textarea
                    className="form-textarea paste-area"
                    rows={8}
                    placeholder="Paste the full quotation text here...&#10;&#10;Example:&#10;Item 1: Dell Latitude 5450 - Qty: 5 - Unit Price: BDT 128,000&#10;Item 2: HP LaserJet M404dn - Qty: 3 - Unit Price: BDT 32,000"
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                  />
                </div>
                <div className="paste-notice">
                  <FiInfo size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>After pasting, manually fill in the structured fields below for accurate analysis.</span>
                </div>
              </motion.div>
            )}

            {activeTab === 'manual' && (
              <motion.div
                key="manual"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="manual-section"
              >
                <div className="manual-notice">
                  <FiEdit3 size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Fill in the vendor information and line items directly below.</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Vendor Info */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <VendorForm vendorInfo={vendorInfo} onChange={handleVendorChange} />
      </motion.div>

      {/* Line Items */}
      <motion.div
        className="card mt-lg"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <LineItemTable />
      </motion.div>

      {/* Proceed Bar */}
      <motion.div
        className="proceed-bar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <div className="proceed-info">
          <span className="proceed-count">
            {lineItems.length} item{lineItems.length !== 1 ? 's' : ''} ready
          </span>
          {vendorInfo.vendorName && (
            <span className="proceed-vendor">from {vendorInfo.vendorName}</span>
          )}
        </div>
        <div className="proceed-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleProceed}
            disabled={!canProceed}
          >
            Proceed to Market Research <FiArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
