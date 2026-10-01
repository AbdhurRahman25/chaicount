type SummaryCardProps = {
  title: string;
  amount: number;
  type: "sales" | "expense" | "profit";
};

function SummaryCard({ title, amount, type }: SummaryCardProps) {
  const amountColors = {
    sales: "text-blue-600",
    expense: "text-red-600",
    profit: "text-green-600",
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <h2 className={`mt-2 text-2xl font-bold ${amountColors[type]}`}>
        ₹{amount.toLocaleString("en-IN")}
      </h2>
    </div>
  );
}

export default SummaryCard;