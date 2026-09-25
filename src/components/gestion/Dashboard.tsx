import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { DIAS, ddmm, eur, hhmm, isNum, num, pct } from "./format";
import type { GestionData, Periodo, RankingItem } from "./types";

/* ---------- piezas base ---------- */

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border bg-card p-5 sm:p-6", className)}>{children}</div>;
}

function CardTitle({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      {note && <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline gap-3">
        <span className="text-xs font-medium tabular-nums text-muted-foreground">{n}</span>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{children}</p>;
}

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--color-foreground)",
  boxShadow: "none",
};

function Progress({ value, done }: { value: number; done: boolean }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all", done ? "bg-success" : "bg-brand")}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

const diffPct = (a: number | null | undefined, b: number | null | undefined) =>
  isNum(a) && isNum(b) && b !== 0 ? ((a - b) / b) * 100 : null;

/* ---------- 01 Resumen ---------- */

function ResumenCard({ label, p, main }: { label: string; p?: Periodo; main?: boolean }) {
  return (
    <Card className={cn(main && "ring-2 ring-brand/60")}>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={cn("num-xl", main ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl")}>
          {eur(p?.facturacion)}
        </span>
        <span className="text-sm tabular-nums text-muted-foreground">
          {eur(p?.facturacion_sin_iva)} <span className="text-xs">sin IVA</span>
        </span>
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Pedidos</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">{num(p?.pedidos)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Tartas</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">{num(p?.tartas)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Ticket medio</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">{eur(p?.ticket_medio, 2)}</dd>
          <dd className="text-[11px] tabular-nums text-muted-foreground">{eur(p?.ticket_medio_sin_iva, 2)} sin IVA</dd>
        </div>
      </dl>
      <p className="mt-4 border-t pt-3 text-xs tabular-nums text-muted-foreground">IVA repercutido: {eur(p?.iva)}</p>
    </Card>
  );
}

/* ---------- 02 Ventas ---------- */

function Diario({ d }: { d: GestionData }) {
  const rows = (d.diario ?? []).map((r, i, arr) => ({
    ...r,
    x: `${DIAS[r.dia_semana] ?? ""} ${ddmm(r.fecha)}`,
    valor: r.abierto ? (r.facturacion ?? 0) : 0,
    hoy: i === arr.length - 1,
  }));
  return (
    <Card>
      <CardTitle title="Facturación diaria · últimos 14 días" note="Con IVA. Hoy resaltado." />
      {rows.length === 0 ? (
        <Empty>Sin datos</Empty>
      ) : (
        <>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 8, right: 0, left: -12, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="x" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} interval={0} angle={-40} textAnchor="end" height={44} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={(v) => num(v)} />
                <Tooltip
                  cursor={{ fill: "var(--color-muted)" }}
                  contentStyle={tooltipStyle}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const r = payload[0].payload as (typeof rows)[number];
                    return (
                      <div style={tooltipStyle} className="px-3 py-2">
                        <p className="font-medium">{r.x}</p>
                        {r.abierto ? (
                          <>
                            <p className="tabular-nums">{eur(r.facturacion)} con IVA</p>
                            <p className="tabular-nums text-muted-foreground">{eur(r.facturacion_sin_iva)} sin IVA</p>
                            <p className="tabular-nums text-muted-foreground">{num(r.pedidos)} pedidos</p>
                          </>
                        ) : (
                          <p className="text-muted-foreground">Cerrado</p>
                        )}
                      </div>
                    );
                  }}
                />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                  {rows.map((r, i) => (
                    <Cell key={i} fill={r.hoy ? "var(--color-brand)" : "var(--color-chart-5)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {rows.some((r) => !r.abierto) && (
            <p className="mt-2 text-xs text-muted-foreground">
              Cerrado: {rows.filter((r) => !r.abierto).map((r) => r.x).join(", ")}
            </p>
          )}
        </>
      )}
    </Card>
  );
}

function Horas({ d }: { d: GestionData }) {
  const rows = d.horas ?? [];
  const top = [...rows].sort((a, b) => (b.pedidos ?? 0) - (a.pedidos ?? 0)).slice(0, 3).map((r) => r.franja);
  const max = Math.max(1, ...rows.map((r) => r.pedidos ?? 0));
  return (
    <Card>
      <CardTitle title="Horas de más trabajo · esta semana" note="En tienda por hora de compra; recogidas por su franja" />
      {rows.length === 0 ? (
        <Empty>Sin pedidos esta semana</Empty>
      ) : (
        <div className="space-y-1.5">
          {rows.map((r) => {
            const hi = top.includes(r.franja) && (r.pedidos ?? 0) > 0;
            return (
              <div key={r.franja} className="flex items-center gap-3 text-xs">
                <span className="w-11 shrink-0 tabular-nums text-muted-foreground">{r.franja}</span>
                <div className="h-4 flex-1 overflow-hidden rounded bg-muted">
                  <div className={cn("h-full rounded", hi ? "bg-brand" : "bg-chart-5")} style={{ width: `${((r.pedidos ?? 0) / max) * 100}%` }} />
                </div>
                <span className={cn("w-8 text-right tabular-nums", hi && "font-semibold")}>{num(r.pedidos)}</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function RankingCard({ title, items }: { title: string; items?: RankingItem[] }) {
  const list = [...(items ?? [])].sort((a, b) => {
    const za = (a.unidades ?? 0) === 0 ? 1 : 0;
    const zb = (b.unidades ?? 0) === 0 ? 1 : 0;
    return za - zb || (b.unidades ?? 0) - (a.unidades ?? 0);
  });
  const max = Math.max(1, ...list.map((i) => i.unidades ?? 0));
  return (
    <Card>
      <CardTitle title={title} />
      {list.length === 0 ? (
        <Empty>Sin ventas</Empty>
      ) : (
        <ul className="space-y-3">
          {list.map((it, i) => {
            const zero = (it.unidades ?? 0) === 0;
            const first = i === 0 && !zero;
            return (
              <li key={it.nombre} className={cn(zero && "opacity-40")}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className={cn("truncate", first && "font-semibold")}>{it.nombre}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    <span className="font-medium text-foreground">{num(it.unidades)}</span> uds · {num(it.kg, 1)} kg
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full", first ? "bg-brand" : "bg-chart-5")} style={{ width: `${((it.unidades ?? 0) / max) * 100}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

const DONUT = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-chart-6)"];

function Mix({ d }: { d: GestionData }) {
  const rows = d.mix ?? [];
  return (
    <Card>
      <CardTitle title="Mix por formato · esta semana" note="Un pack cuenta como 1 venta pero incluye 2, 4 o 6 tartas" />
      {rows.length === 0 ? (
        <Empty>Sin ventas esta semana</Empty>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_200px] md:items-center">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Formato</th>
                  <th className="pb-2 text-right font-medium">Ventas</th>
                  <th className="pb-2 text-right font-medium">Tartas</th>
                  <th className="pb-2 text-right font-medium">% tartas</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.clave} className="border-t">
                    <td className="py-2">
                      <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: DONUT[i % DONUT.length] }} />
                      {r.nombre}
                    </td>
                    <td className="py-2 text-right tabular-nums">{num(r.ventas)}</td>
                    <td className="py-2 text-right tabular-nums">{num(r.tartas)}</td>
                    <td className="py-2 text-right tabular-nums">{pct(r.pct_tartas)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mx-auto h-44 w-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rows} dataKey="tartas" nameKey="nombre" innerRadius="62%" outerRadius="100%" stroke="var(--color-card)" strokeWidth={2}>
                  {rows.map((_, i) => (
                    <Cell key={i} fill={DONUT[i % DONUT.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${num(v)} tartas`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ---------- 03 Food cost y margen ---------- */

function semaforo(real: number | null, teo: number | null) {
  if (!isNum(real) || !isNum(teo)) return { label: "—", dot: "bg-muted-foreground", text: "text-muted-foreground" };
  const diff = real - teo;
  if (diff <= 5) return { label: "Bajo control", dot: "bg-success", text: "text-success" };
  if (diff <= 10) return { label: "Vigilar", dot: "bg-warning", text: "text-foreground" };
  return { label: "Alerta", dot: "bg-alert", text: "text-alert" };
}

function FoodCostReal({ d, store }: { d: GestionData; store: string | null }) {
  const tandas = (d.food_cost_real ?? []).filter((t) => (t.tartas ?? 0) !== 0);
  const last = tandas[0];
  const s = last ? semaforo(last.food_cost_real_pct, last.food_cost_teorico_pct) : null;
  return (
    <Card className="lg:col-span-2">
      <CardTitle title="Food cost real · por tanda" />
      {!last || !s ? (
        <Empty>Aparecerá cuando el obrador haga dos recuentos</Empty>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">
                Última tanda: del {ddmm(last.desde)} al {ddmm(last.hasta)}
              </p>
              <div className="mt-2 flex items-baseline gap-4">
                <div>
                  <span className="num-xl text-4xl">{pct(last.food_cost_real_pct)}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground">real</span>
                </div>
                <div>
                  <span className="num-xl text-2xl text-muted-foreground">{pct(last.food_cost_teorico_pct)}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground">teórico</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border px-3 py-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-full", s.dot)} />
              <span className={cn("text-sm font-medium", s.text)}>{s.label}</span>
            </div>
          </div>
          {store && isNum(last.reparto_pct) && (
            <p className="mt-3 text-xs text-muted-foreground">
              Gasto del obrador repartido según ventas de esta tienda ({num(last.reparto_pct, 1)} %)
            </p>
          )}
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Tanda</th>
                  <th className="pb-2 text-right font-medium">Ventas sin IVA</th>
                  <th className="pb-2 text-right font-medium">Tartas</th>
                  <th className="pb-2 text-right font-medium">Coste real</th>
                  <th className="pb-2 text-right font-medium">Coste teórico</th>
                  <th className="pb-2 text-right font-medium">Real</th>
                  <th className="pb-2 text-right font-medium">Teórico</th>
                </tr>
              </thead>
              <tbody>
                {tandas.map((t) => {
                  const ss = semaforo(t.food_cost_real_pct, t.food_cost_teorico_pct);
                  return (
                    <tr key={t.desde + t.hasta} className="border-t">
                      <td className="py-2 tabular-nums">
                        {ddmm(t.desde)} – {ddmm(t.hasta)}
                      </td>
                      <td className="py-2 text-right tabular-nums">{eur(t.ventas_sin_iva)}</td>
                      <td className="py-2 text-right tabular-nums">{num(t.tartas)}</td>
                      <td className="py-2 text-right tabular-nums">{eur(t.coste_real)}</td>
                      <td className="py-2 text-right tabular-nums">{eur(t.coste_teorico)}</td>
                      <td className="py-2 text-right tabular-nums">
                        <span className={cn("mr-1.5 inline-block h-2 w-2 rounded-full", ss.dot)} />
                        {pct(t.food_cost_real_pct)}
                      </td>
                      <td className="py-2 text-right tabular-nums text-muted-foreground">{pct(t.food_cost_teorico_pct)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}

const MERMA_COLORS = ["var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-chart-6)"];

function Merma({ d }: { d: GestionData }) {
  const semanas = d.merma?.semanas ?? [];
  const elabs = [...(d.merma?.elaboraciones ?? [])].sort((a, b) => (b.total_kg ?? 0) - (a.total_kg ?? 0)).slice(0, 5);
  const rows = semanas.map((s) => {
    const r: Record<string, unknown> = { x: ddmm(s.semana), total: s.merma_pct, total_kg: s.merma_kg };
    elabs.forEach((e, i) => {
      const p = e.serie.find((q) => q.semana === s.semana);
      r[`e${i}`] = p?.merma_pct ?? null;
      r[`e${i}_kg`] = p?.merma_kg ?? null;
    });
    return r;
  });
  const hasData = semanas.some((s) => (s.merma_kg ?? 0) > 0);
  const names = ["Total", ...elabs.map((e) => e.nombre)];
  return (
    <Card>
      <CardTitle title="Merma · últimas 8 semanas" note="% de merma por semana (lunes). Total destacado y las 5 elaboraciones con más kg tirados." />
      {!hasData ? (
        <Empty>Sin merma registrada</Empty>
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="x" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${num(v)} %`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const r = payload[0].payload as Record<string, number | null>;
                    const line = (key: string, name: string) => {
                      const p = r[key];
                      const kg = r[`${key}_kg`];
                      return (
                        <p key={key} className="tabular-nums">
                          {name}: {isNum(p) ? pct(p) : `${num(kg, 1)} kg tirados`}
                        </p>
                      );
                    };
                    return (
                      <div style={tooltipStyle} className="px-3 py-2">
                        <p className="font-medium">Semana del {label}</p>
                        {line("total", "Total")}
                        {elabs.map((e, i) => line(`e${i}`, e.nombre))}
                      </div>
                    );
                  }}
                />
                {elabs.map((e, i) => (
                  <Line key={e.nombre} type="monotone" dataKey={`e${i}`} name={e.nombre} stroke={MERMA_COLORS[i]} strokeWidth={1.5} dot={false} connectNulls />
                ))}
                <Line type="monotone" dataKey="total" name="Total" stroke="var(--color-brand)" strokeWidth={3} dot={{ r: 3, fill: "var(--color-brand)" }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {names.map((n, i) => (
              <span key={n} className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: i === 0 ? "var(--color-brand)" : MERMA_COLORS[i - 1] }} />
                {n}
              </span>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

/* ---------- 04 Comparativa y objetivo ---------- */

function Comparativa({ d }: { d: GestionData }) {
  const a = d.resumen?.semana;
  const b = d.resumen?.semana_anterior;
  const rows: { m: string; ant: string; act: string; diff: number | null; unit: string; inverse?: boolean }[] = [
    { m: "Facturación", ant: eur(b?.facturacion), act: eur(a?.facturacion), diff: diffPct(a?.facturacion, b?.facturacion), unit: "%" },
    { m: "Facturación sin IVA", ant: eur(b?.facturacion_sin_iva), act: eur(a?.facturacion_sin_iva), diff: diffPct(a?.facturacion_sin_iva, b?.facturacion_sin_iva), unit: "%" },
    { m: "Pedidos", ant: num(b?.pedidos), act: num(a?.pedidos), diff: diffPct(a?.pedidos, b?.pedidos), unit: "%" },
    { m: "Tartas", ant: num(b?.tartas), act: num(a?.tartas), diff: diffPct(a?.tartas, b?.tartas), unit: "%" },
    { m: "Ticket medio", ant: eur(b?.ticket_medio, 2), act: eur(a?.ticket_medio, 2), diff: diffPct(a?.ticket_medio, b?.ticket_medio), unit: "%" },
    {
      m: "Food cost teórico",
      ant: pct(b?.food_cost_teorico_pct),
      act: pct(a?.food_cost_teorico_pct),
      diff: isNum(a?.food_cost_teorico_pct) && isNum(b?.food_cost_teorico_pct) ? a.food_cost_teorico_pct - b.food_cost_teorico_pct : null,
      unit: "pt",
      inverse: true,
    },
  ];
  return (
    <Card>
      <CardTitle title="Esta semana vs la semana pasada a la misma altura" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="pb-2 font-medium">Métrica</th>
              <th className="pb-2 text-right font-medium">Semana pasada</th>
              <th className="pb-2 text-right font-medium">Esta semana</th>
              <th className="pb-2 text-right font-medium">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const good = r.diff === null ? null : r.inverse ? r.diff <= 0 : r.diff >= 0;
              return (
                <tr key={r.m} className="border-t">
                  <td className="py-2.5">{r.m}</td>
                  <td className="py-2.5 text-right tabular-nums text-muted-foreground">{r.ant}</td>
                  <td className="py-2.5 text-right font-medium tabular-nums">{r.act}</td>
                  <td className={cn("py-2.5 text-right font-medium tabular-nums", good === true && "text-success", good === false && "text-alert")}>
                    {r.diff === null ? "—" : `${r.diff > 0 ? "+" : ""}${num(r.diff, 1)} ${r.unit}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Objetivo({ d, className }: { d: GestionData; className?: string }) {
  const o = d.objetivo;
  const pT = isNum(o?.tartas) && isNum(o?.objetivo_tartas) && o.objetivo_tartas > 0 ? (o.tartas / o.objetivo_tartas) * 100 : 0;
  const pF =
    isNum(o?.facturacion_sin_iva) && isNum(o?.objetivo_facturacion_sin_iva) && o.objetivo_facturacion_sin_iva > 0
      ? (o.facturacion_sin_iva / o.objetivo_facturacion_sin_iva) * 100
      : 0;
  const done = pT >= 100;
  const faltan = isNum(o?.objetivo_tartas) && isNum(o?.tartas) ? Math.max(0, o.objetivo_tartas - o.tartas) : null;
  return (
    <Card className={className}>
      <CardTitle title="Objetivo semanal" note={`${num(o?.objetivo_tartas)} tartas × ${eur(o?.pvp_tarta, 2)} PVP`} />
      <div className="space-y-5">
        <div>
          <div className="mb-1.5 flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">Tartas</span>
            <span className="tabular-nums">
              <span className="font-semibold">{num(o?.tartas)}</span> / {num(o?.objetivo_tartas)} · {num(pT, 1)} %
            </span>
          </div>
          <Progress value={pT} done={pT >= 100} />
        </div>
        <div>
          <div className="mb-1.5 flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">Facturación sin IVA</span>
            <span className="tabular-nums">
              <span className="font-semibold">{eur(o?.facturacion_sin_iva)}</span> / {eur(o?.objetivo_facturacion_sin_iva)} · {num(pF, 1)} %
            </span>
          </div>
          <Progress value={pF} done={pF >= 100} />
          {(isNum(o?.facturacion) || isNum(o?.objetivo_facturacion)) && (
            <p className="mt-1 text-right text-[11px] tabular-nums text-muted-foreground">
              Con IVA: {eur(o?.facturacion)} / {eur(o?.objetivo_facturacion)}
            </p>
          )}
        </div>
        <p className={cn("text-sm font-medium", done ? "text-success" : "text-foreground")}>
          {done ? "Objetivo superado" : `Faltan ${num(faltan)} tartas · quedan ${num(o?.dias_abiertos_restantes)} días de apertura`}
        </p>
      </div>
    </Card>
  );
}

/* ---------- 05 Rehechos ---------- */

const TIPO: Record<string, string> = { tienda: "En tienda", en_tienda: "En tienda", recoger: "Recoger", recogida: "Recoger", envio: "Envío", envío: "Envío" };

function Rehechos({ d, store }: { d: GestionData; store: string | null }) {
  const r = d.rehechos;
  const detalle = r?.detalle ?? [];
  const stats = [
    { l: "Esta semana", v: num(r?.semana) },
    { l: "Este mes", v: num(r?.mes) },
    { l: "% pedidos semana", v: pct(r?.pct_semana) },
    { l: "Coste este mes", v: eur(r?.coste_mes) },
  ];
  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-3">
        <CardTitle title="Pedidos rehechos" note="Pedidos que cocina ha tenido que volver a preparar" />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              Ver detalle
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>Pedidos rehechos · últimos 30 días</SheetTitle>
            </SheetHeader>
            {detalle.length === 0 ? (
              <Empty>Ningún pedido rehecho en los últimos 30 días</Empty>
            ) : (
              <ul className="mt-4 space-y-3 px-4 pb-6">
                {detalle.map((x, i) => {
                  const est = x.estaciones ?? x.estacion;
                  return (
                    <li key={i} className="rounded-xl border p-4 text-sm">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold tabular-nums">
                          {[x.serie, x.numero_pedido].filter((v) => v !== null && v !== undefined && v !== "").join("-") || "—"}
                        </span>
                        <span className="text-xs tabular-nums text-muted-foreground">{hhmm(x.fecha)}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {x.tienda ?? "—"} · {x.tipo ? (TIPO[x.tipo] ?? x.tipo) : "—"}
                      </p>
                      {x.contenido && <p className="mt-2">{x.contenido}</p>}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                        <div>
                          <p className="text-muted-foreground">Veces</p>
                          <p className="font-medium tabular-nums">{num(x.veces)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Estación</p>
                          <p className="font-medium">{Array.isArray(est) ? est.join(", ") : (est ?? "—")}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Min. perdidos</p>
                          <p className="font-medium tabular-nums">{num(x.minutos_perdidos)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Coste</p>
                          <p className="font-medium tabular-nums">{eur(x.coste, 2)}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </SheetContent>
        </Sheet>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l}>
            <p className="text-xs text-muted-foreground">{s.l}</p>
            <p className="num-xl mt-1 text-2xl">{s.v}</p>
          </div>
        ))}
      </div>
      {!store && (r?.por_tienda?.length ?? 0) > 0 && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[300px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Tienda</th>
                <th className="pb-2 text-right font-medium">Semana</th>
                <th className="pb-2 text-right font-medium">Mes</th>
              </tr>
            </thead>
            <tbody>
              {r!.por_tienda!.map((t) => (
                <tr key={t.tienda} className="border-t">
                  <td className="py-2">{t.tienda}</td>
                  <td className="py-2 text-right tabular-nums">{num(t.semana)}</td>
                  <td className="py-2 text-right tabular-nums">{num(t.mes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

/* ---------- Dashboard ---------- */

export function Dashboard({ d, store }: { d: GestionData; store: string | null }) {
  const s = d.resumen?.semana;
  const h = d.resumen?.hoy;
  const rk = d.ranking ?? {};
  return (
    <div className="space-y-10">
      <Section n="01" title="Resumen">
        <div className="grid gap-4 md:grid-cols-3">
          <ResumenCard label="Hoy" p={h} main />
          <ResumenCard label="Esta semana" p={s} />
          <ResumenCard label="Este mes" p={d.resumen?.mes} />
        </div>
      </Section>

      <Section n="02" title="Ventas">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Diario d={d} />
          </div>
          <Horas d={d} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <RankingCard title="Cremas base" items={rk.crema} />
          <RankingCard title="Mermeladas" items={rk.mermelada} />
          <RankingCard title="Cremas de frutos secos" items={rk.frutos_secos} />
          <RankingCard title="Mousses" items={rk.mousse} />
        </div>
        <Mix d={d} />
      </Section>

      <Section n="03" title="Food cost y margen">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardTitle title="Margen bruto" note="Ventas sin IVA menos coste teórico (ingredientes + packaging)" />
            <div className="space-y-4">
              {[
                { l: "Hoy", p: h },
                { l: "Esta semana", p: s },
              ].map((x) => (
                <div key={x.l} className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">{x.l}</span>
                  <span>
                    <span className="num-xl text-2xl">{eur(x.p?.margen_bruto)}</span>
                    <span className="ml-2 text-sm tabular-nums text-muted-foreground">{pct(x.p?.margen_pct)}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t pt-4">
              <p className="text-xs text-muted-foreground">Food cost teórico de la semana</p>
              <p className="num-xl mt-1 text-2xl">{pct(s?.food_cost_teorico_pct)}</p>
            </div>
          </Card>
          <FoodCostReal d={d} store={store} />
        </div>
        <Merma d={d} />
      </Section>

      <Section n="04" title="Comparativa y objetivo">
        <div className="grid gap-4 lg:grid-cols-2">
          <Comparativa d={d} />
          <Objetivo d={d} />
        </div>
      </Section>

      <Section n="05" title="Pedidos rehechos">
        <Rehechos d={d} store={store} />
      </Section>
    </div>
  );
}

export { Objetivo, semaforo };
