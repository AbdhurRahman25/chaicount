import { useState, useRef } from "react";

type ExpenseEntryProps = {
  onAddExpense: (total: number) => void;
};

function ExpenseEntry({ onAddExpense }: ExpenseEntryProps) {
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const total = Number(quantity) * Number(amount);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>,
    index:number
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

    onAddExpense(total);

    alert(
      `Expense Added: ${item} - ₹${total.toLocaleString("en-IN")}`,
    );

    setItem("");
    setQuantity("");
    setAmount("");
  }

  return (
    <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">
        Add Expense
      </h2>

      <div className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Expense Item
          </label>

          <input
            type="text"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            ref={(el) =>{inputRefs.current[0] = el;}}
            onKeyDown={(e) => handleKeyDown(e, 0)}
            placeholder="Eg: Milk, Sugar, Tea Powder"
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Quantity
          </label>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            ref={(el) =>{inputRefs.current[1] = el;}}
            onKeyDown={(e) => handleKeyDown(e, 1)}

            placeholder="Enter quantity"
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Amount Per Quantity
          </label>

          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            ref={(el) =>{inputRefs.current[2] = el;}}
            onKeyDown={(e) => handleKeyDown(e, 2)}
            placeholder="Enter amount"
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
          />
        </div>

        <div className="rounded-xl bg-gray-100 p-4">
          <p className="text-sm text-gray-500">
            Total Expense
          </p>

          <p className="mt-1 text-2xl font-bold text-red-600">
            ₹{total.toLocaleString("en-IN")}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white transition hover:bg-gray-800"
        >
          Add Expense
        </button>
      </div>
    </section>
  );
}

export default ExpenseEntry;