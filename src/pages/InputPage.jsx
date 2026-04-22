import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCST } from '../context/CSTContext';
import FileUpload from '../components/FileUpload';
import VendorForm from '../components/VendorForm';
import LineItemTable from '../components/LineItemTable';
import { FiEdit3, FiArrowRight, FiFile } from 'react-icons/fi';
import { RiFileAddLine } from 'react-icons/ri';
import './InputPage.css';

export default function InputPage() {
  const { vendorInfo, lineItems, dispatch } = useCST();
  const [activeTab, setActiveTab] = useState('upload');
  const navigate = useNavigate();



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
                  onOcrData={(ocrResult) => {
                    // Apply extracted vendor info
                    if (ocrResult.vendorInfo) {
                      const vi = ocrResult.vendorInfo;
                      const updates = {};
                      if (vi.vendorName) updates.vendorName = vi.vendorName;
                      if (vi.vendorAddress) updates.vendorAddress = vi.vendorAddress;
                      if (vi.vendorContact) updates.vendorContact = vi.vendorContact;
                      if (vi.quotationNumber) updates.quotationNumber = vi.quotationNumber;
                      if (vi.quotationDate) updates.quotationDate = vi.quotationDate;
                      if (vi.validityPeriod) updates.validityPeriod = vi.validityPeriod;
                      if (vi.paymentTerms) updates.paymentTerms = vi.paymentTerms;
                      if (vi.deliveryTerms) updates.deliveryTerms = vi.deliveryTerms;
                      if (Object.keys(updates).length > 0) {
                        dispatch({ type: 'SET_VENDOR_INFO', payload: updates });
                      }
                    }
                    // Apply extracted line items
                    if (ocrResult.lineItems && ocrResult.lineItems.length > 0) {
                      const existingIds = new Set(lineItems.map(i => i.id));
                      ocrResult.lineItems.forEach(item => {
                        if (!existingIds.has(item.id)) {
                          dispatch({ type: 'ADD_LINE_ITEM', payload: item });
                        }
                      });
                    }
                  }}
                />
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
