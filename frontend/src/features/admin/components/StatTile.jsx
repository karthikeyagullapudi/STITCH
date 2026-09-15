// Headline number with a label and an optional supporting note.
const StatTile = ({ label, value, note, accent = false }) => (
  <div className="border border-line bg-field p-6">
    <p className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
      {label}
    </p>
    <p
      className={`font-display text-4xl font-bold ${accent ? 'text-accent' : 'text-paper'}`}
    >
      {value}
    </p>
    {note && <p className="mt-2 text-xs text-muted">{note}</p>}
  </div>
);

export default StatTile;
