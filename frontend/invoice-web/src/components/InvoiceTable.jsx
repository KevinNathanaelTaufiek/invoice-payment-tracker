import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatRupiah, formatDate } from '../utils/format';

export default function InvoiceTable({ invoices, onDelete, onStatusChange }) {
  const navigate = useNavigate();

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400 font-body">
        <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <p className="text-sm">Belum ada invoice.</p>
        <p className="text-xs mt-1 text-slate-300">Buat invoice pertama Anda sekarang.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-body">
        <thead>
          <tr className="border-b border-cream-200">
            {['No. Invoice', 'Klien', 'Tanggal', 'Jatuh Tempo', 'Total', 'Status', ''].map((h) => (
              <th
                key={h}
                className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-3 first:pl-0 last:pr-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-cream-100">
          {invoices.map((inv, i) => (
            <tr
              key={inv.id}
              className="hover:bg-cream-50 transition-colors cursor-pointer group"
              style={{ animationDelay: `${i * 40}ms` }}
              onClick={() => navigate(`/invoices/${inv.id}`)}
            >
              <td className="px-4 py-3.5 pl-0">
                <span className="font-mono text-navy-700 text-xs font-medium">{inv.invoiceNumber}</span>
              </td>
              <td className="px-4 py-3.5">
                <div>
                  <p className="text-navy-900 font-medium text-sm">{inv.clientName}</p>
                  {inv.clientEmail && (
                    <p className="text-slate-400 text-xs mt-0.5">{inv.clientEmail}</p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3.5 text-slate-500 text-xs">{formatDate(inv.issueDate)}</td>
              <td className="px-4 py-3.5 text-slate-500 text-xs">{formatDate(inv.dueDate)}</td>
              <td className="px-4 py-3.5">
                <span className="font-mono text-navy-900 font-medium text-sm">{formatRupiah(inv.totalAmount)}</span>
              </td>
              <td className="px-4 py-3.5">
                <StatusBadge status={inv.status} />
              </td>
              <td className="px-4 py-3.5 pr-0">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/invoices/${inv.id}/edit`)}
                    className="p-1.5 rounded-md hover:bg-cream-200 text-slate-400 hover:text-navy-700 transition-colors"
                    title="Edit"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(inv.id)}
                    className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    title="Hapus"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
