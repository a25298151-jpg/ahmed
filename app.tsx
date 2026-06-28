import { useState, useMemo, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, Wifi, TrendingUp, AlertCircle, Plus, Search, RefreshCw, ChevronDown, X, Trash2, PhoneCall, LogOut, Eye, EyeOff, Lock, User } from "lucide-react";

// ─── إعدادات الاتصال بقاعدة البيانات ───────────────────────────────────────────
// استبدل هذه القيم بروابط مشروعك الخاص من إعدادات سوبابيس (API Settings)
const SUPABASE_URL = "https://udjnzsaypjcyxgbjngxe.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkam56c2F5cGpjeXhnYmpuZ3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NTgyOTUsImV4cCI6MjA5ODIzNDI5NX0.ktQoyU0XcPtEkdVF_C06B2yKLyZDZV5hSLnR-z9DFrs";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CREDENTIALS = { username: "admin", password: "1234" };

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (user === CREDENTIALS.username && pass === CREDENTIALS.password) {
      localStorage.setItem("net-auth", "1");
      onLogin();
    } else {
      setError("اسم المستخدم أو كلمة المرور غلط");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-[Cairo,sans-serif]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/30">
            <Wifi className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">إدارة استهلاك النت</h1>
          <p className="text-slate-400 text-sm mt-1">سجّل دخولك للمتابعة</p>
        </div>

        <form onSubmit={handleLogin}
          className={`bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700 space-y-4 transition-all ${shake ? "animate-[shake_0.4s_ease]" : ""}`}>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">اسم المستخدم</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={user} onChange={e => { setUser(e.target.value); setError(""); }}
                placeholder="أدخل اسم المستخدم"
                className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 pr-9 pl-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={pass} onChange={e => { setPass(e.target.value); setError(""); }}
                type={showPass ? "text" : "password"}
                placeholder="أدخل كلمة المرور"
                className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 pr-9 pl-9 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2">
              {error}
            </p>
          )}

          <button type="submit"
            className="w-full bg-sky-500 hover:bg-sky-400 text-white rounded-xl py-3 font-bold text-sm transition-colors shadow-lg shadow-sky-500/20 mt-2">
            دخول
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface TopUp { id: string; date: string; gb: number; note: string; }
interface UsageLog { id: string; date: string; gb: number; note: string; }
interface Customer {
  id: string;
  name: string;
  phone: string;
  topUps: TopUp[];
  usageLogs: UsageLog[];
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => new Date().toISOString().slice(0, 10);
const fmt = (d: string) => new Date(d).toLocaleDateString("ar-EG", { day: "2-digit", month: "short" });

function customerStats(c: Customer) {
  const allocated = c.topUps?.reduce((s, t) => s + Number(t.gb), 0) || 0;
  const consumed = c.usageLogs?.reduce((s, u) => s + Number(u.gb), 0) || 0;
  const remaining = allocated - consumed;
  const pct = allocated > 0 ? Math.min((consumed / allocated) * 100, 100) : 0;
  return { allocated, consumed, remaining, pct };
}

// Sub-components (StatCard, UsageBar, Badge, Modal unchanged for space)
function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function UsageBar({ pct, size = "md" }: { pct: number; size?: "sm" | "md" }) {
  const h = size === "sm" ? "h-1.5" : "h-2.5";
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-400" : "bg-emerald-500";
  return (
    <div className={`w-full bg-muted rounded-full overflow-hidden ${h}`}>
      <div className={`${h} ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function Badge({ children, variant }: { children: React.ReactNode; variant: "green" | "amber" | "red" | "blue" }) {
  const cls = { green: "bg-emerald-100 text-emerald-700", amber: "bg-amber-100 text-amber-700", red: "bg-red-100 text-red-700", blue: "bg-sky-100 text-sky-700" }[variant];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{children}</span>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-border">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

type Tab = "dashboard" | "customers" | "report";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem("net-auth") === "1");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [modal, setModal] = useState<null | "addCustomer" | "topUp" | "logUsage" | "detail">(null);
  const [form, setForm] = useState({ name: "", phone: "", gb: "", note: "" });

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  function logout() {
    localStorage.removeItem("net-auth");
    setLoggedIn(false);
  }

  // ── جلب البيانات بالكامل من قاعدة البيانات ────────────────────────────────────
  async function fetchCustomers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("customers")
      .select(`
        id, name, phone, created_at,
        topUps:top_ups(id, date, gb, note),
        usageLogs:usage_logs(id, date, gb, note)
      `);
    
    if (!error && data) {
      // تحويل أسماء الحقول لتتوافق مع الـ Interface في الكود
      const formatted: Customer[] = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone || "",
        createdAt: c.created_at,
        topUps: c.topUps || [],
        usageLogs: c.usageLogs || []
      }));
      setCustomers(formatted);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = useMemo(() =>
    customers.filter(c => c.name.includes(search) || c.phone.includes(search)),
    [customers, search]
  );

  const totals = useMemo(() => {
    const allocated = customers.reduce((s, c) => s + customerStats(c).allocated, 0);
    const consumed = customers.reduce((s, c) => s + customerStats(c).consumed, 0);
    const lowCount = customers.filter(c => customerStats(c).pct >= 80).length;
    return { allocated, consumed, remaining: allocated - consumed, lowCount };
  }, [customers]);

  const chartData = useMemo(() =>
    [...customers]
      .map(c => ({ name: c.name.split(" ")[0], ...customerStats(c) }))
      .sort((a, b) => b.consumed - a.consumed)
      .slice(0, 6),
    [customers]
  );

  // ── العمليات على قاعدة البيانات (Insert / Delete) ─────────────────────────────
  async function addCustomer() {
    if (!form.name.trim()) return;
    const newId = uid();
    const { error } = await supabase.from("customers").insert({
      id: newId,
      name: form.name.trim(),
      phone: form.phone.trim()
    });

    if (!error) {
      fetchCustomers();
      setForm({ name: "", phone: "", gb: "", note: "" });
      setModal(null);
    }
  }

  async function addTopUp() {
    if (!selected || !form.gb) return;
    const gb = parseFloat(form.gb);
    if (isNaN(gb) || gb <= 0) return;

    const { error } = await supabase.from("top_ups").insert({
      id: uid(),
      customer_id: selected.id,
      gb: gb,
      note: form.note
    });

    if (!error) {
      fetchCustomers();
      setForm({ name: "", phone: "", gb: "", note: "" });
      setModal(null);
      setSelected(null);
    }
  }

  async function logUsage() {
    if (!selected || !form.gb) return;
    const gb = parseFloat(form.gb);
    if (isNaN(gb) || gb <= 0) return;

    const { error } = await supabase.from("usage_logs").insert({
      id: uid(),
      customer_id: selected.id,
      gb: gb,
      note: form.note
    });

    if (!error) {
      fetchCustomers();
      setForm({ name: "", phone: "", gb: "", note: "" });
      setModal(null);
      setSelected(null);
    }
  }

  async function deleteCustomer(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المشترك نهائياً؟")) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (!error) {
      fetchCustomers();
      setModal(null);
      setSelected(null);
    }
  }

  function openDetail(c: Customer) { setSelected(c); setModal("detail"); }
  function openTopUp(c: Customer) { setSelected(c); setForm({ name: "", phone: "", gb: "", note: "" }); setModal("topUp"); }
  function openLogUsage(c: Customer) { setSelected(c); setForm({ name: "", phone: "", gb: "", note: "" }); setModal("logUsage"); }

  const selectedLive = selected ? customers.find(c => c.id === selected.id) ?? selected : null;

  return (
    <div dir="rtl" className="min-h-screen bg-background font-[Cairo,sans-serif]">
      {/* Header */}
      <header className="bg-[#0f172a] text-white px-4 pt-10 pb-6">
        <div className="max-w-2xl mx-auto flex items-start justify-between">
          <div>
            <p className="text-sky-400 text-sm font-semibold mb-1">لوحة تحكم</p>
            <h1 className="text-2xl font-extrabold">إدارة استهلاك النت</h1>
            <p className="text-slate-400 text-sm mt-1">{customers.length} مشترك مسجل</p>
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-xs bg-slate-800 rounded-xl px-3 py-2 border border-slate-700">
            <LogOut className="w-3.5 h-3.5" /> خروج
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-[#0f172a] px-4 pb-0">
        <div className="max-w-2xl mx-auto flex gap-0 border-b border-slate-700">
          {([["dashboard", "الرئيسية"], ["customers", "المشتركين"], ["report", "تقرير الشهر"]] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px ${tab === id ? "border-sky-400 text-sky-400" : "border-transparent text-slate-400 hover:text-white"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground text-sm">جاري تحميل البيانات من قاعدة البيانات...</div>
      ) : (
        <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
          {/* DASHBOARD TAB */}
          {tab === "dashboard" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={<Users className="w-5 h-5 text-sky-600" />} label="إجمالي المشتركين" value={`${customers.length}`} color="bg-sky-100" />
                <StatCard icon={<Wifi className="w-5 h-5 text-emerald-600" />} label="جيجات متاحة" value={`${totals.allocated} GB`} color="bg-emerald-100" />
                <StatCard icon={<TrendingUp className="w-5 h-5 text-violet-600" />} label="إجمالي الاستهلاك" value={`${totals.consumed} GB`} color="bg-violet-100" />
                <StatCard icon={<AlertCircle className="w-5 h-5 text-red-500" />} label="على وشك الانتهاء" value={`${totals.lowCount}`} sub="أكثر من 80%" color="bg-red-100" />
              </div>

              <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
                <h3 className="text-sm font-bold text-foreground mb-4">استهلاك كل مشترك (GB)</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData} barSize={28}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "Cairo", fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ fontFamily: "Cairo", fontSize: 12, borderRadius: 10, border: "none" }} formatter={(v: number) => [`${v} GB`]} />
                    <Bar dataKey="consumed" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.pct >= 90 ? "#ef4444" : entry.pct >= 70 ? "#f59e0b" : "#10b981"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {customers.filter(c => customerStats(c).pct >= 80).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <p className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> تحذير — جيجات على وشك الانتهاء
                  </p>
                  <div className="space-y-2">
                    {customers.filter(c => customerStats(c).pct >= 80).map(c => {
                      const s = customerStats(c);
                      return (
                        <div key={c.id} className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-red-800">{c.name}</span>
                          <span className="text-xs text-red-600">{s.remaining.toFixed(1)} GB متبقي</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* CUSTOMERS TAB */}
          {tab === "customers" && (
            <>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث بالاسم أو الرقم..." className="w-full bg-card border border-border rounded-xl py-2.5 pr-9 pl-3 text-sm" />
                </div>
                <button onClick={() => setModal("addCustomer")} className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-sky-600 shrink-0">
                  <Plus className="w-4 h-4" /> إضافة
                </button>
              </div>

              <div className="space-y-3">
                {filtered.map(c => {
                  const s = customerStats(c);
                  return (
                    <div key={c.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold text-foreground">{c.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <PhoneCall className="w-3 h-3" /> {c.phone || "لا يوجد رقم"}
                            </p>
                          </div>
                          <Badge variant={s.pct >= 90 ? "red" : s.pct >= 70 ? "amber" : s.remaining === 0 && s.allocated === 0 ? "blue" : "green"}>
                            {s.pct >= 90 ? "حرج" : s.pct >= 70 ? "تحذير" : s.allocated === 0 ? "بدون باقة" : "جيد"}
                          </Badge>
                        </div>

                        <div className="mb-2"><UsageBar pct={s.pct} /></div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-3">
                          <span>استهلك: <strong className="text-foreground">{s.consumed} GB</strong></span>
                          <span>متبقي: <strong className={s.remaining < 2 && s.allocated > 0 ? "text-red-500" : "text-emerald-600"}>{s.remaining.toFixed(1)} GB</strong></span>
                          <span>المجموع: <strong className="text-foreground">{s.allocated} GB</strong></span>
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => openTopUp(c)} className="flex-1 flex items-center justify-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-xl py-2 text-xs font-bold">
                            <Plus className="w-3.5 h-3.5" /> تجديد جيجات
                          </button>
                          <button onClick={() => openLogUsage(c)} className="flex-1 flex items-center justify-center gap-1.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-xl py-2 text-xs font-bold">
                            <RefreshCw className="w-3.5 h-3.5" /> تسجيل استهلاك
                          </button>
                          <button onClick={() => openDetail(c)} className="w-9 flex items-center justify-center bg-muted rounded-xl text-muted-foreground">
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* REPORT TAB */}
          {tab === "report" && (
            <>
              <div className="bg-[#0f172a] text-white rounded-2xl p-5">
                <p className="text-sky-400 text-xs font-semibold mb-1">ملخص</p>
                <h2 className="text-xl font-extrabold">تقرير الشهر الحالي</h2>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div><p className="text-2xl font-black text-sky-400">{totals.allocated}</p><p className="text-xs text-slate-400">إجمالي GB</p></div>
                  <div><p className="text-2xl font-black text-emerald-400">{totals.consumed}</p><p className="text-xs text-slate-400">مستهلك</p></div>
                  <div><p className="text-2xl font-black text-violet-400">{totals.remaining}</p><p className="text-xs text-slate-400">متبقي</p></div>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border"><h3 className="font-bold text-foreground text-sm">تفاصيل كل مشترك</h3></div>
                <div className="divide-y divide-border">
                  {[...customers].sort((a, b) => customerStats(b).consumed - customerStats(a).consumed).map(c => {
                    const s = customerStats(c);
                    return (
                      <div key={c.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-sm text-foreground">{c.name}</p>
                          <Badge variant={s.pct >= 90 ? "red" : s.pct >= 70 ? "amber" : "green"}>{s.pct.toFixed(0)}%</Badge>
                        </div>
                        <UsageBar pct={s.pct} size="sm" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                          <span>استهلك {s.consumed} GB</span>
                          <span>من أصل {s.allocated} GB</span>
                          <span className={s.remaining < 2 && s.allocated > 0 ? "text-red-500 font-bold" : ""}>متبقي {s.remaining.toFixed(1)} GB</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </main>
      )}

      {/* MODALS */}
      {modal === "addCustomer" && (
        <Modal title="إضافة مشترك جديد" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="الاسم الكامل *" className="input-field" />
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="رقم الجوال" className="input-field" type="tel" />
            <button onClick={addCustomer} disabled={!form.name.trim()} className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-bold text-sm disabled:opacity-40">إضافة المشترك</button>
          </div>
        </Modal>
      )}

      {modal === "topUp" && selected && (
        <Modal title={`تجديد جيجات — ${selected.name}`} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <input value={form.gb} onChange={e => setForm(f => ({ ...f, gb: e.target.value }))} placeholder="عدد الجيجات *" className="input-field" type="number" min="0.1" step="0.5" />
            <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="ملاحظة (اختياري)" className="input-field" />
            <button onClick={addTopUp} disabled={!form.gb} className="w-full bg-sky-500 text-white rounded-xl py-3 font-bold text-sm disabled:opacity-40">إضافة الجيجات</button>
          </div>
        </Modal>
      )}

      {modal === "logUsage" && selected && (
        <Modal title={`تسجيل استهلاك — ${selected.name}`} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <input value={form.gb} onChange={e => setForm(f => ({ ...f, gb: e.target.value }))} placeholder="الجيجات المستهلكة *" className="input-field" type="number" min="0.1" step="0.5" />
            <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="ملاحظة (اختياري)" className="input-field" />
            <button onClick={logUsage} disabled={!form.gb} className="w-full bg-violet-600 text-white rounded-xl py-3 font-bold text-sm disabled:opacity-40">تسجيل الاستهلاك</button>
          </div>
        </Modal>
      )}

      {modal === "detail" && selectedLive && (() => {
        const s = customerStats(selectedLive);
        return (
          <Modal title={selectedLive.name} onClose={() => setModal(null)}>
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5"><PhoneCall className="w-3.5 h-3.5" /> {selectedLive.phone || "لا يوجد رقم"}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[["المخصص", `${s.allocated} GB`, "text-sky-600"], ["المستهلك", `${s.consumed} GB`, "text-violet-600"], ["المتبقي", `${s.remaining.toFixed(1)} GB`, s.remaining < 2 && s.allocated > 0 ? "text-red-500" : "text-emerald-600"]].map(([l, v, cls]) => (
                  <div key={l} className="bg-muted rounded-xl p-3">
                    <p className={`font-bold text-base ${cls}`}>{v}</p>
                    <p className="text-xs text-muted-foreground">{l}</p>
                  </div>
                ))}
              </div>
              <UsageBar pct={s.pct} />

              {selectedLive.topUps?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground mb-2">سجل التجديدات</p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {selectedLive.topUps.map(t => (
                      <div key={t.id} className="flex justify-between text-xs bg-sky-50 rounded-lg px-3 py-1.5">
                        <span className="text-sky-700 font-semibold">+{t.gb} GB</span>
                        <span className="text-muted-foreground">{t.note || "—"}</span>
                        <span className="text-muted-foreground font-mono">{fmt(t.date)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedLive.usageLogs?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground mb-2">سجل الاستهلاك</p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {selectedLive.usageLogs.map(u => (
                      <div key={u.id} className="flex justify-between text-xs bg-violet-50 rounded-lg px-3 py-1.5">
                        <span className="text-violet-700 font-semibold">-{u.gb} GB</span>
                        <span className="text-muted-foreground">{u.note || "—"}</span>
                        <span className="text-muted-foreground font-mono">{fmt(u.date)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button onClick={() => { setModal(null); openTopUp(selectedLive); }} className="flex-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-xl py-2.5 text-sm font-bold">+ تجديد</button>
                <button onClick={() => { setModal(null); openLogUsage(selectedLive); }} className="flex-1 bg-violet-50 text-violet-700 border border-violet-200 rounded-xl py-2.5 text-sm font-bold">استهلاك</button>
                <button onClick={() => deleteCustomer(selectedLive.id)} className="w-11 flex items-center justify-center bg-red-50 text-red-500 border border-red-200 rounded-xl"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </Modal>
        );
      })()}

      <style>{`
        .input-field { width: 100%; background: #f8fafc; border: 1px solid rgba(15,23,42,0.1); border-radius: 0.75rem; padding: 0.75rem 1rem; font-size: 0.875rem; font-family: Cairo, sans-serif; color: #0f172a; direction: rtl; outline: none; transition: border-color 0.15s; }
        .input-field:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.15); }
        .input-field::placeholder { color: #94a3b8; }
      `}</style>
    </div>
  );
}
