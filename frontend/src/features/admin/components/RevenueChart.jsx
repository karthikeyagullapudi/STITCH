import { useState } from 'react';
import { formatPrice } from '../../../shared/utils/format.js';

const compact = new Intl.NumberFormat('en-IN', { notation: 'compact' });

const shortDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });

// Clean axis steps (1/2/5 × 10ⁿ) ending at the first step above the peak.
const niceScale = (maxValue) => {
  const peak = Math.max(maxValue, 100);
  const rough = peak / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 5, 10].find((factor) => factor * magnitude >= rough) * magnitude;
  const max = Math.ceil(peak / step) * step;
  return {
    max,
    ticks: Array.from({ length: max / step + 1 }, (_, i) => i * step),
  };
};

/* Single-series daily revenue columns with a per-day hover/focus tooltip
   and a table view for readers who can't use the chart. */
const RevenueChart = ({ data }) => {
  const [active, setActive] = useState(null);
  const { max, ticks } = niceScale(Math.max(...data.map((d) => d.revenue)));
  // About six date labels regardless of range, so they never collide.
  const labelEvery = Math.ceil(data.length / 6);

  return (
    <div>
      <div className="flex gap-3">
        {/* Y axis */}
        <div className="relative h-56 w-12 shrink-0">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 translate-y-1/2 text-[10px] tabular-nums text-muted"
              style={{ bottom: `${(tick / max) * 100}%` }}
            >
              {compact.format(tick)}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative h-56">
            {/* Gridlines */}
            {ticks.map((tick) => (
              <div
                key={tick}
                className="absolute inset-x-0 h-px bg-line"
                style={{ bottom: `${(tick / max) * 100}%` }}
              />
            ))}

            {/* Columns — each full-height slot is the hover target */}
            <div className="absolute inset-0 flex items-end">
              {data.map((day, index) => {
                const isActive = active === index;
                const align =
                  index < data.length / 4
                    ? 'left-0'
                    : index > (data.length * 3) / 4
                      ? 'right-0'
                      : 'left-1/2 -translate-x-1/2';
                return (
                  <div
                    key={day.date}
                    tabIndex={0}
                    aria-label={`${shortDate(day.date)}: ${formatPrice(day.revenue)} from ${day.orders} orders`}
                    onMouseEnter={() => setActive(index)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(index)}
                    onBlur={() => setActive(null)}
                    className="relative flex h-full flex-1 items-end justify-center px-px outline-none"
                  >
                    <div
                      className={`w-full max-w-[24px] rounded-t-[4px] bg-accent transition-opacity ${
                        active !== null && !isActive ? 'opacity-60' : ''
                      }`}
                      style={{
                        height: `${(day.revenue / max) * 100}%`,
                        minHeight: day.revenue > 0 ? 2 : 0,
                      }}
                    />
                    {isActive && (
                      <div
                        className={`pointer-events-none absolute top-0 z-10 whitespace-nowrap border border-line bg-panel px-3 py-2 ${align}`}
                      >
                        <p className="font-display text-sm font-semibold text-paper">
                          {formatPrice(day.revenue)}
                        </p>
                        <p className="text-[11px] text-muted">
                          {shortDate(day.date)} · {day.orders}{' '}
                          {day.orders === 1 ? 'order' : 'orders'}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* X axis */}
          <div className="mt-2 flex">
            {data.map((day, index) => (
              <span
                key={day.date}
                className="flex-1 whitespace-nowrap text-center text-[10px] text-muted"
              >
                {index % labelEvery === 0 ? shortDate(day.date) : ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted hover:text-paper">
          View as table
        </summary>
        <div className="mt-3 max-h-64 overflow-y-auto border border-line">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-panel font-display text-[11px] uppercase tracking-wider text-muted">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2 text-right">Orders</th>
                <th className="p-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line tabular-nums">
              {data.map((day) => (
                <tr key={day.date}>
                  <td className="p-2 text-muted">{shortDate(day.date)}</td>
                  <td className="p-2 text-right text-paper">{day.orders}</td>
                  <td className="p-2 text-right text-paper">
                    {formatPrice(day.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
};

export default RevenueChart;
