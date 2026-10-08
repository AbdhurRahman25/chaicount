import { useEffect, useMemo, useState } from "react";

type CustomerSale = {
  id: string;
  customerName: string;

  teaCups?: number;
  teaPricePerCup?: number;
  teaTotal?: number;

  biscuitQuantity?: number;
  biscuitPrice?: number;
  biscuitTotal?: number;

  // Old data compatibility
  cups?: number;
  pricePerCup?: number;

  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: "Paid" | "Pending";
  paymentNote: string;

  createdAt: string;
};

function CustomerDetails() {
  const [sales, setSales] = useState<CustomerSale[]>([]);
  const [search, setSearch] = useState("");
  const [showPendingOnly, setShowPendingOnly] =
    useState(false);

  const loadSales = () => {
    const saved = localStorage.getItem(
      "chaicount_customer_sales",
    );

    if (!saved) {
      setSales([]);
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setSales(parsed);
      } else {
        setSales([]);
      }
    } catch {
      setSales([]);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  /*
   * Search + Pending filter
   */
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesSearch = sale.customerName
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      const matchesPending =
        !showPendingOnly ||
        Number(sale.pendingAmount) > 0;

      return matchesSearch && matchesPending;
    });
  }, [sales, search, showPendingOnly]);

  /*
   * Summary calculations
   */
  const totalSales = sales.reduce(
    (sum, sale) =>
      sum + Number(sale.totalAmount || 0),
    0,
  );

  const totalPaid = sales.reduce(
    (sum, sale) =>
      sum + Number(sale.paidAmount || 0),
    0,
  );

  const totalPending = sales.reduce(
    (sum, sale) =>
      sum + Number(sale.pendingAmount || 0),
    0,
  );

  const pendingCustomers = new Set(
    sales
      .filter(
        (sale) => Number(sale.pendingAmount || 0) > 0,
      )
      .map((sale) =>
        sale.customerName.trim().toLowerCase(),
      ),
  ).size;

  const formatMoney = (amount: number) =>
    `₹${Number(amount || 0).toLocaleString(
      "en-IN",
    )}`;

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return date;
    }
  };

  /*
   * Mark one transaction as fully paid
   */
  const markAsPaid = (id: string) => {
    const updatedSales = sales.map((sale) => {
      if (sale.id !== id) {
        return sale;
      }

      return {
        ...sale,
        paidAmount: sale.totalAmount,
        pendingAmount: 0,
        paymentStatus: "Paid" as const,
        paymentNote: "",
      };
    });

    setSales(updatedSales);

    localStorage.setItem(
      "chaicount_customer_sales",
      JSON.stringify(updatedSales),
    );

    window.dispatchEvent(
      new Event("chaicount_sales_updated"),
    );
  };

  /*
   * Delete transaction
   */
  const deleteSale = (id: string) => {
    const sale = sales.find(
      (item) => item.id === id,
    );

    if (!sale) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${sale.customerName}'s transaction of ${formatMoney(
        sale.totalAmount,
      )}?`,
    );

    if (!confirmed) {
      return;
    }

    const updatedSales = sales.filter(
      (item) => item.id !== id,
    );

    setSales(updatedSales);

    localStorage.setItem(
      "chaicount_customer_sales",
      JSON.stringify(updatedSales),
    );

    window.dispatchEvent(
      new Event("chaicount_sales_updated"),
    );
  };

  return (
    <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-start justify-between gap-3">

        <div>
          <h2 className="text-lg font-bold text-white">
            Customer Details
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Tea, biscuit and pending payment records
          </p>
        </div>

        <button
          type="button"
          onClick={loadSales}
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:border-zinc-700 hover:text-white"
        >
          Refresh
        </button>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="mt-5 grid grid-cols-2 gap-3">

        {/* Total Sales */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
            Total Sales
          </p>

          <p className="mt-1 text-lg font-extrabold text-white">
            {formatMoney(totalSales)}
          </p>
        </div>

        {/* Paid */}
        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
            Total Paid
          </p>

          <p className="mt-1 text-lg font-extrabold text-emerald-400">
            {formatMoney(totalPaid)}
          </p>
        </div>

        {/* Pending */}
        <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
            Pending
          </p>

          <p className="mt-1 text-lg font-extrabold text-amber-400">
            {formatMoney(totalPending)}
          </p>
        </div>

        {/* Customers Due */}
        <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
            Customers Due
          </p>

          <p className="mt-1 text-lg font-extrabold text-red-400">
            {pendingCustomers}
          </p>
        </div>

      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="mt-5">

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search customer..."
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-500/50"
        />

      </div>

      {/* =====================================================
          FILTER
      ===================================================== */}

      <button
        type="button"
        onClick={() =>
          setShowPendingOnly(
            (current) => !current,
          )
        }
        className={`mt-3 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
          showPendingOnly
            ? "bg-amber-500 text-zinc-950"
            : "border border-zinc-800 bg-zinc-950 text-zinc-400"
        }`}
      >
        {showPendingOnly
          ? "Showing Pending Only"
          : "Show Pending Only"}
      </button>

      {/* =====================================================
          CUSTOMER TRANSACTIONS
      ===================================================== */}

      <div className="mt-5 space-y-3">

        {filteredSales.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 px-4 py-10 text-center">

            <div className="text-3xl">
              👤
            </div>

            <p className="mt-3 text-sm font-semibold text-zinc-500">
              No customer records found
            </p>

            <p className="mt-1 text-xs text-zinc-700">
              Add a sale to see customer details here.
            </p>

          </div>
        ) : (
          filteredSales.map((sale) => {

            /*
             * New data
             */
            const teaCups =
              sale.teaCups ??
              sale.cups ??
              0;

            const teaPrice =
              sale.teaPricePerCup ??
              sale.pricePerCup ??
              0;

            const teaTotal =
              sale.teaTotal ??
              teaCups * teaPrice;

            const biscuitQuantity =
              sale.biscuitQuantity ?? 0;

            const biscuitPrice =
              sale.biscuitPrice ?? 0;

            const biscuitTotal =
              sale.biscuitTotal ??
              biscuitQuantity * biscuitPrice;

            const hasTea = teaCups > 0;

            const hasBiscuit =
              biscuitQuantity > 0;

            return (
              <div
                key={sale.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
              >

                {/* =================================================
                    CUSTOMER HEADER
                ================================================= */}

                <div className="flex items-center justify-between gap-3">

                  <div className="min-w-0">

                    <h3 className="truncate text-sm font-bold text-white">
                      {sale.customerName}
                    </h3>

                    <p className="mt-0.5 text-[10px] text-zinc-600">
                      {formatDate(sale.createdAt)}
                    </p>

                  </div>

                  <span
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                      sale.pendingAmount > 0
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {sale.pendingAmount > 0
                      ? "PENDING"
                      : "PAID"}
                  </span>

                </div>

                {/* =================================================
                    ITEMS - COMPACT ROWS
                ================================================= */}

                {(hasTea || hasBiscuit) && (
                  <div className="mt-3 divide-y divide-zinc-800/70">

                    {/* Tea */}
                    {hasTea && (
                      <div className="flex items-center justify-between py-2">

                        <div className="flex min-w-0 items-center gap-2">

                          <span className="text-sm">
                            ☕
                          </span>

                          <span className="text-xs font-semibold text-zinc-300">
                            Tea
                          </span>

                          <span className="text-[10px] text-zinc-600">
                            {teaCups} ×{" "}
                            {formatMoney(teaPrice)}
                          </span>

                        </div>

                        <span className="text-xs font-bold text-emerald-400">
                          {formatMoney(teaTotal)}
                        </span>

                      </div>
                    )}

                    {/* Biscuit */}
                    {hasBiscuit && (
                      <div className="flex items-center justify-between py-2">

                        <div className="flex min-w-0 items-center gap-2">

                          <span className="text-sm">
                            🍪
                          </span>

                          <span className="text-xs font-semibold text-zinc-300">
                            Biscuit
                          </span>

                          <span className="text-[10px] text-zinc-600">
                            {biscuitQuantity} ×{" "}
                            {formatMoney(biscuitPrice)}
                          </span>

                        </div>

                        <span className="text-xs font-bold text-amber-400">
                          {formatMoney(biscuitTotal)}
                        </span>

                      </div>
                    )}

                  </div>
                )}

                {/* =================================================
                    TOTAL + PAYMENT SUMMARY
                ================================================= */}

                <div className="mt-2 flex items-center justify-between border-t border-zinc-800 pt-3">

                  <span className="text-xs font-semibold text-zinc-500">
                    Total
                  </span>

                  <span className="text-base font-extrabold text-white">
                    {formatMoney(sale.totalAmount)}
                  </span>

                </div>

                <div className="mt-2 flex items-center justify-between text-[10px]">

                  <span className="text-zinc-600">
                    Paid{" "}
                    <span className="font-bold text-emerald-400">
                      {formatMoney(sale.paidAmount)}
                    </span>
                  </span>

                  <span className="text-zinc-600">
                    Due{" "}
                    <span
                      className={`font-bold ${
                        sale.pendingAmount > 0
                          ? "text-amber-400"
                          : "text-zinc-600"
                      }`}
                    >
                      {formatMoney(sale.pendingAmount)}
                    </span>
                  </span>

                </div>

                {/* =================================================
                    PAYMENT NOTE - COMPACT
                ================================================= */}

                {sale.pendingAmount > 0 &&
                  sale.paymentNote && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-500/5 px-3 py-2">

                      <span className="text-xs">
                        ⏰
                      </span>

                      <span className="text-[10px] font-semibold text-amber-300">
                        {sale.paymentNote}
                      </span>

                    </div>
                  )}

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="mt-3 flex gap-2">

                  {sale.pendingAmount > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        markAsPaid(sale.id)
                      }
                      className="flex-1 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-zinc-950 transition hover:bg-emerald-400 active:scale-[0.98]"
                    >
                      ✓ Mark as Paid
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      deleteSale(sale.id)
                    }
                    className={`rounded-lg border border-red-500/10 bg-red-500/5 px-4 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/10 ${
                      sale.pendingAmount === 0
                        ? "w-full"
                        : ""
                    }`}
                  >
                    Delete
                  </button>

                </div>

              </div>
            );
          })
        )}

      </div>

      {/* =====================================================
          FOOTER SUMMARY
      ===================================================== */}

      {sales.length > 0 && (
        <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950/50 px-4 py-3">

          <div className="flex items-center justify-between">

            <span className="text-xs text-zinc-600">
              Total Transactions
            </span>

            <span className="text-xs font-bold text-zinc-400">
              {sales.length}
            </span>

          </div>

        </div>
      )}

    </section>
  );
}

export default CustomerDetails;