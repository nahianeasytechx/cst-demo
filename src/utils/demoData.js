/**
 * Demo data for showcasing the CST Analyzer workflow
 */

export const demoVendorInfo = {
  vendorName: 'TechSupply Bangladesh Ltd.',
  vendorAddress: '45/A Pragati Sarani, Gulshan-2, Dhaka-1212',
  vendorContact: '+880-2-9876543',
  quotationNumber: 'QTN-2026-04-0872',
  quotationDate: '2026-04-15',
  validityPeriod: '30 days',
  paymentTerms: '50% advance, 50% on delivery',
  deliveryTerms: 'Within 7-10 working days',
};

export const demoLineItems = [
  {
    id: 'demo-1',
    itemName: 'Dell Latitude 5450 Laptop',
    sku: 'LAT-5450-i7-16-512',
    brand: 'Dell',
    specs: 'Intel Core i7-1365U, 16GB DDR5, 512GB SSD, 14" FHD IPS, Windows 11 Pro',
    unit: 'pcs',
    quantity: 5,
    unitPrice: 128000,
    currency: 'BDT',
    marketSources: [
      { seller: 'Star Tech', price: 115500, url: 'https://startech.com.bd/dell-latitude-5450', stock: 'In Stock' },
      { seller: 'Ryans Computers', price: 118000, url: 'https://ryans.com/dell-latitude-5450', stock: 'In Stock' },
      { seller: 'Techland BD', price: 112000, url: 'https://techlandbd.com/dell-latitude-5450', stock: 'In Stock' },
      { seller: 'Binary Logic', price: 116500, url: 'https://binarylogic.com.bd/dell-latitude-5450', stock: 'Pre-order' },
    ],
  },
  {
    id: 'demo-2',
    itemName: 'HP LaserJet Pro M404dn Printer',
    sku: 'W1A53A',
    brand: 'HP',
    specs: 'Mono Laser, Duplex, Network, 40ppm, USB/Ethernet',
    unit: 'pcs',
    quantity: 3,
    unitPrice: 32000,
    currency: 'BDT',
    marketSources: [
      { seller: 'Star Tech', price: 28500, url: 'https://startech.com.bd/hp-m404dn', stock: 'In Stock' },
      { seller: 'Pickaboo', price: 29200, url: 'https://pickaboo.com/hp-laserjet-m404dn', stock: 'In Stock' },
      { seller: 'Daraz BD', price: 27800, url: 'https://daraz.com.bd/hp-m404dn', stock: 'In Stock' },
    ],
  },
  {
    id: 'demo-3',
    itemName: 'Logitech MK270 Wireless Keyboard & Mouse Combo',
    sku: 'MK270-920-004509',
    brand: 'Logitech',
    specs: 'Full-size Keyboard, Ambidextrous Mouse, 2.4GHz USB Receiver, 3-year battery',
    unit: 'sets',
    quantity: 10,
    unitPrice: 2800,
    currency: 'BDT',
    marketSources: [
      { seller: 'Star Tech', price: 2450, url: 'https://startech.com.bd/logitech-mk270', stock: 'In Stock' },
      { seller: 'Ryans Computers', price: 2500, url: 'https://ryans.com/logitech-mk270', stock: 'In Stock' },
      { seller: 'Daraz BD', price: 2350, url: 'https://daraz.com.bd/logitech-mk270', stock: 'In Stock' },
    ],
  },
  {
    id: 'demo-4',
    itemName: 'APC Back-UPS 1100VA UPS',
    sku: 'BX1100C-IN',
    brand: 'APC',
    specs: '1100VA/660W, 4 Outlets, AVR, USB Charging, Battery Backup',
    unit: 'pcs',
    quantity: 5,
    unitPrice: 9500,
    currency: 'BDT',
    marketSources: [
      { seller: 'Star Tech', price: 8900, url: 'https://startech.com.bd/apc-bx1100', stock: 'In Stock' },
      { seller: 'Techland BD', price: 9200, url: 'https://techlandbd.com/apc-bx1100', stock: 'In Stock' },
      { seller: 'Othoba', price: 9100, url: 'https://othoba.com/apc-ups-1100va', stock: 'In Stock' },
    ],
  },
  {
    id: 'demo-5',
    itemName: 'Cat6 Ethernet Cable (305m Box)',
    sku: 'CAT6-UTP-305',
    brand: 'D-Link',
    specs: 'UTP, 24AWG, 305m/1000ft, PVC Jacket, Blue',
    unit: 'box',
    quantity: 2,
    unitPrice: 12500,
    currency: 'BDT',
    marketSources: [
      { seller: 'Star Tech', price: 8500, url: 'https://startech.com.bd/dlink-cat6-305m', stock: 'In Stock' },
      { seller: 'Ryans Computers', price: 8800, url: 'https://ryans.com/dlink-cat6', stock: 'In Stock' },
      { seller: 'Techland BD', price: 9200, url: 'https://techlandbd.com/cat6-305m', stock: 'In Stock' },
    ],
  },
  {
    id: 'demo-6',
    itemName: 'Samsung 27" Curved Monitor',
    sku: 'LC27F390FHWXXL',
    brand: 'Samsung',
    specs: '27" FHD 1920x1080, VA Panel, 60Hz, HDMI+VGA, Eye Saver Mode',
    unit: 'pcs',
    quantity: 5,
    unitPrice: 22000,
    currency: 'BDT',
    marketSources: [
      { seller: 'Star Tech', price: 19500, url: 'https://startech.com.bd/samsung-c27f390', stock: 'In Stock' },
      { seller: 'Ryans Computers', price: 20200, url: 'https://ryans.com/samsung-curved-27', stock: 'In Stock' },
      { seller: 'Transcom Digital', price: 20800, url: 'https://transcomdigital.com/samsung-27-curved', stock: 'In Stock' },
    ],
  },
];

export function getDemoReport() {
  return {
    vendorInfo: demoVendorInfo,
    lineItems: demoLineItems,
    createdAt: new Date().toISOString(),
  };
}
