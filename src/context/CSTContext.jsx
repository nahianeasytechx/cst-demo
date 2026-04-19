import { createContext, useContext, useReducer, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateId } from '../utils/formatters';
import { generateFullReport } from '../utils/reportGenerator';

const CSTContext = createContext(null);

const initialState = {
  // Current workflow state
  vendorInfo: {
    vendorName: '',
    vendorAddress: '',
    vendorContact: '',
    quotationNumber: '',
    quotationDate: '',
    validityPeriod: '',
    paymentTerms: '',
    deliveryTerms: '',
  },
  lineItems: [],
  currentReport: null,
  step: 'input', // input | analyze | report
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VENDOR_INFO':
      return { ...state, vendorInfo: { ...state.vendorInfo, ...action.payload } };
    case 'SET_LINE_ITEMS':
      return { ...state, lineItems: action.payload };
    case 'ADD_LINE_ITEM':
      return {
        ...state,
        lineItems: [...state.lineItems, {
          id: generateId(),
          itemName: '',
          sku: '',
          brand: '',
          specs: '',
          unit: 'pcs',
          quantity: 1,
          unitPrice: 0,
          currency: 'BDT',
          marketSources: [],
          ...action.payload,
        }],
      };
    case 'UPDATE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload } : item
        ),
      };
    case 'REMOVE_LINE_ITEM':
      return {
        ...state,
        lineItems: state.lineItems.filter(item => item.id !== action.payload),
      };
    case 'ADD_MARKET_SOURCE':
      return {
        ...state,
        lineItems: state.lineItems.map(item =>
          item.id === action.payload.itemId
            ? {
              ...item,
              marketSources: [...(item.marketSources || []), {
                seller: '',
                price: 0,
                url: '',
                stock: 'In Stock',
                ...action.payload.source,
              }],
            }
            : item
        ),
      };
    case 'UPDATE_MARKET_SOURCE':
      return {
        ...state,
        lineItems: state.lineItems.map(item =>
          item.id === action.payload.itemId
            ? {
              ...item,
              marketSources: item.marketSources.map((s, i) =>
                i === action.payload.sourceIndex ? { ...s, ...action.payload.source } : s
              ),
            }
            : item
        ),
      };
    case 'REMOVE_MARKET_SOURCE':
      return {
        ...state,
        lineItems: state.lineItems.map(item =>
          item.id === action.payload.itemId
            ? {
              ...item,
              marketSources: item.marketSources.filter((_, i) => i !== action.payload.sourceIndex),
            }
            : item
        ),
      };
    case 'SET_CURRENT_REPORT':
      return { ...state, currentReport: action.payload };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'RESET':
      return { ...initialState, lineItems: [] };
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function CSTProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [savedReports, setSavedReports] = useLocalStorage('cst-reports', []);

  const generateReport = useCallback(() => {
    const report = generateFullReport(state.vendorInfo, state.lineItems);
    report.id = generateId();
    dispatch({ type: 'SET_CURRENT_REPORT', payload: report });

    // Save to localStorage
    setSavedReports(prev => [report, ...prev].slice(0, 20));

    return report;
  }, [state.vendorInfo, state.lineItems, setSavedReports]);

  const loadReport = useCallback((reportId) => {
    const report = savedReports.find(r => r.id === reportId);
    if (report) {
      dispatch({ type: 'SET_CURRENT_REPORT', payload: report });
    }
    return report;
  }, [savedReports]);

  const deleteReport = useCallback((reportId) => {
    setSavedReports(prev => prev.filter(r => r.id !== reportId));
  }, [setSavedReports]);

  const value = {
    ...state,
    dispatch,
    savedReports,
    generateReport,
    loadReport,
    deleteReport,
  };

  return (
    <CSTContext.Provider value={value}>
      {children}
    </CSTContext.Provider>
  );
}

export function useCST() {
  const context = useContext(CSTContext);
  if (!context) {
    throw new Error('useCST must be used within a CSTProvider');
  }
  return context;
}
