import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SalesEntry from "../components/SalesEntry";

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

type AddSaleProps = {
  onAddSale: (total: number) => void;
  pricePerCup: number;
  onPriceChange: (value: number) => void;
};

type DateFilter = "Today" | "7 Days" | "30 Days" | "All";

function AddSale({
  onAddSale,
  pricePerCup,
  onPriceChange,
}: AddSaleProps) {
  const navigate = useNavigate();

  const [sales, setSales] = useState<CustomerSale[]>([]);
  const [filter, setFilter] = useState<DateFilter>("Today");
  const [search, setSearch] = useState("");

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

  useEffect(() => {
    loadSales();

    const handleUpdate = () => {
      loadSales();
    };

    window.addEventListener(
      "chaicount_sales_updated",
      handleUpdate,
    );

    window.addEventListener(
      "storage",
      handleUpdate,
    );

    return () => {
      window.removeEventListener(
        "chaicount_sales_updated",
        handleUpdate,
      );

      window.removeEventListener(
        "storage",
        handleUpdate,
      );
    };
  }, []);

  const filteredSales = useMemo(() => {
    const now = new Date();

    return sales
      .filter((sale) => {
        if (filter === "All") {
          return true;
        }

        const saleDate = new Date(sale.createdAt);

        if (Number.isNaN(saleDate.getTime())) {
          return false;
        }

        if (filter === "Today") {
          return (
            saleDate.getFullYear() === now.getFullYear() &&
            saleDate.getMonth() === now.getMonth() &&
            saleDate.getDate() === now.getDate()
          );
        }

        const days =
          filter === "7 Days" ? 7 : 30;

        const difference =
          now.getTime() - saleDate.getTime();

        return (
          difference >= 0 &&
          difference <=
            days * 24 * 60 * 60 * 1000
        );
      })
      .filter((sale) => {
        const query = search
          .trim()
          .toLowerCase();

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
            onClick={() => navigate("/add-expense")}
            className="w-25 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-left text-sm font-semibold text-rose-400 mr-2 ml-2"
          >
            − Add Expense
          </button>

        </div>

        {/* ================= PAGE TITLE ================= */}

        <div className="mb-5">
          <h1 className="text-2xl font-extrabold text-white">
            Add Sale
          </h1>

          <p className="mt-1 text-xs text-zinc-500">
            Record a new tea and biscuit sale
          </p>
        </div>

        {/* ================= DEFAULT PRICE ================= */}

        <section className="relative mb-5 overflow-hidden rounded-3xl border border-amber-500/15 bg-gradient-to-br from-amber-950/30 via-zinc-900 to-zinc-900 p-5">

          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="relative">

            <div className="flex items-center justify-between gap-3">

              <div>
                <h2 className="text-base font-bold text-white">
                  Default Tea Price
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Change once and use everywhere
                </p>
              </div>

              <div className="flex items-center gap-2">

                <span className="text-lg font-bold text-amber-400">
                  ₹
                </span>

                <input
                  type="number"
                  min="1"
                  inputMode="decimal"
                  value={pricePerCup}
                  onChange={(e) =>
                    onPriceChange(
                      Number(e.target.value),
                    )
                  }
                  className="w-20 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-center text-sm font-bold text-white outline-none focus:border-amber-500/50"
                />

              </div>

            </div>

            <div className="mt-4 rounded-xl border border-amber-500/10 bg-amber-500/5 px-3 py-2.5">

              <p className="text-[11px] text-zinc-500">
                Current tea price:

                <span className="ml-1 font-bold text-amber-400">
                  ₹{pricePerCup}
                </span>

                <span className="ml-1">
                  per cup
                </span>
              </p>

            </div>

          </div>

        </section>

        {/* ================= SALE FORM ================= */}

        <SalesEntry
          onAddSale={(total) => {
            onAddSale(total);

            setTimeout(() => {
              loadSales();
            }, 50);
          }}
          pricePerCup={pricePerCup}
        />
        
      </div>
    </main>
  );
}

export default AddSale;