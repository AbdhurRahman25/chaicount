import { useNavigate } from "react-router-dom";

type QuickActionProps = {
  label: string;
};

function QuickAction({ label }: QuickActionProps) {
  const navigate = useNavigate();

  const isSale = label === "Sale";
  const isHistory = label === "History";

  function handleClick() {
    if (label === "Sale") {
      navigate("/add-sale");
    }

    if (label === "Expense") {
      navigate("/add-expense");
    }

    if (label === "History") {
      navigate("/history");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative min-w-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3 text-left shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-800/80 active:scale-[0.96]"
    >
      {/* Background Glow */}

      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl ${
          isSale
            ? "bg-emerald-500/10"
            : isHistory
            ? "bg-blue-500/10"
            : "bg-rose-500/10"
        }`}
      />

      {/* Content */}

      <div className="relative flex flex-col items-center text-center">

        {/* Icon */}

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl font-bold ${
            isSale
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : isHistory
              ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
              : "border-rose-500/20 bg-rose-500/10 text-rose-400"
          }`}
        >
          {isSale ? "+" : isHistory ? "↺" : "−"}
        </div>

        {/* Text */}

        <div className="mt-3 min-w-0 w-full">
          <p className="truncate text-sm font-bold text-zinc-100">
            {label === "History" ? "History" : `Add ${label}`}
          </p>

          <p className="mt-1 truncate text-[10px] font-medium text-zinc-500">
            {label === "History"
              ? "View history"
              : `Record ${label.toLowerCase()}`}
          </p>
        </div>

      </div>
    </button>
  );
}

export default QuickAction;