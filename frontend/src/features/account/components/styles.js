/* Shared class names for the account forms (also used by checkout). */
export const cardCls = 'border border-line bg-field p-6';
export const cardTitleCls =
  'mb-5 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted';
export const labelCls =
  'mb-2 block font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted';
export const inputCls =
  'w-full border border-line bg-panel px-4 py-3 text-sm text-paper outline-none transition-colors placeholder:text-faint focus:border-accent disabled:opacity-60';
export const primaryBtnCls =
  'bg-accent px-6 py-3 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-ink transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60';
export const ghostBtnCls =
  'border border-line px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-paper transition-colors hover:border-accent hover:text-accent disabled:opacity-60';
export const feedbackCls = {
  success: 'font-display text-[11px] uppercase tracking-wide text-emerald-400',
  error: 'font-display text-[11px] uppercase tracking-wide text-red-400',
};
