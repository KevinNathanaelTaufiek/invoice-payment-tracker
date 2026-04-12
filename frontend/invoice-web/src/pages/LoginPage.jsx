import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/invoices');
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-[46%] bg-navy-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, #c9963a 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, #172447 0%, transparent 50%)`,
          }}
        />
        <div className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg, transparent, transparent 39px,
              rgba(201,150,58,0.06) 39px, rgba(201,150,58,0.06) 40px
            ), repeating-linear-gradient(
              90deg, transparent, transparent 39px,
              rgba(201,150,58,0.06) 39px, rgba(201,150,58,0.06) 40px
            )`,
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gold flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" fill="white" rx="1"/>
                <rect x="9" y="1" width="6" height="4" fill="white" rx="1"/>
                <rect x="1" y="9" width="6" height="6" fill="white" rx="1" opacity="0.5"/>
                <rect x="9" y="7" width="6" height="8" fill="white" rx="1"/>
              </svg>
            </div>
            <span className="font-display text-white text-lg font-semibold tracking-wide">
              InvoiceTrack
            </span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-6">
          <p className="font-display text-5xl font-medium text-white leading-tight">
            Kelola tagihan<br />
            <span className="text-gold-light">lebih rapi,</span><br />
            lebih mudah.
          </p>
          <p className="text-slate-400 font-body text-base leading-relaxed max-w-xs">
            Platform invoice profesional untuk UMKM Indonesia. Buat, lacak, dan kelola pembayaran dari satu tempat.
          </p>

          {/* Stats row */}
          <div className="flex gap-6 pt-4">
            {[
              { label: 'Invoice dibuat', value: '2.400+' },
              { label: 'Klien terlayani', value: '180+' },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-2xl font-semibold text-white">{s.value}</div>
                <div className="text-slate-500 text-xs font-body mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 border-t border-white/10 pt-6">
          <p className="text-slate-400 text-sm font-body italic">
            "Sejak pakai InvoiceTrack, tagihan saya tidak pernah terlewat lagi."
          </p>
          <p className="text-slate-500 text-xs mt-2">— Reza, Freelance Designer</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-cream-100 p-8">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded bg-navy-900 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" fill="white" rx="1"/>
                <rect x="9" y="1" width="6" height="4" fill="white" rx="1"/>
                <rect x="1" y="9" width="6" height="6" fill="white" rx="1" opacity="0.5"/>
                <rect x="9" y="7" width="6" height="8" fill="white" rx="1"/>
              </svg>
            </div>
            <span className="font-display text-navy-900 text-base font-semibold">InvoiceTrack</span>
          </div>

          <h1 className="font-display text-3xl font-semibold text-navy-900 mb-1">
            Selamat datang
          </h1>
          <p className="text-slate-500 font-body text-sm mb-8">
            Masuk ke akun Anda untuk melanjutkan.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-body font-medium text-navy-700 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="nama@email.com"
                className="w-full px-4 py-3 bg-white border border-cream-200 rounded-lg font-body text-sm text-navy-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
              />
            </div>

            <div>
              <label className="block text-xs font-body font-medium text-navy-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white border border-cream-200 rounded-lg font-body text-sm text-navy-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-body px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-body font-medium py-3 rounded-lg transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Masuk...
                </span>
              ) : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-sm font-body text-slate-500 mt-6">
            Belum punya akun?{' '}
            <Link to="/register" className="text-gold font-medium hover:text-gold-dark transition">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
