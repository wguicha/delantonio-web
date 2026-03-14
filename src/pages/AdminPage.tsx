import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function AdminPage() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <main className="min-h-screen bg-rock-black pt-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1
            className="text-rock-white"
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: '2.5rem',
              letterSpacing: '0.1em',
            }}
          >
            PANEL DE <span style={{ color: '#dc2626' }}>ADMINISTRACIÓN</span>
          </h1>
          <button
            onClick={handleLogout}
            className="border border-rock-border text-rock-metal-light hover:text-rock-white hover:border-rock-red px-4 py-2 text-sm transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
        <p className="text-rock-metal-light">
          Panel de administración — Próximamente: gestión de pedidos y menú en tiempo real.
        </p>
      </div>
    </main>
  );
}
