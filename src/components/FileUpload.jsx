import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFile, FiX, FiInfo } from 'react-icons/fi';
import './FileUpload.css';

export default function FileUpload({ onTextExtracted }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
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

  const handleFile = (file) => {
    setUploadedFile({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type,
    });

    if (onTextExtracted) {
      onTextExtracted(null, file.name);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
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
          accept=".pdf,.png,.jpg,.jpeg,.webp"
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {uploadedFile && (
        <motion.div
          className="upload-notice"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FiInfo size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>File uploaded. Please enter quotation details manually below, or use the demo data to see a full analysis.</span>
        </motion.div>
      )}
    </div>
  );
}
