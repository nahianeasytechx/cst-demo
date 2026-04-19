import { motion } from 'framer-motion';
import { HiBuildingOffice2 } from 'react-icons/hi2';
import './VendorForm.css';

export default function VendorForm({ vendorInfo, onChange }) {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <motion.div
      className="vendor-form"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="vendor-form-title">
        <HiBuildingOffice2 size={20} style={{ color: 'var(--accent-blue)' }} />
        Vendor Information
      </h3>

      <div className="vendor-form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="vendorName">Vendor Name *</label>
          <input
            id="vendorName"
            className="form-input"
            type="text"
            placeholder="e.g., TechSupply Bangladesh Ltd."
            value={vendorInfo.vendorName}
            onChange={(e) => handleChange('vendorName', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="vendorContact">Contact</label>
          <input
            id="vendorContact"
            className="form-input"
            type="text"
            placeholder="Phone or email"
            value={vendorInfo.vendorContact}
            onChange={(e) => handleChange('vendorContact', e.target.value)}
          />
        </div>

        <div className="form-group span-2">
          <label className="form-label" htmlFor="vendorAddress">Address</label>
          <input
            id="vendorAddress"
            className="form-input"
            type="text"
            placeholder="Full address"
            value={vendorInfo.vendorAddress}
            onChange={(e) => handleChange('vendorAddress', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="quotationNumber">Quotation No.</label>
          <input
            id="quotationNumber"
            className="form-input"
            type="text"
            placeholder="QTN-2026-XXX"
            value={vendorInfo.quotationNumber}
            onChange={(e) => handleChange('quotationNumber', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="quotationDate">Quotation Date</label>
          <input
            id="quotationDate"
            className="form-input"
            type="date"
            value={vendorInfo.quotationDate}
            onChange={(e) => handleChange('quotationDate', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="validityPeriod">Validity</label>
          <input
            id="validityPeriod"
            className="form-input"
            type="text"
            placeholder="e.g., 30 days"
            value={vendorInfo.validityPeriod}
            onChange={(e) => handleChange('validityPeriod', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="paymentTerms">Payment Terms</label>
          <input
            id="paymentTerms"
            className="form-input"
            type="text"
            placeholder="e.g., 50% advance"
            value={vendorInfo.paymentTerms}
            onChange={(e) => handleChange('paymentTerms', e.target.value)}
          />
        </div>

        <div className="form-group span-2">
          <label className="form-label" htmlFor="deliveryTerms">Delivery / Warranty</label>
          <input
            id="deliveryTerms"
            className="form-input"
            type="text"
            placeholder="e.g., Within 7-10 working days, 1 year warranty"
            value={vendorInfo.deliveryTerms}
            onChange={(e) => handleChange('deliveryTerms', e.target.value)}
          />
        </div>
      </div>
    </motion.div>
  );
}
