import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  {
    to: '/invoices',
    label: 'Invoice',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-56 min-h-screen bg-navy-900 flex flex-col py-6 px-4 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="w-7 h-7 rounded bg-gold flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" fill="white" rx="1"/>
            <rect x="9" y="1" width="6" height="4" fill="white" rx="1"/>
            <rect x="1" y="9" width="6" height="6" fill="white" rx="1" opacity="0.5"/>
            <rect x="9" y="7" width="6" height="8" fill="white" rx="1"/>
          </svg>
        </div>
        <span className="font-display text-white font-semibold text-sm tracking-wide">
          InvoiceTrack
        </span>
      </div>

      {/* Nav label */}
      <p className="text-xs font-body font-medium text-navy-600 uppercase tracking-widest px-2 mb-2">
        Menu
      </p>

      {/* Navigation */}
      <nav className="space-y-0.5 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        <NavLink
          to="/invoices/new"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-all duration-150 ${
              isActive
                ? 'bg-white/10 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 4v16m8-8H4" strokeLinecap="round"/>
          </svg>
          Buat Invoice
        </NavLink>
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 pt-4 mt-4">
        <div className="px-2 mb-3">
          <p className="text-xs text-white font-body font-medium truncate">{user?.name}</p>
          <p className="text-xs text-slate-500 font-body truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150 font-body text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Keluar
        </button>
      </div>
    </aside>
  );
}
