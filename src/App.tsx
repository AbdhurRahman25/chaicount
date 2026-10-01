import Header from "./components/Header";
import SummaryCard from "./components/SummaryCard";
import QuickAction from "./components/QuickAction";
import SalesEntry from "./components/SalesEntry";
import ExpenseEntry from "./components/ExpenseEntry";
function App() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="mx-auto max-w-md">
        <Header />

        <section className="grid grid-cols-1 gap-4">
          <SummaryCard
            title="Today's Sales"
            amount={1500}
            type="sales"
          />

          <SummaryCard
            title="Today's Expenses"
            amount={700}
            type="expense"
          />

          <SummaryCard
            title="Today's Profit"
            amount={800}
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

        <ExpenseEntry />

        <SalesEntry />
      </div>
    </main>
  );
}

export default App;