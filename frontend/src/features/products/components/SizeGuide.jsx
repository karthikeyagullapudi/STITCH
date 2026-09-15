import { FiX } from 'react-icons/fi';

// Body measurements in centimetres.
const rows = [
  ['XS', '82–86', '66–70', '88–92'],
  ['S', '87–92', '71–76', '93–98'],
  ['M', '93–100', '77–84', '99–104'],
  ['L', '101–108', '85–92', '105–110'],
  ['XL', '109–116', '93–100', '111–116'],
  ['XXL', '117–124', '101–108', '117–122'],
];

const cellCls = 'border-b border-line px-4 py-3';

const SizeGuide = ({ onClose }) => (
  <div
    className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 px-6 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Size guide"
      className="w-full max-w-lg border border-line bg-field p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
          Size Guide
        </h2>
        <button
          type="button"
          aria-label="Close size guide"
          onClick={onClose}
          className="text-muted transition-colors hover:text-paper"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>
      <table className="w-full text-left font-display text-sm">
        <thead className="text-[11px] uppercase tracking-wider text-muted">
          <tr>
            <th className={cellCls}>Size</th>
            <th className={cellCls}>Chest</th>
            <th className={cellCls}>Waist</th>
            <th className={cellCls}>Hips</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([size, chest, waist, hips]) => (
            <tr key={size}>
              <td className={`${cellCls} font-bold text-accent`}>{size}</td>
              <td className={cellCls}>{chest}</td>
              <td className={cellCls}>{waist}</td>
              <td className={cellCls}>{hips}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-xs text-muted">
        Measurements are in centimetres. Between sizes? Size up for a relaxed
        fit.
      </p>
    </div>
  </div>
);

export default SizeGuide;
