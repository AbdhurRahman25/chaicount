import { useState } from "react";

function ExpenseEntry() {
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [Quantity,setQuantity] = useState("");

  const total = Number(amount) * Number(Quantity);

  function handleSubmit() {
    if (!item || !amount || !Quantity) {
      alert("Please enter item,amount and Quantity");
      return;
    }

    alert(`Expense Added: ${item} - ₹${Number(amount).toLocaleString("en-IN")}`);

    setItem("");
    setAmount("");
    setQuantity("");
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
            placeholder="Eg: Milk, Sugar, Tea Powder"
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Quantity
          </label>

          <input 
            type="Number"
            value={Quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Ex: 10"
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
            />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Amount
          </label>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
          />
        </div>

        <div className="rounded-xl bg-gray-100 p-4">
          <p className="text-sm text-gray-500">
            Total Expenses
          </p>

          <p className="mt-1 text-2xl font-bold text-green-600">
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