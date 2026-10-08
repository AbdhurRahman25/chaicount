import { useRef, useState } from "react";

type ExpenseRecord = { id: string; item: string; quantity: number; amount: number; total: number; createdAt: string; };
type ExpenseEntryProps = { onAddExpense: (record: ExpenseRecord) => void; };

function ExpenseEntry({ onAddExpense }: ExpenseEntryProps) {
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const total = Number(quantity) * Number(amount);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  function handleSubmit() {
    if (!item || !quantity || !amount) {
      alert("Please enter item, quantity and amount");
      return;
    }

    onAddExpense({ id: Date.now().toString(), item: item.trim(), quantity: Number(quantity), amount: Number(amount), total, createdAt: new Date().toISOString() });
    window.dispatchEvent(new Event("chaicount_expenses_updated"));

    alert(
      `Expense Added: ${item} - ₹${total.toLocaleString("en-IN")}`,
    );

    setItem("");
    setQuantity("");
    setAmount("");
  }

  return (
    <section className="relative mt-5 overflow-hidden rounded-3xl border border-rose-500/15 bg-gradient-to-br from-rose-950/30 via-zinc-900 to-zinc-900 p-5 shadow-xl shadow-rose-500/5">

      {/* Background glow */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-rose-500/10 blur-3xl" />

      <div className="relative">

        {/* Header */}
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-xl font-bold text-rose-400">
            −
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              Add Expense
            </h2>

            <p className="text-xs text-zinc-500">
              Record your business expenses
            </p>
          </div>

        </div>

        {/* Form */}
        <div className="mt-6 space-y-4">

          <div>
            <label className="text-xs font-semibold text-zinc-400">
              Expense Item
            </label>

            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              ref={(el) => {
                inputRefs.current[0] = el;
              }}
              onKeyDown={(e) => handleKeyDown(e, 0)}
              placeholder="Eg: Milk, Sugar, Tea Powder"
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/10"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              inputMode="numeric"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              ref={(el) => {
                inputRefs.current[1] = el;
              }}
              onKeyDown={(e) => handleKeyDown(e, 1)}
              placeholder="Enter quantity"
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/10"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400">
              Amount Per Quantity
            </label>

            <div className="relative mt-2">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">
                ₹
              </span>

              <input
                type="number"
                min="1"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                ref={(el) => {
                  inputRefs.current[2] = el;
                }}
                onKeyDown={(e) => handleKeyDown(e, 2)}
                placeholder="Enter amount"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 py-3.5 pl-9 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/10"
              />

            </div>
          </div>

          {/* Total */}
          <div className="rounded-2xl border border-rose-500/10 bg-rose-500/5 p-4">

            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-rose-400/80">
                Total Expense
              </p>

              <span className="text-[10px] text-zinc-600">
                {quantity || 0} units
              </span>
            </div>

            <p className="mt-1 text-2xl font-extrabold text-rose-400">
              ₹{total.toLocaleString("en-IN")}
            </p>

          </div>

          {/* Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full rounded-xl bg-rose-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/10 transition active:scale-[0.98]"
          >
            Add Expense
          </button>

        </div>

      </div>
    </section>
  );
}

export default ExpenseEntry;