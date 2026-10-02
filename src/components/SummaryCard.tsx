type SummaryCardProps = {
  title: string;
  amount: number;
  type: "sales" | "expense" | "profit";
};

function SummaryCard({ title, amount, type }: SummaryCardProps) {
  const amountColors = {
    sales: "text-black-600",
    expense: "text-red-600",
    profit: "text-amber-600",
  };

  return (
    <div className="rounded-2xl border-white/90 bg-gradient-to-r from-teal-600 to-emerald-600 backdrop-blur-sm p-5 shadow-sm">
      <h3 className="font-bold text-gray-900">
        {title}
      </h3>

      <h2 className={`mt-2 text-2xl font-bold ${amountColors[type]}`}>
        ₹{amount.toLocaleString("en-IN")}
      </h2>
    </div>
  );
}

export default SummaryCard;