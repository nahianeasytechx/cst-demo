import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCST } from '../context/CSTContext';
import { formatDate } from '../utils/formatters';
import { exportProfessionalPDF } from '../utils/pdfGenerator';
import ExecutiveSummary from '../components/ExecutiveSummary';
import ItemAnalysis from '../components/ItemAnalysis';
import Recommendations from '../components/Recommendations';
import ReportActions from '../components/ReportActions';
import { FiArrowLeft, FiFileText } from 'react-icons/fi';
import { HiDocumentReport } from 'react-icons/hi';
import { HiClipboardDocumentList } from 'react-icons/hi2';
import './ReportPage.css';

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentReport, loadReport } = useCST();

  useEffect(() => {
    if (id && (!currentReport || currentReport.id !== id)) {
      loadReport(id);
    }
  }, [id, currentReport, loadReport]);

  const report = currentReport;

  const handleExportPDF = async () => {
    if (!report) return;

    try {
      await exportProfessionalPDF(report);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed. Please try again.');
    }
  };

  const handleNewAnalysis = () => {
    navigate('/new');
  };

  if (!report) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <FiFileText size={48} className="empty-icon-svg" />
          <h2>Report Not Found</h2>
          <p>The report you're looking for doesn't exist or has been deleted.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
            <FiArrowLeft size={18} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page page-container-wide">
      <div className="report-content">
        {/* Report Header */}
        <motion.div
          className="report-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="report-header-top">
            <h1 className="report-title">
              <HiDocumentReport size={26} style={{ color: 'var(--accent-blue)', verticalAlign: 'middle', marginRight: 8 }} />
              Comparative Statement Report (CST)
            </h1>
            <div className="report-header-badge">
              {report.version}
            </div>
          </div>

          <div className="report-meta-grid">
            <div className="report-meta-item">
              <span className="rmi-label">Vendor</span>
              <span className="rmi-value">{report.vendorInfo?.vendorName || 'N/A'}</span>
            </div>
            <div className="report-meta-item">
              <span className="rmi-label">Quotation Ref</span>
              <span className="rmi-value">{report.vendorInfo?.quotationNumber || 'N/A'}</span>
            </div>
            <div className="report-meta-item">
              <span className="rmi-label">Quotation Date</span>
              <span className="rmi-value">{formatDate(report.vendorInfo?.quotationDate)}</span>
            </div>
            <div className="report-meta-item">
              <span className="rmi-label">Report Generated</span>
              <span className="rmi-value">{formatDate(report.generatedAt)}</span>
            </div>
            <div className="report-meta-item">
              <span className="rmi-label">Analyzed By</span>
              <span className="rmi-value">{report.version}</span>
            </div>
            {report.vendorInfo?.paymentTerms && (
              <div className="report-meta-item">
                <span className="rmi-label">Payment Terms</span>
                <span className="rmi-value">{report.vendorInfo.paymentTerms}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Executive Summary */}
        <ExecutiveSummary summary={report.summary} />

        {/* Item-by-Item Analysis */}
        <motion.div
          className="items-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="items-section-title">
            <HiClipboardDocumentList size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Item-by-Item Analysis
          </h2>
          {report.items?.map((item, index) => (
            <ItemAnalysis key={item.id || index} item={item} index={index} />
          ))}
        </motion.div>

        {/* Recommendations */}
        <Recommendations report={report} />
      </div>

      {/* Actions */}
      <ReportActions
        onExportPDF={handleExportPDF}
        onNewAnalysis={handleNewAnalysis}
      />
    </div>
  );
}
