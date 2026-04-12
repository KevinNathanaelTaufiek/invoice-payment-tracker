import { formatRupiah } from '../utils/format';

export default function SummaryCard({ label, value, isCurrency = false, accent = false, icon }) {
  return (
    <div className={`bg-white rounded-xl p-5 border border-cream-200 shadow-card hover:shadow-card-hover transition-shadow duration-200 ${accent ? 'border-l-4 border-l-gold' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider mb-2">
            {label}
          </p>
          <p className={`font-display font-semibold leading-none ${isCurrency ? 'text-xl' : 'text-3xl'} text-navy-900`}>
            {isCurrency ? formatRupiah(value) : value}
          </p>
        </div>
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-cream-100 flex items-center justify-center text-navy-600 flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
