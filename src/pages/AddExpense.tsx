import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpenseEntry from "../components/ExpenseEntry";

type ExpenseRecord = { id: string; item: string; quantity: number; amount: number; total: number; createdAt: string; };
type AddExpenseProps = { onAddExpense: (record: ExpenseRecord) => void; };


type DateFilter = "Today" | "7 Days" | "30 Days" | "All";

function AddExpense({
  onAddExpense,
}: AddExpenseProps) {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(
    [],
  );

  const [filter, setFilter] =
    useState<DateFilter>("Today");

  const [search, setSearch] = useState("");

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

  useEffect(() => {
    loadExpenses();

    const handleUpdate = () => {
      loadExpenses();
    };

    window.addEventListener(
      "storage",
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
        "chaicount_expenses_updated",
        handleUpdate,
      );
    };
  }, []);

  const filteredExpenses = useMemo(() => {
    const now = new Date();

    return expenses
      .filter((expense) => {
        if (filter === "All") {
          return true;
        }

        const expenseDate = new Date(
          expense.createdAt,
        );

        if (Number.isNaN(expenseDate.getTime())) {
          return false;
        }

        if (filter === "Today") {
          return (
            expenseDate.getFullYear() ===
              now.getFullYear() &&
            expenseDate.getMonth() ===
              now.getMonth() &&
            expenseDate.getDate() ===
              now.getDate()
          );
        }

        const days =
          filter === "7 Days" ? 7 : 30;

        const difference =
          now.getTime() -
          expenseDate.getTime();

        return (
          difference >= 0 &&
          difference <=
            days *
              24 *
              60 *
              60 *
              1000
        );
      })
      .filter((expense) => {
        const query = search
          .trim()
          .toLowerCase();

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

  return (
    <main className="min-h-screen bg-[#09090b] text-white">

      <div className="mx-auto w-full max-w-md px-4 pb-10 pt-5">

        {/* ================= NAVIGATION ================= */}

        <div className="mb-5 space-y-2">

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-20 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left text-sm font-semibold text-zinc-300 mr-2 ml-1"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={() => navigate("/add-sale")}
            className="w-25 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-left text-sm font-semibold text-emerald-400 mr-2 ml-2"
          >
            + Add Sale
          </button>

        </div>

        {/* ================= PAGE TITLE ================= */}

        <div className="mb-5">

          <h1 className="text-2xl font-extrabold text-white">
            Add Expense
          </h1>

          <p className="mt-1 text-xs text-zinc-500">
            Record a new business expense
          </p>

        </div>

        {/* ================= EXPENSE FORM ================= */}

        <ExpenseEntry
          onAddExpense={(record) => {
            onAddExpense(record);

            setTimeout(() => {
              loadExpenses();
            }, 50);
          }}
        />

      </div>

    </main>
  );
}

export default AddExpense;