import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type CustomerSale = {
  id: string;
  customerName: string;
  pendingAmount: number;
  paymentStatus: "Paid" | "Pending";
};

function Header() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [pendingSales, setPendingSales] = useState<CustomerSale[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
    const saved = localStorage.getItem("chaicount_customer_sales");
    if (!saved) return setPendingSales([]);
    try {
      const parsed = JSON.parse(saved);
      setPendingSales(
        Array.isArray(parsed)
          ? parsed.filter((sale: CustomerSale) => Number(sale.pendingAmount || 0) > 0)
          : [],
      );
    } catch {
      setPendingSales([]);
    }
  };

  useEffect(() => {
    loadNotifications();
    const update = () => loadNotifications();
    window.addEventListener("storage", update);
    window.addEventListener("chaicount_sales_updated", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("chaicount_sales_updated", update);
    };
  }, []);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationRef.current && !notificationRef.current.contains(target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <header className="relative overflow-visible rounded-3xl border border-zinc-800 bg-zinc-900/80 p-3 shadow-xl shadow-black/20">
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-2xl">☕</div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">ChaiCount</h1>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Business Manager</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div ref={notificationRef} className="relative">
              <button type="button" onClick={() => { loadNotifications(); setShowNotifications(v => !v); setShowProfile(false); }} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-base transition active:scale-95" aria-label="Notifications">
                🔔
                {pendingSales.length > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{pendingSales.length > 9 ? "9+" : pendingSales.length}</span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl">
                  <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-white">Notifications</h3><span className="text-[10px] text-zinc-500">{pendingSales.length} pending</span></div>
                  {pendingSales.length === 0 ? <p className="py-6 text-center text-xs text-zinc-500">✅ No pending payments</p> : <div className="mt-3 space-y-2">{pendingSales.slice(0, 5).map(sale => <button key={sale.id} type="button" onClick={() => { setShowNotifications(false); navigate("/history?tab=pending"); }} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-left hover:bg-zinc-800"><div className="flex justify-between gap-2"><span className="truncate text-xs font-bold text-white">{sale.customerName}</span><span className="text-xs font-bold text-amber-400">₹{Number(sale.pendingAmount).toLocaleString("en-IN")}</span></div><p className="mt-1 text-[10px] text-zinc-600">Pending payment</p></button>)}</div>}
                  {pendingSales.length > 0 && <button type="button" onClick={() => { setShowNotifications(false); navigate("/history"); }} className="mt-3 w-full rounded-xl bg-amber-500 px-3 py-2.5 text-xs font-bold text-zinc-950">View Pending History</button>}
                </div>
              )}
            </div>

            <div ref={profileRef} className="relative">
              <button type="button" onClick={() => { setShowProfile(v => !v); setShowNotifications(false); }} className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-sm transition active:scale-95" aria-label="Profile">👤</button>
              {showProfile && <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
                <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-xl">☕</div><div><p className="text-sm font-bold text-white">ChaiCount</p><p className="text-[10px] text-zinc-600">Tea Business Manager</p></div></div>
                <div className="my-4 h-px bg-zinc-800" />
                <p className="text-[10px] text-zinc-500">Your transactions are stored locally on this device.</p>
                <button type="button" onClick={() => { setShowProfile(false); navigate("/history"); }} className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-xs font-bold text-zinc-300 hover:bg-zinc-800">View Transaction History</button>
              </div>}
            </div>
          </div>
        </div>

        <div className="my-5 h-px bg-zinc-800" />
        <div>
          <p className="text-xs font-medium text-zinc-500">TODAY'S OVERVIEW</p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <div><h2 className="text-lg font-bold text-zinc-100">Welcome back 👋</h2><p className="mt-1 text-xs leading-relaxed text-zinc-500">Keep track of your tea business easily.</p></div>
            <div className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5"><div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /><span className="text-[9px] font-bold uppercase tracking-wide text-emerald-400">Active</span></div></div>
          </div>
        </div>
      </div>
    </header>
  );
}
export default Header;
