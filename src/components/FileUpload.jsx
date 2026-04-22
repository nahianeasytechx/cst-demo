import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFile, FiX, FiInfo, FiLoader, FiCheck, FiAlertCircle, FiEye } from 'react-icons/fi';
import { extractText, isOcrSupported } from '../services/ocrProvider';
import { parseQuotation } from '../services/textParser';
import './FileUpload.css';

export default function FileUpload({ onTextExtracted, onOcrData }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [ocrState, setOcrState] = useState('idle'); // idle | scanning | done | error
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    setUploadedFile({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type,
      raw: file,
    });

    // If it's a supported image, auto-run OCR
    if (isOcrSupported(file)) {
      await runOcr(file);
    } else {
      // PDF or unsupported — just store the file info
      if (onTextExtracted) {
        onTextExtracted(null, file.name);
      }
    }
  };

  const runOcr = async (file) => {
    setOcrState('scanning');
    setOcrProgress(0);
    setOcrResult(null);

    try {
      const { text, confidence } = await extractText(file, (progress) => {
        setOcrProgress(progress);
      });

      if (!text || text.trim().length < 10) {
        setOcrState('error');
        setOcrResult({ error: 'Could not extract meaningful text from this image. Try a clearer photo.' });
        return;
      }

      const parsed = parseQuotation(text);
      setOcrState('done');
      setOcrResult({ ...parsed, ocrConfidence: confidence });
      setShowPreview(true);

      if (onTextExtracted) {
        onTextExtracted(text, file.name);
      }
    } catch (error) {
      console.error('OCR failed:', error);
      setOcrState('error');
      setOcrResult({ error: error.message || 'OCR processing failed' });
    }
  };

  const handleApplyOcrData = () => {
    if (ocrResult && onOcrData) {
      onOcrData(ocrResult);
      setShowPreview(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setOcrState('idle');
    setOcrProgress(0);
    setOcrResult(null);
    setShowPreview(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="file-upload-wrapper">
      <motion.div
        className={`file-upload-zone ${isDragging ? 'dragging' : ''} ${uploadedFile ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploadedFile && fileInputRef.current?.click()}
        whileHover={{ scale: uploadedFile ? 1 : 1.005 }}
        whileTap={{ scale: uploadedFile ? 1 : 0.995 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp,.tiff"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="file-upload-input"
        />

        <AnimatePresence mode="wait">
          {uploadedFile ? (
            <motion.div
              className="file-uploaded"
              key="uploaded"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <FiFile size={32} className="file-icon-svg" />
              <div className="file-info">
                <span className="file-name">{uploadedFile.name}</span>
                <span className="file-size">{uploadedFile.size}</span>
              </div>
              <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                <FiX size={14} /> Remove
              </button>
            </motion.div>
          ) : (
            <motion.div
              className="file-placeholder"
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="upload-icon">
                <FiUploadCloud size={48} />
              </div>
              <div className="upload-text">
                <span className="upload-primary">Drop quotation PDF or image here</span>
                <span className="upload-secondary">or click to browse • PDF, PNG, JPG accepted</span>
                <span className="upload-ocr-hint">Images will be auto-scanned with OCR</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* OCR Progress Bar */}
      <AnimatePresence>
        {ocrState === 'scanning' && (
          <motion.div
            className="ocr-progress"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <div className="ocr-progress-header">
              <FiLoader size={16} className="ocr-spinner" />
              <span>Scanning image with OCR...</span>
              <span className="ocr-percent">{ocrProgress}%</span>
            </div>
            <div className="ocr-progress-bar">
              <motion.div
                className="ocr-progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${ocrProgress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OCR Error */}
      {ocrState === 'error' && ocrResult?.error && (
        <motion.div
          className="upload-notice ocr-error"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FiAlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{ocrResult.error}</span>
          {uploadedFile?.raw && isOcrSupported(uploadedFile.raw) && (
            <button className="btn btn-ghost btn-sm" onClick={() => runOcr(uploadedFile.raw)}>
              Retry
            </button>
          )}
        </motion.div>
      )}

      {/* OCR Success - Preview */}
      <AnimatePresence>
        {ocrState === 'done' && ocrResult && showPreview && (
          <motion.div
            className="ocr-preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="ocr-preview-header">
              <div className="ocr-preview-title">
                <FiCheck size={16} />
                <span>OCR Scan Complete</span>
                <span className="ocr-confidence">
                  Confidence: {ocrResult.confidence}%
                </span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPreview(false)}>
                <FiX size={14} />
              </button>
            </div>

            {/* Extracted Vendor Info */}
            {ocrResult.vendorInfo?.vendorName && (
              <div className="ocr-extract-section">
                <span className="ocr-extract-label">Vendor Detected:</span>
                <span className="ocr-extract-value">{ocrResult.vendorInfo.vendorName}</span>
              </div>
            )}
            {ocrResult.vendorInfo?.quotationNumber && (
              <div className="ocr-extract-section">
                <span className="ocr-extract-label">Quote #:</span>
                <span className="ocr-extract-value">{ocrResult.vendorInfo.quotationNumber}</span>
              </div>
            )}

            {/* Extracted Line Items */}
            {ocrResult.lineItems?.length > 0 && (
              <div className="ocr-extract-section">
                <span className="ocr-extract-label">{ocrResult.lineItems.length} item(s) detected:</span>
                <div className="ocr-items-list">
                  {ocrResult.lineItems.slice(0, 5).map((item, i) => (
                    <div key={i} className="ocr-item-row">
                      <span className="ocr-item-name">{item.itemName}</span>
                      <span className="ocr-item-meta">
                        {item.quantity > 1 ? `×${item.quantity}` : ''}
                        {item.unitPrice > 0 ? ` • BDT ${item.unitPrice.toLocaleString()}` : ''}
                      </span>
                    </div>
                  ))}
                  {ocrResult.lineItems.length > 5 && (
                    <div className="ocr-item-more">+{ocrResult.lineItems.length - 5} more</div>
                  )}
                </div>
              </div>
            )}

            {/* Raw text toggle */}
            <details className="ocr-raw-toggle">
              <summary><FiEye size={13} /> View Raw OCR Text</summary>
              <pre className="ocr-raw-text">{ocrResult.rawText}</pre>
            </details>

            {/* Apply button */}
            <div className="ocr-preview-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPreview(false)}>
                Dismiss
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleApplyOcrData}>
                <FiCheck size={14} /> Apply to Form
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fallback notice for non-image files */}
      {uploadedFile && ocrState === 'idle' && (
        <motion.div
          className="upload-notice"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FiInfo size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>PDF uploaded. OCR is available for image files (PNG, JPG). Please enter quotation details manually below.</span>
        </motion.div>
      )}
    </div>
  );
}
