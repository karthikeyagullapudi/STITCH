import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const buttonCls =
  'flex h-10 w-10 items-center justify-center border border-line text-muted transition-colors hover:bg-field hover:text-paper disabled:cursor-not-allowed disabled:opacity-40';

const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={buttonCls}
      >
        <FiChevronLeft className="h-4 w-4" />
      </button>
      <span className="px-3 font-display text-xs uppercase tracking-wide text-muted">
        Page {page} of {pages}
      </span>
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className={buttonCls}
      >
        <FiChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Pagination;
