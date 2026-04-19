import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CSTProvider } from './context/CSTContext';
import { ThemeProvider } from './hooks/useTheme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import InputPage from './pages/InputPage';
import AnalysisPage from './pages/AnalysisPage';
import ReportPage from './pages/ReportPage';
import ComparePage from './pages/ComparePage';

function App() {
  return (
    <ThemeProvider>
      <CSTProvider>
        <BrowserRouter>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/new" element={<InputPage />} />
              <Route path="/analyze" element={<AnalysisPage />} />
              <Route path="/report/:id" element={<ReportPage />} />
              <Route path="/compare" element={<ComparePage />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </CSTProvider>
    </ThemeProvider>
  );
}

export default App;
