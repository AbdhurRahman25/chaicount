import { useState } from "react";
import Header from "./components/Header";
import SummaryCard from "./components/SummaryCard";
import QuickAction from "./components/QuickAction";
import SalesEntry from "./components/SalesEntry";
import ExpenseEntry from "./components/ExpenseEntry";

function App() {
  const [sales, setSales] = useState(0);
  const [expenses, setExpenses] = useState(0);

  const profit = sales - expenses;

  function handleAddSale(total: number) {
    setSales((currentSales) => currentSales + total);
  }

  function handleAddExpense(total: number) {
    setExpenses((currentExpenses) => currentExpenses + total);
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="mx-auto max-w-md">
        <Header />

        <section className="grid grid-cols-1 gap-4">
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
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>

          <div className="flex gap-3">
            <QuickAction label="Sale" />
            <QuickAction label="Expense" />
          </div>
        </section>

        <SalesEntry onAddSale={handleAddSale} />

        <ExpenseEntry onAddExpense={handleAddExpense} />
      </div>
    </main>
  );
}

export default App;