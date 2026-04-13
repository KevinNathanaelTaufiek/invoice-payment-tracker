import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { create, update, getById } from '../api/invoiceApi';
import { formatRupiah } from '../utils/format';

const emptyItem = { description: '', quantity: 1, unitPrice: '' };

export default function InvoiceFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    items: [{ ...emptyItem }],
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    const fetchInvoice = async () => {
      try {
        const res = await getById(id);
        const inv = res.data;
        setForm({
          clientName: inv.clientName,
          clientEmail: inv.clientEmail || '',
          issueDate: inv.issueDate,
          dueDate: inv.dueDate,
          notes: inv.notes || '',
          items: inv.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        });
      } catch {
        setError('Gagal memuat data invoice.');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchInvoice();
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, { ...emptyItem }] }));
  };

  const removeItem = (index) => {
    if (form.items.length === 1) return;
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const totalAmount = form.items.reduce((sum, item) => {
    const subtotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    return sum + subtotal;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate items
    for (const item of form.items) {
      if (!item.description.trim()) {
        setError('Semua item harus memiliki deskripsi.');
        return;
      }
      if (!item.unitPrice || Number(item.unitPrice) <= 0) {
        setError('Harga satuan item harus lebih dari 0.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        items: form.items.map((item) => ({
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      };

      if (isEdit) {
        await update(id, payload);
      } else {
        await create(payload);
      }
      navigate('/invoices');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan invoice. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
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

  return (
    <Layout>
      <div className="p-8 max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-up">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-cream-200 text-slate-400 hover:text-navy-700 transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5m0 0l7 7m-7-7l7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <h1 className="font-display text-2xl font-semibold text-navy-900">
              {isEdit ? 'Edit Invoice' : 'Buat Invoice Baru'}
            </h1>
            <p className="text-slate-400 font-body text-sm mt-0.5">
              {isEdit ? 'Perbarui detail invoice di bawah.' : 'Isi detail invoice dan item layanan.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client info */}
          <div className="bg-white border border-cream-200 rounded-xl p-6 shadow-card animate-fade-up animation-delay-100">
            <h2 className="font-display text-base font-semibold text-navy-900 mb-4">
              Informasi Klien
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-body font-medium text-navy-700 uppercase tracking-wider mb-1.5">
                  Nama Klien <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={form.clientName}
                  onChange={handleChange}
                  required
                  placeholder="PT Maju Bersama"
                  className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-lg font-body text-sm text-navy-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
                />
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-navy-700 uppercase tracking-wider mb-1.5">
                  Email Klien
                </label>
                <input
                  type="email"
                  name="clientEmail"
                  value={form.clientEmail}
                  onChange={handleChange}
                  placeholder="finance@client.com"
                  className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-lg font-body text-sm text-navy-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white border border-cream-200 rounded-xl p-6 shadow-card animate-fade-up animation-delay-200">
            <h2 className="font-display text-base font-semibold text-navy-900 mb-4">
              Tanggal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-body font-medium text-navy-700 uppercase tracking-wider mb-1.5">
                  Tanggal Invoice <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={form.issueDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-lg font-body text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
                />
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-navy-700 uppercase tracking-wider mb-1.5">
                  Jatuh Tempo <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-lg font-body text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white border border-cream-200 rounded-xl p-6 shadow-card animate-fade-up animation-delay-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-navy-900">
                Item Layanan
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 text-xs font-body font-medium text-gold hover:text-gold-dark px-3 py-1.5 rounded-lg border border-gold/30 hover:bg-gold/5 transition"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round"/>
                </svg>
                Tambah Item
              </button>
            </div>

            {/* Column headers */}
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="flex-[5] text-xs font-body font-medium text-slate-400 uppercase tracking-wider">Deskripsi</div>
              <div className="flex-[2] text-xs font-body font-medium text-slate-400 uppercase tracking-wider">Qty</div>
              <div className="flex-[3] text-xs font-body font-medium text-slate-400 uppercase tracking-wider">Harga Satuan</div>
              <div className="flex-[3] text-xs font-body font-medium text-slate-400 uppercase tracking-wider text-right">Subtotal</div>
              <div className="w-8 flex-shrink-0" />
            </div>

            <div className="space-y-2">
              {form.items.map((item, index) => {
                const subtotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                return (
                  <div key={index} className="flex items-center gap-2 group">
                    <div className="flex-[5]">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Nama layanan / produk"
                        required
                        className="w-full px-3 py-2.5 bg-cream-50 border border-cream-200 rounded-lg font-body text-sm text-navy-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
                      />
                    </div>
                    <div className="flex-[2]">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="1"
                        required
                        className="w-full px-3 py-2.5 bg-cream-50 border border-cream-200 rounded-lg font-body text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
                      />
                    </div>
                    <div className="flex-[3]">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        min="0"
                        step="1000"
                        placeholder="0"
                        required
                        className="w-full px-3 py-2.5 bg-cream-50 border border-cream-200 rounded-lg font-body text-sm text-navy-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
                      />
                    </div>
                    <div className="flex-[3] text-right">
                      <span className="font-mono text-xs text-navy-700">
                        {subtotal > 0 ? formatRupiah(subtotal) : '—'}
                      </span>
                    </div>
                    <div className="w-8 flex-shrink-0 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={form.items.length === 1}
                        className="p-1.5 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-cream-100 flex justify-end">
              <div className="text-right">
                <p className="text-xs font-body text-slate-400 uppercase tracking-wider mb-1">Total</p>
                <p className="font-display text-2xl font-semibold text-navy-900">{formatRupiah(totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white border border-cream-200 rounded-xl p-6 shadow-card animate-fade-up animation-delay-400">
            <h2 className="font-display text-base font-semibold text-navy-900 mb-4">
              Catatan <span className="text-slate-300 font-body font-normal text-sm">(opsional)</span>
            </h2>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Contoh: Pembayaran project website tahap 1"
              className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-lg font-body text-sm text-navy-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-body px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pb-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 border border-cream-200 rounded-lg font-body text-sm text-slate-600 hover:bg-cream-200 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-body font-medium px-6 py-2.5 rounded-lg text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {isEdit ? 'Simpan Perubahan' : 'Buat Invoice'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
