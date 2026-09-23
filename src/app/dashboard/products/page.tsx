import { TopBar } from "@/components/admin/top-bar";
import { products, CATEGORIES } from "@/lib/mock-data";
import { formatToman, toFa } from "@/lib/utils";
import { Plus, FileUp, FileDown, Filter, Search, Barcode, Layers } from "lucide-react";

export default function ProductsPage() {
  return (
    <>
      <TopBar title="کالاها و کاتالوگ" description="مدیریت کامل محصولات، وارینت‌ها، بارکدها، قیمت‌ها و مالیات" />
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute right-3 inset-y-0 my-auto w-4 h-4 text-slate-400" />
            <input className="input !pr-9" placeholder="جست‌وجو با نام، بارکد، SKU، برند..." />
          </div>
          <select className="input max-w-[10rem]">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button className="btn-secondary"><Filter className="w-4 h-4" /> فیلترها</button>
          <div className="flex-1" />
          <button className="btn-secondary"><FileUp className="w-4 h-4" /> ورود اکسل</button>
          <button className="btn-secondary"><FileDown className="w-4 h-4" /> خروجی</button>
          <button className="btn-primary"><Plus className="w-4 h-4" /> کالای جدید</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <StatTile label="کل کالاها" value={toFa(products.length * 137)} icon={Layers} />
          <StatTile label="کالاهای فعال" value={toFa(products.length * 121)} icon={Layers} />
          <StatTile label="کالای کم‌موجود" value={toFa(38)} icon={Barcode} />
          <StatTile label="کالای منقضی‌شونده" value={toFa(12)} icon={Barcode} />
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-auto">
            <table className="table-clean w-full min-w-[900px]">
              <thead>
                <tr>
                  <th>کالا</th>
                  <th>SKU</th>
                  <th>بارکد</th>
                  <th>دسته</th>
                  <th>برند</th>
                  <th>موجودی</th>
                  <th>قیمت فروش</th>
                  <th>حاشیه سود</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const margin = ((p.price - p.cost) / p.price) * 100;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-muted grid place-items-center text-lg">{p.emoji}</div>
                          <div>
                            <div className="font-semibold text-slate-800">{p.name}</div>
                            <div className="text-[11px] text-slate-500">{p.weighted ? "کالای وزنی" : "کالای عددی"} · {p.unit}</div>
                          </div>
                        </div>
                      </td>
                      <td className="num-fa">{p.sku}</td>
                      <td className="num-fa">{p.barcode}</td>
                      <td><span className="chip-slate">{p.category}</span></td>
                      <td>{p.brand}</td>
                      <td className="num-fa">
                        {p.stock <= 15
                          ? <span className="chip-red">{toFa(p.stock)}</span>
                          : <span className="text-slate-700">{toFa(p.stock)}</span>}
                      </td>
                      <td className="font-bold num-fa">{formatToman(p.price, { withUnit: false })}</td>
                      <td>
                        <div className="w-28">
                          <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                            <div
                              className={margin > 25 ? "h-full bg-emerald-500" : margin > 15 ? "h-full bg-amber-500" : "h-full bg-rose-500"}
                              style={{ width: `${Math.min(100, Math.max(6, margin * 2))}%` }}
                            />
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1 num-fa">{toFa(margin.toFixed(1))}٪</div>
                        </div>
                      </td>
                      <td className="!text-left">
                        <button className="btn-ghost text-xs">ویرایش</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function StatTile({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 grid place-items-center">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="font-bold text-slate-900 num-fa">{value}</div>
      </div>
    </div>
  );
}
