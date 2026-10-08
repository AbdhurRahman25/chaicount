import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type CustomerSale = {
  id: string;
  customerName: string;

  teaCups?: number;
  teaPricePerCup?: number;
  teaTotal?: number;

  biscuitQuantity?: number;
  biscuitPrice?: number;
  biscuitTotal?: number;

  cups?: number;
  pricePerCup?: number;

  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: "Paid" | "Pending";
  paymentNote: string;
  createdAt: string;
};

type ExpenseRecord = {
  id: string;
  item: string;
  quantity: number;
  amount: number;
  total: number;
  createdAt: string;
};

type DateFilter = "Today" | "7 Days" | "30 Days" | "All";

type HistoryTab = "Sales" | "Expenses" | "Pending";

function History() {
  const navigate = useNavigate();

  const [sales, setSales] = useState<CustomerSale[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);

  const [filter, setFilter] =
    useState<DateFilter>("Today");

  const [activeTab, setActiveTab] =
    useState<HistoryTab>(() => {
      const tab = new URLSearchParams(window.location.search).get("tab");
      return tab === "Pending" || tab === "pending" ? "Pending" : "Sales";
    });

  const [search, setSearch] = useState("");

  /*
   * ============================================================
   * LOAD SALES
   * ============================================================
   */

  function loadSales() {
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
  }

  /*
   * ============================================================
   * LOAD EXPENSES
   * ============================================================
   */

  function loadExpenses() {
    const saved = localStorage.getItem(
      "chaicount_expense_records",
    );

    if (!saved) {
      setExpenses([]);
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setExpenses(parsed);
      } else {
        setExpenses([]);
      }
    } catch {
      setExpenses([]);
    }
  }

  /*
   * ============================================================
   * LOAD DATA
   * ============================================================
   */

  useEffect(() => {
    loadSales();
    loadExpenses();

    const handleUpdate = () => {
      loadSales();
      loadExpenses();
    };

    window.addEventListener(
      "storage",
      handleUpdate,
    );

    window.addEventListener(
      "chaicount_sales_updated",
      handleUpdate,
    );

    window.addEventListener(
      "chaicount_expenses_updated",
      handleUpdate,
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleUpdate,
      );

      window.removeEventListener(
        "chaicount_sales_updated",
        handleUpdate,
      );

      window.removeEventListener(
        "chaicount_expenses_updated",
        handleUpdate,
      );
    };
  }, []);

  /*
   * ============================================================
   * DATE CHECK
   * ============================================================
   */

  function isWithinFilter(
    createdAt: string,
  ) {
    if (filter === "All") {
      return true;
    }

    const now = new Date();
    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    if (filter === "Today") {
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
      );
    }

    const days =
      filter === "7 Days" ? 7 : 30;

    const difference =
      now.getTime() - date.getTime();

    return (
      difference >= 0 &&
      difference <=
        days * 24 * 60 * 60 * 1000
    );
  }

  /*
   * ============================================================
   * FILTER SALES
   * ============================================================
   */

  const filteredSales = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return sales
      .filter((sale) =>
        isWithinFilter(sale.createdAt),
      )
      .filter((sale) => {
        if (!query) {
          return true;
        }

        return sale.customerName
          .toLowerCase()
          .includes(query);
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      );
  }, [sales, filter, search]);

  /*
   * ============================================================
   * FILTER EXPENSES
   * ============================================================
   */

  const filteredExpenses = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return expenses
      .filter((expense) =>
        isWithinFilter(expense.createdAt),
      )
      .filter((expense) => {
        if (!query) {
          return true;
        }

        return expense.item
          .toLowerCase()
          .includes(query);
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      );
  }, [expenses, filter, search]);

  /*
   * ============================================================
   * FILTER PENDING
   * ============================================================
   */

  const filteredPending = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return sales
      .filter(
        (sale) =>
          Number(sale.pendingAmount || 0) > 0,
      )
      .filter((sale) =>
        isWithinFilter(sale.createdAt),
      )
      .filter((sale) => {
        if (!query) {
          return true;
        }

        return sale.customerName
          .toLowerCase()
          .includes(query);
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      );
  }, [sales, filter, search]);

  /*
   * ============================================================
   * MARK PENDING AS PAID
   * ============================================================
   */

  const markAsPaid = (id: string) => {
    const updatedSales = sales.map((sale) => {
      if (sale.id !== id) return sale;

      return {
        ...sale,
        paidAmount: Number(sale.totalAmount || 0),
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
    window.dispatchEvent(new Event("chaicount_sales_updated"));
  };

  /*
   * ============================================================
   * CURRENT COUNT
   * ============================================================
   */

  const currentCount =
    activeTab === "Sales"
      ? filteredSales.length
      : activeTab === "Expenses"
      ? filteredExpenses.length
      : filteredPending.length;

  return (
    <main className="min-h-screen bg-[#09090b] text-white">

      <div className="mx-auto w-full max-w-md px-4 pb-10 pt-5">

        {/* ================= HEADER ================= */}

        <div className="mb-6 flex items-center gap-3">

          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800"
          >
            ←
          </button>

          <div>
            <h1 className="text-2xl font-extrabold text-white">
              History
            </h1>

            <p className="mt-1 text-xs text-zinc-500">
              View all your business transactions
            </p>
          </div>

        </div>

        {/* ================= TABS ================= */}

        <div className="mb-4 grid grid-cols-3 gap-2">

          <button
            type="button"
            onClick={() => {
              setActiveTab("Sales");
              setSearch("");
            }}
            className={`rounded-xl px-3 py-3 text-xs font-bold transition ${
              activeTab === "Sales"
                ? "bg-emerald-500 text-black"
                : "border border-zinc-800 bg-zinc-900 text-zinc-500"
            }`}
          >
            🧾 Sales
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("Expenses");
              setSearch("");
            }}
            className={`rounded-xl px-3 py-3 text-xs font-bold transition ${
              activeTab === "Expenses"
                ? "bg-rose-500 text-black"
                : "border border-zinc-800 bg-zinc-900 text-zinc-500"
            }`}
          >
            💸 Expenses
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("Pending");
              setSearch("");
            }}
            className={`rounded-xl px-3 py-3 text-xs font-bold transition ${
              activeTab === "Pending"
                ? "bg-amber-500 text-black"
                : "border border-zinc-800 bg-zinc-900 text-zinc-500"
            }`}
          >
            ⏳ Pending
          </button>

        </div>

        {/* ================= DATE FILTER ================= */}

        <div className="mb-4 grid grid-cols-4 gap-2">

          {(
            [
              "Today",
              "7 Days",
              "30 Days",
              "All",
            ] as DateFilter[]
          ).map((item) => (

            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-xl px-2 py-2.5 text-[11px] font-bold transition ${
                filter === item
                  ? activeTab === "Sales"
                    ? "bg-emerald-500 text-black"
                    : activeTab === "Expenses"
                    ? "bg-rose-500 text-black"
                    : "bg-amber-500 text-black"
                  : "border border-zinc-800 bg-zinc-900 text-zinc-500"
              }`}
            >
              {item}
            </button>

          ))}

        </div>

        {/* ================= SEARCH ================= */}

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder={
            activeTab === "Expenses"
              ? "Search expense..."
              : "Search customer..."
          }
          className="mb-4 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
        />

        {/* ================= COUNT ================= */}

        <div className="mb-4 flex items-center justify-between">

          <p className="text-xs font-semibold text-zinc-500">
            {currentCount}{" "}
            {activeTab === "Sales"
              ? currentCount === 1
                ? "sale"
                : "sales"
              : activeTab === "Expenses"
              ? currentCount === 1
                ? "expense"
                : "expenses"
              : currentCount === 1
              ? "pending"
              : "pendings"}
          </p>

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-xs font-semibold text-zinc-400"
            >
              Clear Search
            </button>
          )}

        </div>

        {/* =====================================================
            SALES
        ===================================================== */}

        {activeTab === "Sales" && (
          <section className="space-y-3">

            {filteredSales.length === 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-8 text-center">

                <p className="text-2xl">
                  🧾
                </p>

                <p className="mt-2 text-sm font-bold text-zinc-300">
                  No sales found
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Sales matching this filter
                  will appear here.
                </p>

              </div>
            )}

            {filteredSales.map((sale) => (

              <div
                key={sale.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <p className="truncate text-sm font-bold text-white">
                      {sale.customerName}
                    </p>

                    <p className="mt-1 text-[10px] text-zinc-600">
                      {new Date(
                        sale.createdAt,
                      ).toLocaleString("en-IN")}
                    </p>

                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ${
                      sale.paymentStatus ===
                      "Paid"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {sale.paymentStatus}
                  </span>

                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">

                  <div className="rounded-xl bg-zinc-950/70 p-2.5">
                    <p className="text-[9px] font-bold uppercase text-zinc-600">
                      Total
                    </p>

                    <p className="mt-1 text-sm font-extrabold text-white">
                      ₹
                      {Number(
                        sale.totalAmount || 0,
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-500/5 p-2.5">
                    <p className="text-[9px] font-bold uppercase text-zinc-600">
                      Paid
                    </p>

                    <p className="mt-1 text-sm font-extrabold text-emerald-400">
                      ₹
                      {Number(
                        sale.paidAmount || 0,
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-500/5 p-2.5">
                    <p className="text-[9px] font-bold uppercase text-zinc-600">
                      Pending
                    </p>

                    <p className="mt-1 text-sm font-extrabold text-amber-400">
                      ₹
                      {Number(
                        sale.pendingAmount || 0,
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-600">

                  <span>
                    Tea:{" "}
                    {sale.teaCups ??
                      sale.cups ??
                      0}{" "}
                    cups
                  </span>

                  <span>
                    Biscuit:{" "}
                    {sale.biscuitQuantity ??
                      0}
                  </span>

                </div>

              </div>

            ))}

          </section>
        )}

        {/* =====================================================
            EXPENSES
        ===================================================== */}

        {activeTab === "Expenses" && (
          <section className="space-y-3">

            {filteredExpenses.length === 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-8 text-center">

                <p className="text-2xl">
                  💸
                </p>

                <p className="mt-2 text-sm font-bold text-zinc-300">
                  No expenses found
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Expenses matching this filter
                  will appear here.
                </p>

              </div>
            )}

            {filteredExpenses.map((expense) => (

              <div
                key={expense.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <p className="truncate text-sm font-bold text-white">
                      {expense.item}
                    </p>

                    <p className="mt-1 text-[10px] text-zinc-600">
                      {new Date(
                        expense.createdAt,
                      ).toLocaleString("en-IN")}
                    </p>

                  </div>

                  <p className="shrink-0 text-base font-extrabold text-rose-400">
                    ₹
                    {Number(
                      expense.total || 0,
                    ).toLocaleString("en-IN")}
                  </p>

                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">

                  <div className="rounded-xl bg-zinc-950/70 p-3">

                    <p className="text-[9px] font-bold uppercase text-zinc-600">
                      Quantity
                    </p>

                    <p className="mt-1 text-sm font-extrabold text-white">
                      {expense.quantity}
                    </p>

                  </div>

                  <div className="rounded-xl bg-rose-500/5 p-3">

                    <p className="text-[9px] font-bold uppercase text-zinc-600">
                      Per Unit
                    </p>

                    <p className="mt-1 text-sm font-extrabold text-rose-400">
                      ₹
                      {Number(
                        expense.amount || 0,
                      ).toLocaleString("en-IN")}
                    </p>

                  </div>

                </div>

              </div>

            ))}

          </section>
        )}

        {/* =====================================================
            PENDING
        ===================================================== */}

        {activeTab === "Pending" && (
          <section className="space-y-3">

            {filteredPending.length === 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-8 text-center">

                <p className="text-2xl">
                  ⏳
                </p>

                <p className="mt-2 text-sm font-bold text-zinc-300">
                  No pending history
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Pending transactions matching
                  this filter will appear here.
                </p>

              </div>
            )}

            {filteredPending.map((sale) => (

              <div
                key={sale.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <p className="truncate text-sm font-bold text-white">
                      {sale.customerName}
                    </p>

                    <p className="mt-1 text-[10px] text-zinc-600">
                      {new Date(
                        sale.createdAt,
                      ).toLocaleString("en-IN")}
                    </p>

                  </div>

                  <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-1 text-[9px] font-bold text-amber-400">
                    Pending
                  </span>

                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">

                  <div className="rounded-xl bg-zinc-950/70 p-2.5">

                    <p className="text-[9px] font-bold uppercase text-zinc-600">
                      Total
                    </p>

                    <p className="mt-1 text-sm font-extrabold text-white">
                      ₹
                      {Number(
                        sale.totalAmount || 0,
                      ).toLocaleString("en-IN")}
                    </p>

                  </div>

                  <div className="rounded-xl bg-emerald-500/5 p-2.5">

                    <p className="text-[9px] font-bold uppercase text-zinc-600">
                      Paid
                    </p>

                    <p className="mt-1 text-sm font-extrabold text-emerald-400">
                      ₹
                      {Number(
                        sale.paidAmount || 0,
                      ).toLocaleString("en-IN")}
                    </p>

                  </div>

                  <div className="rounded-xl bg-amber-500/5 p-2.5">

                    <p className="text-[9px] font-bold uppercase text-zinc-600">
                      Due
                    </p>

                    <p className="mt-1 text-sm font-extrabold text-amber-400">
                      ₹
                      {Number(
                        sale.pendingAmount || 0,
                      ).toLocaleString("en-IN")}
                    </p>

                  </div>

                </div>

                {sale.paymentNote && (
                  <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2">

                    <p className="text-[10px] font-semibold text-zinc-600">
                      Note
                    </p>

                    <p className="mt-1 text-xs text-zinc-400">
                      {sale.paymentNote}
                    </p>

                  </div>
                )}

                <button
                  type="button"
                  onClick={() => markAsPaid(sale.id)}
                  className="mt-3 w-full rounded-xl bg-emerald-500 px-4 py-3 text-xs font-extrabold text-zinc-950 transition hover:bg-emerald-400 active:scale-[0.98]"
                >
                  ✓ Mark as Paid — ₹{Number(sale.pendingAmount || 0).toLocaleString("en-IN")}
                </button>

              </div>

            ))}

          </section>
        )}

      </div>

    </main>
  );
}

export default History;
