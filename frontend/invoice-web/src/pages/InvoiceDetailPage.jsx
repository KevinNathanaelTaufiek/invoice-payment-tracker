import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { getById, updateStatus, remove } from '../api/invoiceApi';
import { formatRupiah, formatDate } from '../utils/format';

const STATUS_TRANSITIONS = {
  UNPAID: ['PAID', 'OVERDUE'],
  OVERDUE: ['PAID', 'UNPAID'],
  PAID: ['UNPAID'],
};

const STATUS_LABELS = {
  PAID: 'Tandai Lunas',
  UNPAID: 'Tandai Belum Bayar',
  OVERDUE: 'Tandai Jatuh Tempo',
};

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getById(id);
        setInvoice(res.data);
      } catch {
        setError('Invoice tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      await updateStatus(id, newStatus);
      setInvoice((prev) => ({ ...prev, status: newStatus }));
    } catch {
      alert('Gagal mengubah status.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await remove(id);
      navigate('/invoices');
    } catch {
      alert('Gagal menghapus invoice.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen text-slate-400 font-body text-sm gap-3">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Memuat invoice...
        </div>
      </Layout>
    );
  }

  if (error || !invoice) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <p className="text-slate-400 font-body">{error || 'Invoice tidak ditemukan.'}</p>
          <button onClick={() => navigate('/invoices')} className="text-sm font-body text-gold hover:underline">
            Kembali ke daftar
          </button>
        </div>
      </Layout>
    );
  }

  const transitions = STATUS_TRANSITIONS[invoice.status] || [];

  return (
    <Layout>
      <div className="p-8 max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 animate-fade-up">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/invoices')}
              className="p-2 rounded-lg hover:bg-cream-200 text-slate-400 hover:text-navy-700 transition mt-0.5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5m0 0l7 7m-7-7l7-7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-mono text-xl font-semibold text-navy-900">
                  {invoice.invoiceNumber}
                </h1>
                <StatusBadge status={invoice.status} />
              </div>
              <p className="text-slate-400 font-body text-sm mt-1">
                Dibuat {formatDate(invoice.issueDate)} · Jatuh tempo {formatDate(invoice.dueDate)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate(`/invoices/${id}/edit`)}
              className="flex items-center gap-1.5 px-3 py-2 border border-cream-200 rounded-lg font-body text-sm text-slate-600 hover:bg-cream-100 transition"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Edit
            </button>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-red-200 rounded-lg font-body text-sm text-red-500 hover:bg-red-50 transition"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Hapus
            </button>
          </div>
        </div>

        {/* Client info */}
        <div className="bg-white border border-cream-200 rounded-xl p-6 shadow-card mb-5 animate-fade-up animation-delay-100">
          <h2 className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider mb-3">Klien</h2>
          <p className="font-display text-lg font-semibold text-navy-900">{invoice.clientName}</p>
          {invoice.clientEmail && (
            <p className="text-slate-500 font-body text-sm mt-0.5">{invoice.clientEmail}</p>
          )}
          {invoice.notes && (
            <div className="mt-4 pt-4 border-t border-cream-100">
              <p className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider mb-1">Catatan</p>
              <p className="text-slate-600 font-body text-sm">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Items table */}
        <div className="bg-white border border-cream-200 rounded-xl p-6 shadow-card mb-5 animate-fade-up animation-delay-200">
          <h2 className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider mb-4">Item Layanan</h2>

          <div className="space-y-0">
            <div className="grid grid-cols-12 gap-4 pb-2 border-b border-cream-100 text-xs font-body font-medium text-slate-400 uppercase tracking-wider">
              <div className="col-span-6">Deskripsi</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Harga</div>
              <div className="col-span-2 text-right">Subtotal</div>
            </div>

            {invoice.items?.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 py-3 border-b border-cream-50 last:border-0">
                <div className="col-span-6 font-body text-sm text-navy-900">{item.description}</div>
                <div className="col-span-2 font-mono text-sm text-slate-500 text-center">{item.quantity}</div>
                <div className="col-span-2 font-mono text-sm text-slate-500 text-right">{formatRupiah(item.unitPrice)}</div>
                <div className="col-span-2 font-mono text-sm font-medium text-navy-900 text-right">{formatRupiah(item.subtotal)}</div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 pt-4 border-t border-cream-200 flex justify-between items-center">
            <span className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider">Total</span>
            <span className="font-display text-2xl font-semibold text-navy-900">{formatRupiah(invoice.totalAmount)}</span>
          </div>
        </div>

        {/* Status update */}
        {transitions.length > 0 && (
          <div className="bg-white border border-cream-200 rounded-xl p-6 shadow-card animate-fade-up animation-delay-300">
            <h2 className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider mb-3">Ubah Status</h2>
            <div className="flex flex-wrap gap-2">
              {transitions.map((s) => {
                const colorMap = {
                  PAID: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
                  UNPAID: 'border-amber-200 text-amber-700 hover:bg-amber-50',
                  OVERDUE: 'border-red-200 text-red-600 hover:bg-red-50',
                };
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={statusLoading}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-body text-sm font-medium transition disabled:opacity-50 ${colorMap[s]}`}
                  >
                    {statusLoading ? (
                      <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4v5h5M20 20v-5h-5M20 10a8 8 0 00-13.9-5.4M4 14a8 8 0 0013.9 5.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {STATUS_LABELS[s]}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delete modal */}
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
            <p className="text-slate-500 font-body text-sm text-center mb-1">
              Invoice <span className="font-mono text-navy-700">{invoice.invoiceNumber}</span> akan dihapus permanen.
            </p>
            <p className="text-slate-400 font-body text-xs text-center mb-6">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-cream-200 rounded-lg font-body text-sm text-slate-600 hover:bg-cream-100 transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
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
