type SummaryCardProps = {
  title: string;
  amount: number;
  type: "sales" | "expense" | "profit" | "pending";
};

function SummaryCard({
  title,
  amount,
  type,
}: SummaryCardProps) {
  const styles = {
    sales: {
      icon: "↗",
      accent: "text-emerald-400",
      iconBg: "bg-emerald-500/15",
      iconBorder: "border-emerald-500/20",
      glow: "shadow-emerald-500/5",
      dot: "bg-emerald-400",
    },

    expense: {
      icon: "↘",
      accent: "text-rose-400",
      iconBg: "bg-rose-500/15",
      iconBorder: "border-rose-500/20",
      glow: "shadow-rose-500/5",
      dot: "bg-rose-400",
    },

    profit: {
      icon: "₹",
      accent: "text-amber-400",
      iconBg: "bg-amber-500/15",
      iconBorder: "border-amber-500/20",
      glow: "shadow-amber-500/5",
      dot: "bg-amber-400",
    },

    pending: {
      icon: "⏳",
      accent: "text-red-400",
      iconBg: "bg-red-500/15",
      iconBorder: "border-red-500/20",
      glow: "shadow-red-500/5",
      dot: "bg-red-400",
  },
};

  const style = styles[type];

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 p-3 shadow-xl ${style.glow}`}
    >
      {/* Glow */}
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full ${style.iconBg} blur-2xl`}
      />

      <div className="relative">

        <div className="flex items-start justify-between">

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500">
              {title}
            </p>

            <p
              className={`mt-2 text-[30px] font-extrabold tracking-tight ${style.accent}`}
            >
              ₹{amount.toLocaleString("en-IN")}
            </p>
          </div>

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${style.iconBg} ${style.iconBorder} text-lg font-extrabold ${style.accent}`}
          >
            {style.icon}
          </div>

        </div>

        <div className="mt-5 flex items-center justify-between">

          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
            />

            <span className="text-[11px] font-semibold text-zinc-400">
              Today
            </span>
          </div>

          <span className="text-[10px] text-zinc-600">
            Updated just now
          </span>

        </div>

      </div>
    </div>
  );
}

export default SummaryCard;