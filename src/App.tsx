import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CookieBanner } from './components/layout/CookieBanner';
import { ProtectedRoute } from './components/router/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { OrderPage } from './pages/OrderPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { LegalPage } from './pages/LegalPage';
import { CookiesPage } from './pages/CookiesPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-rock-black">
        <Routes>
          {/* Admin routes - no header/footer */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Public routes - with header/footer */}
          <Route
            path="/*"
            element={
              <>
                <Header />
                <div className="flex-1 flex flex-col">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/pedir" element={<OrderPage />} />
                    <Route path="/privacidad" element={<PrivacyPage />} />
                    <Route path="/aviso-legal" element={<LegalPage />} />
                    <Route path="/cookies" element={<CookiesPage />} />
                  </Routes>
                </div>
                <Footer />
                <CookieBanner />
              </>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
