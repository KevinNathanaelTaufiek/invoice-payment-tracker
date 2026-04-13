import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import InvoiceTable from '../components/InvoiceTable';
import { getAll, getSummary, remove } from '../api/invoiceApi';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'UNPAID', label: 'Belum Bayar' },
  { value: 'PAID', label: 'Lunas' },
  { value: 'OVERDUE', label: 'Jatuh Tempo' },
];

export default function InvoiceListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
  });

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debounceRef = useRef(null);

  const fetchData = useCallback(async (currentFilters) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (currentFilters.status) params.status = currentFilters.status;
      if (currentFilters.startDate) params.startDate = currentFilters.startDate;
      if (currentFilters.endDate) params.endDate = currentFilters.endDate;

      const [invRes, sumRes] = await Promise.all([
        getAll(params),
        getSummary(),
      ]);
      setInvoices(invRes.data);
      setSummary(sumRes.data);
    } catch {
      setError('Gagal memuat data. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchData(filters);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [filters, fetchData]);

  const handleDelete = async (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await remove(deleteConfirm);
      setDeleteConfirm(null);
      fetchData(filters);
    } catch {
      alert('Gagal menghapus invoice.');
    } finally {
      setDeleting(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({ status: '', startDate: '', endDate: '' });
  };

  const hasActiveFilters = filters.status || filters.startDate || filters.endDate;

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 animate-fade-up">
          <div>
            <h1 className="font-display text-2xl font-semibold text-navy-900">
              Invoice
            </h1>
            <p className="text-slate-400 font-body text-sm mt-0.5">
              Selamat datang, {user?.name?.split(' ')[0]}. Berikut ringkasan tagihan Anda.
            </p>
          </div>
          <button
            onClick={() => navigate('/invoices/new')}
            className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-body font-medium px-4 py-2.5 rounded-lg text-sm transition-all duration-200 shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 4v16m8-8H4" strokeLinecap="round"/>
            </svg>
            Buat Invoice
          </button>
        </div>

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-up animation-delay-100">
            <SummaryCard
              label="Total Invoice"
              value={summary.totalCount}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              }
            />
            <SummaryCard
              label="Sudah Lunas"
              value={summary.paidCount}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              }
            />
            <SummaryCard
              label="Jatuh Tempo"
              value={summary.overdueCount}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              }
            />
            <SummaryCard
              label="Total Tagihan"
              value={summary.totalAmount}
              isCurrency
              accent
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              }
            />
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white border border-cream-200 rounded-xl px-5 py-4 mb-5 shadow-card animate-fade-up animation-delay-200">
          <div className="flex flex-wrap items-center gap-3">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="font-body text-sm px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg text-navy-800 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="font-body text-sm px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg text-navy-800 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
              />
              <span className="text-slate-300 text-sm">—</span>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="font-body text-sm px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg text-navy-800 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-body text-slate-400 hover:text-slate-600 px-3 py-2 rounded-lg hover:bg-cream-100 transition"
              >
                Reset filter
              </button>
            )}

            <div className="ml-auto text-xs font-body text-slate-400">
              {invoices.length} invoice ditemukan
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-cream-200 rounded-xl px-6 py-5 shadow-card animate-fade-up animation-delay-300">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-body px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-slate-400 font-body text-sm">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Memuat data...
            </div>
          ) : (
            <InvoiceTable
              invoices={invoices}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-navy-950/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full animate-fade-up">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </div>
            <h3 className="font-display text-lg font-semibold text-navy-900 text-center mb-2">
              Hapus Invoice?
            </h3>
            <p className="text-slate-500 font-body text-sm text-center mb-6">
              Tindakan ini tidak dapat dibatalkan. Invoice akan dihapus secara permanen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-cream-200 rounded-lg font-body text-sm text-slate-600 hover:bg-cream-100 transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-body text-sm font-medium transition disabled:opacity-60"
              >
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
