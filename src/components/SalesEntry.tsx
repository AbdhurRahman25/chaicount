import { useState } from "react";

function SalesEntry() {
  const [cups, setCups] = useState("");
  const [price, setPrice] = useState("");

  const total = Number(cups) * Number(price);

  function handleSubmit() {
    if (!cups || !price) {
      alert("Please enter cups and price");
      return;
    }

    alert(`Total Sales: ₹${total.toLocaleString("en-IN")}`);

    setCups("");
    setPrice("");
  }

  return (
    <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">
        Add Sale
      </h2>

      <div className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Cups Sold
          </label>

          <input
            type="number"
            value={cups}
            onChange={(e) => setCups(e.target.value)}
            placeholder="Enter cups"
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Price Per Cup
          </label>

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
          />
        </div>

        <div className="rounded-xl bg-gray-100 p-4">
          <p className="text-sm text-gray-500">
            Total Sales
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
          Add Sale
        </button>
      </div>
    </section>
  );
}

export default SalesEntry;