import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import AddSale from "./pages/AddSale";
import AddExpense from "./pages/AddExpense";
import Header from "./components/Header";
import SummaryCard from "./components/SummaryCard";
import QuickAction from "./components/QuickAction";
import SalesEntry from "./components/SalesEntry";
import ExpenseEntry from "./components/ExpenseEntry";
import CustomerDetails from "./components/CustomerDetails";
import History from "./pages/History";
type CustomerSale = {
  id: string;
  customerName: string;

  teaCups?: number;
  teaPricePerCup?: number;
  teaTotal?: number;

  biscuitQuantity?: number;
  biscuitPrice?: number;
  biscuitTotal?: number;

  // Old tea-only records
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

function App() {
  /*
   * ============================================================
   * DEFAULT TEA PRICE
   * ============================================================
   */

  const [pricePerCup, setPricePerCup] = useState<number>(() => {
    const saved = localStorage.getItem(
      "chaicount_price_per_cup",
    );

    return saved ? Number(saved) : 10;
  });

  /*
   * ============================================================
   * CUSTOMER SALES
   * ============================================================
   */

  const [customerSales, setCustomerSales] =
    useState<CustomerSale[]>(() => {
      const saved = localStorage.getItem(
        "chaicount_customer_sales",
      );

      if (!saved) {
        return [];
      }

      try {
        const parsed = JSON.parse(saved);

        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    });

  /*
   * ============================================================
   * EXPENSES
   * ============================================================
   */

  const [expenseRecords, setExpenseRecords] =
    useState<ExpenseRecord[]>(() => {
      const saved = localStorage.getItem(
        "chaicount_expense_records",
      );

      if (!saved) {
        return [];
      }

      try {
        const parsed = JSON.parse(saved);

        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    });

  /*
   * ============================================================
   * SAVE PRICE
   * ============================================================
   */

  useEffect(() => {
    localStorage.setItem(
      "chaicount_price_per_cup",
      String(pricePerCup),
    );
  }, [pricePerCup]);

  /*
   * ============================================================
   * SAVE CUSTOMER SALES
   * ============================================================
   */

  useEffect(() => {
    localStorage.setItem(
      "chaicount_customer_sales",
      JSON.stringify(customerSales),
    );
  }, [customerSales]);

  /*
   * ============================================================
   * SAVE EXPENSES
   * ============================================================
   */

  useEffect(() => {
    localStorage.setItem(
      "chaicount_expense_records",
      JSON.stringify(expenseRecords),
    );
  }, [expenseRecords]);

  /*
   * ============================================================
   * SALES TOTAL
   * ============================================================
   */

  const isToday = (createdAt: string) => {
    const date = new Date(createdAt); const now = new Date();
    return !Number.isNaN(date.getTime()) && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  };
  const todaySales = useMemo(() => customerSales.filter(s => isToday(s.createdAt)), [customerSales]);
  const todayExpenses = useMemo(() => expenseRecords.filter(e => isToday(e.createdAt)), [expenseRecords]);
  const sales = useMemo(() => todaySales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0), [todaySales]);
  const paidAmount = useMemo(() => todaySales.reduce((sum, sale) => sum + Number(sale.paidAmount || 0), 0), [todaySales]);
  const pendingAmount = useMemo(() => todaySales.reduce((sum, sale) => sum + Number(sale.pendingAmount || 0), 0), [todaySales]);
  const expenses = useMemo(() => todayExpenses.reduce((sum, expense) => sum + Number(expense.total || 0), 0), [todayExpenses]);
  const profit = sales - expenses;

  /*
   * ============================================================
   * CUSTOMER COUNT
   * ============================================================
   */

  const customerCount = useMemo(() => {
    return new Set(
      customerSales.map((sale) =>
        sale.customerName.trim().toLowerCase(),
      ),
    ).size;
  }, [customerSales]);

  /*
   * ============================================================
   * PENDING CUSTOMER COUNT
   * ============================================================
   */

  const pendingCustomerCount = useMemo(() => {
    return new Set(
      customerSales
        .filter(
          (sale) =>
            Number(sale.pendingAmount || 0) > 0,
        )
        .map((sale) =>
          sale.customerName
            .trim()
            .toLowerCase(),
        ),
    ).size;
  }, [customerSales]);

  /*
   * ============================================================
   * ADD SALE
   *
   * SalesEntry already saves customer details.
   * Here we reload the data so App summary updates immediately.
   * ============================================================
   */

  function handleAddSale(total: number) {
    void total;

    const saved = localStorage.getItem(
      "chaicount_customer_sales",
    );

    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setCustomerSales(parsed);
      }
    } catch {
      // Ignore invalid localStorage data.
    }
  }

  /*
   * ============================================================
   * ADD EXPENSE
   * ============================================================
   */

  function handleAddExpense(record: ExpenseRecord) {
    setExpenseRecords(current => {
      const updated = [record, ...current];
      localStorage.setItem("chaicount_expense_records", JSON.stringify(updated));
      return updated;
    });
    window.dispatchEvent(new Event("chaicount_expenses_updated"));
  }

  /*
   * ============================================================
   * PRICE CHANGE
   * ============================================================
   */

  function handlePriceChange(value: number) {
    if (!Number.isFinite(value) || value <= 0) {
      return;
    }

    setPricePerCup(value);
  }

  /*
   * ============================================================
   * REFRESH CUSTOMER DATA
   * ============================================================
   */

  useEffect(() => {
    const handleStorageUpdate = () => {
      const saved = localStorage.getItem(
        "chaicount_customer_sales",
      );

      if (!saved) {
        setCustomerSales([]);
        return;
      }

      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setCustomerSales(parsed);
        }
      } catch {
        setCustomerSales([]);
      }
    };

    /*
     * CustomerDetails will dispatch this event when
     * Mark as Paid / Delete is used.
     */
    window.addEventListener(
      "chaicount_sales_updated",
      handleStorageUpdate,
    );

    return () => {
      window.removeEventListener(
        "chaicount_sales_updated",
        handleStorageUpdate,
      );
    };
  }, []);
  return (
  <BrowserRouter>

    <Routes>

      {/* ================= DASHBOARD ================= */}

      <Route
        path="/"
        element={
          <main className="min-h-screen bg-[#09090b] text-white">

            <div className="mx-auto w-full max-w-md px-4 pb-8 pt-5">

              <Header />

              {/* MAIN SUMMARY */}

              <section className="mt-6 space-y-3">

                <SummaryCard
                  title="Today's Sales"
                  amount={sales}
                  type="sales"
                />

                <SummaryCard
                  title="Today's Expenses"
                  amount={expenses}
                  type="expense"
                />

                <SummaryCard
                  title="Today's Profit"
                  amount={profit}
                  type="profit"
                />

                <SummaryCard
                  title="Total Pending"
                  amount={pendingAmount}
                  type="pending"
                />

              </section>

              {/* PAYMENT SUMMARY */}

              <section className="mt-4 grid grid-cols-2 gap-3">

                <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                    Amount Paid
                  </p>

                  <p className="mt-1 text-xl font-extrabold text-emerald-400">
                    ₹{paidAmount.toLocaleString("en-IN")}
                  </p>

                </div>

                <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                    Pending
                  </p>

                  <p className="mt-1 text-xl font-extrabold text-amber-400">
                    ₹{pendingAmount.toLocaleString("en-IN")}
                  </p>

                </div>

              </section>

              {/* CUSTOMER INFO */}

              <section className="mt-3 grid grid-cols-2 gap-3">

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                    Customers
                  </p>

                  <p className="mt-1 text-xl font-extrabold text-white">
                    {customerCount}
                  </p>

                </div>

                <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-4">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                    Customers Due
                  </p>

                  <p className="mt-1 text-xl font-extrabold text-red-400">
                    {pendingCustomerCount}
                  </p>

                </div>

              </section>

              {/* QUICK ACTIONS */}

              <section className="mt-7">

                <div className="mb-3">

                  <h2 className="text-lg font-bold text-white">
                    Quick Actions
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    Record your daily transactions
                  </p>

                </div>

                <div className="grid grid-cols-4 gap-3">

                  <QuickAction label="Sale" />

                  <QuickAction label="Expense" />

                   <QuickAction label="History" />

                </div>

              </section>

              {/* FOOTER */}

              <footer className="mt-8 border-t border-zinc-800 pt-5 text-center">

                <p className="text-xs text-zinc-600">
                  ChaiCount • Tea Business Management
                </p>

              </footer>

            </div>

          </main>
        }
      />

      {/* ================= ADD SALE ================= */}

      <Route
        path="/add-sale"
        element={
          <AddSale
            onAddSale={handleAddSale}
            pricePerCup={pricePerCup}
            onPriceChange={handlePriceChange}
          />
        }
      />

      {/* ================= ADD EXPENSE ================= */}

      <Route
        path="/add-expense"
        element={
          <AddExpense
            onAddExpense={handleAddExpense}
          />
        }
      />

      <Route
        path="/history"
        element={<History />}
/>

    </Routes>

  </BrowserRouter>
);
                
}

export default App;