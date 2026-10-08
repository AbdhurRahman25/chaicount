import { useState } from "react";

type SalesEntryProps = {
  onAddSale: (total: number) => void;
  pricePerCup: number;
};

type CustomerSale = {
  id: string;
  customerName: string;

  // Tea
  teaCups: number;
  teaPricePerCup: number;
  teaTotal: number;

  // Biscuit
  biscuitQuantity: number;
  biscuitPrice: number;
  biscuitTotal: number;

  // Payment
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: "Paid" | "Pending";
  paymentNote: string;

  createdAt: string;
};

function SalesEntry({
  onAddSale,
  pricePerCup,
}: SalesEntryProps) {
  const [customerName, setCustomerName] = useState("");

  // Tea
  const [teaCups, setTeaCups] = useState("");

  // Biscuit
  const [biscuitQuantity, setBiscuitQuantity] =
    useState("");
  const [biscuitPrice, setBiscuitPrice] =
    useState("");

  // Payment
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const teaQuantity = Number(teaCups) || 0;
  const biscuitQty = Number(biscuitQuantity) || 0;
  const biscuitRate = Number(biscuitPrice) || 0;
  const paid = Number(paidAmount) || 0;

  const teaTotal = teaQuantity * pricePerCup;

  const biscuitTotal = biscuitQty * biscuitRate;

  const totalAmount = teaTotal + biscuitTotal;

  const pendingAmount = Math.max(
    0,
    totalAmount - paid,
  );

  const hasTea = teaQuantity > 0;
  const hasBiscuit = biscuitQty > 0;

  function handleSubmit() {
    const name = customerName.trim();

    if (!name) {
      alert("Please enter customer name.");
      return;
    }

    if (!hasTea && !hasBiscuit) {
      alert(
        "Please enter Tea quantity or Biscuit quantity.",
      );
      return;
    }

    if (hasBiscuit && biscuitRate <= 0) {
      alert("Please enter valid biscuit price.");
      return;
    }

    if (paid < 0) {
      alert("Paid amount cannot be negative.");
      return;
    }

    if (paid > totalAmount) {
      alert(
        `Paid amount cannot be more than total amount ₹${totalAmount.toLocaleString(
          "en-IN",
        )}.`,
      );
      return;
    }

    if (pendingAmount > 0 && !paymentNote.trim()) {
      alert(
        "Please enter when the customer will pay the pending amount.",
      );
      return;
    }

    const sale: CustomerSale = {
      id: Date.now().toString(),

      customerName: name,

      teaCups: teaQuantity,
      teaPricePerCup: pricePerCup,
      teaTotal,

      biscuitQuantity: biscuitQty,
      biscuitPrice: biscuitRate,
      biscuitTotal,

      totalAmount,
      paidAmount: paid,
      pendingAmount,

      paymentStatus:
        pendingAmount > 0 ? "Pending" : "Paid",

      paymentNote:
        pendingAmount > 0
          ? paymentNote.trim()
          : "",

      createdAt: new Date().toISOString(),
    };

    const saved = localStorage.getItem(
      "chaicount_customer_sales",
    );

    let existingSales: CustomerSale[] = [];

    try {
      existingSales = saved
        ? JSON.parse(saved)
        : [];
    } catch {
      existingSales = [];
    }

    const updatedSales = [
      sale,
      ...existingSales,
    ];

    localStorage.setItem(
      "chaicount_customer_sales",
      JSON.stringify(updatedSales),
    );

    window.dispatchEvent(new Event("chaicount_sales_updated"));

    /*
     * Full transaction amount is added to today's sales.
     *
     * Example:
     * Tea       = ₹50
     * Biscuit   = ₹20
     * ----------------
     * Total     = ₹70
     *
     * Even if customer pays ₹30 now,
     * Today's Sales = ₹70
     * Pending       = ₹40
     */
    onAddSale(totalAmount);

    setCustomerName("");
    setTeaCups("");
    setBiscuitQuantity("");
    setBiscuitPrice("");
    setPaidAmount("");
    setPaymentNote("");

    if (pendingAmount > 0) {
      alert(
        `Sale Added Successfully!\n\n` +
          `Customer: ${name}\n` +
          `Total: ₹${totalAmount.toLocaleString(
            "en-IN",
          )}\n` +
          `Paid: ₹${paid.toLocaleString(
            "en-IN",
          )}\n` +
          `Pending: ₹${pendingAmount.toLocaleString(
            "en-IN",
          )}`,
      );
    } else {
      alert(
        `Sale Added Successfully!\n\n` +
          `Customer: ${name}\n` +
          `Total: ₹${totalAmount.toLocaleString(
            "en-IN",
          )}\n` +
          `Payment: Fully Paid`,
      );
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-500/15 bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-900 p-5 shadow-xl shadow-emerald-500/5">

      {/* Decorative Glow */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative">

        {/* Header */}
        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-xl font-bold text-emerald-400">
            +
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">
              Add Sale
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Record Tea & Biscuit sales
            </p>
          </div>

        </div>

        <div className="mt-6 space-y-5">

          {/* ================= CUSTOMER ================= */}

          <div>
            <label className="text-xs font-semibold text-zinc-400">
              Customer Name
            </label>

            <input
              type="text"
              value={customerName}
              onChange={(e) =>
                setCustomerName(e.target.value)
              }
              placeholder="Enter customer name"
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          {/* ================= TEA ================= */}

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">

            <div className="flex items-center justify-between">

              <div>
                <h3 className="text-sm font-bold text-white">
                  ☕ Tea
                </h3>

                <p className="mt-1 text-[10px] text-zinc-600">
                  Enter number of cups
                </p>
              </div>

              <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                ₹{pricePerCup}/cup
              </span>

            </div>

            <div className="mt-4">

              <label className="text-xs font-semibold text-zinc-400">
                Number of Cups
              </label>

              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={teaCups}
                onChange={(e) =>
                  setTeaCups(e.target.value)
                }
                placeholder="Eg: 5"
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-500/50"
              />

            </div>

            {hasTea && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-500/5 px-3 py-2.5">

                <span className="text-xs text-zinc-500">
                  {teaQuantity} × ₹{pricePerCup}
                </span>

                <span className="text-sm font-bold text-emerald-400">
                  ₹{teaTotal.toLocaleString("en-IN")}
                </span>

              </div>
            )}

          </div>

          {/* ================= BISCUIT ================= */}

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">

            <div className="flex items-center justify-between">

              <div>
                <h3 className="text-sm font-bold text-white">
                  🍪 Biscuit
                </h3>

                <p className="mt-1 text-[10px] text-zinc-600">
                  Add biscuit quantity and price
                </p>
              </div>

            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">

              {/* Quantity */}
              <div>

                <label className="text-xs font-semibold text-zinc-400">
                  Quantity
                </label>

                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={biscuitQuantity}
                  onChange={(e) =>
                    setBiscuitQuantity(
                      e.target.value,
                    )
                  }
                  placeholder="Eg: 2"
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-500/50"
                />

              </div>

              {/* Price */}
              <div>

                <label className="text-xs font-semibold text-zinc-400">
                  Price / Biscuit
                </label>

                <div className="relative mt-2">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-600">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={biscuitPrice}
                    onChange={(e) =>
                      setBiscuitPrice(
                        e.target.value,
                      )
                    }
                    placeholder="Eg: 10"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-8 pr-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-500/50"
                  />

                </div>

              </div>

            </div>

            {hasBiscuit && biscuitRate > 0 && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-500/5 px-3 py-2.5">

                <span className="text-xs text-zinc-500">
                  {biscuitQty} × ₹{biscuitRate}
                </span>

                <span className="text-sm font-bold text-amber-400">
                  ₹
                  {biscuitTotal.toLocaleString(
                    "en-IN",
                  )}
                </span>

              </div>
            )}

          </div>

          {/* ================= TOTAL ================= */}

          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4">

            <div className="flex items-center justify-between">

              <span className="text-xs font-semibold text-zinc-500">
                Total Sale
              </span>

              <span className="text-xs text-zinc-600">
                Tea + Biscuit
              </span>

            </div>

            <p className="mt-1 text-3xl font-extrabold text-emerald-400">
              ₹
              {totalAmount.toLocaleString(
                "en-IN",
              )}
            </p>

            {(hasTea || hasBiscuit) && (
              <div className="mt-3 space-y-1 border-t border-emerald-500/10 pt-3">

                {hasTea && (
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">
                      Tea
                    </span>

                    <span className="text-zinc-300">
                      ₹
                      {teaTotal.toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                )}

                {hasBiscuit && (
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">
                      Biscuit
                    </span>

                    <span className="text-zinc-300">
                      ₹
                      {biscuitTotal.toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* ================= PAYMENT ================= */}

          <div>
            <label className="text-xs font-semibold text-zinc-400">
              Amount Paid
            </label>

            <div className="relative mt-2">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">
                ₹
              </span>

              <input
                type="number"
                min="0"
                inputMode="decimal"
                value={paidAmount}
                onChange={(e) =>
                  setPaidAmount(e.target.value)
                }
                placeholder="How much did customer pay?"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 py-3.5 pl-9 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
              />

            </div>

          </div>

          {/* ================= PAYMENT SUMMARY ================= */}

          <div className="grid grid-cols-2 gap-3">

            <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4">

              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                Paid
              </p>

              <p className="mt-1 text-xl font-extrabold text-emerald-400">
                ₹{paid.toLocaleString("en-IN")}
              </p>

            </div>

            <div
              className={`rounded-2xl border p-4 ${
                pendingAmount > 0
                  ? "border-amber-500/15 bg-amber-500/5"
                  : "border-zinc-800 bg-zinc-950/50"
              }`}
            >

              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                Pending
              </p>

              <p
                className={`mt-1 text-xl font-extrabold ${
                  pendingAmount > 0
                    ? "text-amber-400"
                    : "text-zinc-500"
                }`}
              >
                ₹
                {pendingAmount.toLocaleString(
                  "en-IN",
                )}
              </p>

            </div>

          </div>

          {/* ================= PAYMENT NOTE ================= */}

          {pendingAmount > 0 && (
            <div>

              <label className="text-xs font-semibold text-zinc-400">
                When Will Customer Pay?
              </label>

              <input
                type="text"
                value={paymentNote}
                onChange={(e) =>
                  setPaymentNote(e.target.value)
                }
                placeholder="Eg: Tomorrow / Evening / Next Monday"
                className="mt-2 w-full rounded-xl border border-amber-500/20 bg-zinc-950/70 px-4 py-3.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10"
              />

            </div>
          )}

          {/* ================= STATUS ================= */}

          {(hasTea || hasBiscuit) && (
            <div
              className={`rounded-xl border px-4 py-3 ${
                pendingAmount > 0
                  ? "border-amber-500/15 bg-amber-500/5"
                  : "border-emerald-500/15 bg-emerald-500/5"
              }`}
            >

              <div className="flex items-center justify-between">

                <span className="text-xs font-semibold text-zinc-400">
                  Payment Status
                </span>

                <span
                  className={`text-xs font-bold ${
                    pendingAmount > 0
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {pendingAmount > 0
                    ? "PENDING"
                    : "FULLY PAID"}
                </span>

              </div>

            </div>
          )}

          {/* ================= ADD BUTTON ================= */}

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-emerald-500/10 transition hover:bg-emerald-400 active:scale-[0.98]"
          >
            Add Sale
          </button>

        </div>
      </div>
    </section>
  );
}

export default SalesEntry;