import { createFileRoute } from "@tanstack/react-router";
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
import {
  comparativa,
  dailyRevenue,
  eur,
  foodCost,
  ingredientes,
  margen,
  merma,
  mermaSeries,
  mixVentas,
  objetivo,
  peakHours,
  summary,
  topProduct,
} from "@/lib/dashboard-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard de gestión | Yo Llevo la Tarta" },
      {
        name: "description",
        content:
          "Panel de gestión de Yo Llevo la Tarta: facturación, pedidos, ticket medio, food cost, margen y objetivo semanal de un vistazo.",
      },
      { property: "og:title", content: "Dashboard de gestión | Yo Llevo la Tarta" },
      {
        property: "og:description",
        content:
          "Facturación, pedidos, horas pico, food cost real vs teórico y margen bruto del negocio en una sola pantalla.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function SectionTitle({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-baseline gap-3">
      <span className="text-xs font-semibold tracking-[0.2em] text-brand-soft">{n}</span>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{children}</h2>
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 ${className}`}>{children}</div>
  );
}

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: 12,
    color: "var(--color-foreground)",
    fontSize: 12,
  },
  labelStyle: { color: "var(--color-muted-foreground)" },
  cursor: { fill: "rgba(255,255,255,0.05)" },
};

function Dashboard() {
  const periods = [
    { label: "Hoy", data: summary.hoy, highlight: true },
    { label: "Esta semana", data: summary.semana, highlight: false },
    { label: "Este mes", data: summary.mes, highlight: false },
  ];

  const gap = foodCost.real - foodCost.teorico;
  const fcState = gap > 10 ? "rojo" : gap > 5 ? "amarillo" : "ok";
  const fcColor =
    fcState === "rojo" ? "text-brand" : fcState === "amarillo" ? "text-warning" : "text-success";
  const fcMsg =
    fcState === "rojo"
      ? `Alerta roja · ${gap} puntos por encima del teórico`
      : fcState === "amarillo"
        ? `Alerta leve · ${gap} puntos por encima del teórico`
        : `Bajo control · ${gap} puntos de desviación`;

  const maxPeak = Math.max(...peakHours.map((h) => h.pedidos));
  const objFacturacion = objetivo.unidadesMeta * objetivo.ticketMedio;
  const objPctFact = Math.round((objetivo.facturacionActual / objFacturacion) * 100);
  const objPctUds = Math.round((objetivo.unidadesActuales / objetivo.unidadesMeta) * 100);
  const objCumplido = objetivo.facturacionActual >= objFacturacion;
  const objColor = objCumplido ? "var(--color-success)" : "var(--color-brand)";

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-sm font-bold text-primary-foreground">
            YT
          </span>
          <div>
            <p className="font-display text-sm font-bold leading-tight">Yo Llevo la Tarta</p>
            <p className="text-xs text-muted-foreground">Dashboard de gestión</p>
          </div>
        </div>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          Datos de prueba
        </span>
      </header>

      {/* SECCIÓN 1 */}
      <section className="mb-10">
        <SectionTitle n="01">Resumen numérico</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-3">
          {periods.map((p) => (
            <Card
              key={p.label}
              className={p.highlight ? "border-brand/50 ring-1 ring-brand/30" : ""}
            >
              <p
                className={`mb-4 text-xs font-semibold uppercase tracking-widest ${p.highlight ? "text-brand" : "text-brand-soft"}`}
              >
                {p.label}
              </p>
              <p className="num-xl text-4xl">{eur(p.data.facturacion)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Facturación</p>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
                <div>
                  <p className="num-xl text-2xl">{p.data.pedidos}</p>
                  <p className="text-xs text-muted-foreground">Pedidos</p>
                </div>
                <div>
                  <p className="num-xl text-2xl">{eur(p.data.ticket, 2)}</p>
                  <p className="text-xs text-muted-foreground">Ticket medio</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* SECCIÓN 2 */}
      <section className="mb-10">
        <SectionTitle n="02">Ventas y rendimiento</SectionTitle>
        <div className="grid gap-4">
          <Card>
            <p className="mb-1 text-sm font-semibold">Facturación diaria · últimos 14 días</p>
            <p className="mb-4 text-xs text-muted-foreground">
              Lunes y martes cerrado por producción
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRevenue} margin={{ left: -18, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis
                    dataKey="dia"
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `${v}€`}
                  />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(v: number) => [eur(v), "Facturación"]}
                    labelFormatter={(_l, p) => p?.[0]?.payload?.label ?? ""}
                  />
                  <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                    {dailyRevenue.map((d, i) => (
                      <Cell
                        key={i}
                        fill={
                          i === dailyRevenue.length - 1
                            ? "var(--color-brand)"
                            : "var(--color-brand-soft)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <p className="mb-1 text-sm font-semibold">Horas de mayor venta</p>
              <p className="mb-4 text-xs text-muted-foreground">
                Pedidos acumulados esta semana por franja de 30 min
              </p>
              <div className="space-y-2">
                {peakHours.map((h) => {
                  const pct = (h.pedidos / maxPeak) * 100;
                  return (
                    <div key={h.franja} className="flex items-center gap-3">
                      <span className="w-12 shrink-0 text-xs tabular-nums text-muted-foreground">
                        {h.franja}
                      </span>
                      <div className="h-4 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background:
                              pct > 80 ? "var(--color-brand)" : "var(--color-brand-soft)",
                          }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right text-xs font-semibold tabular-nums">
                        {h.pedidos}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="grid content-start gap-4">
              <Card>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-soft">
                  Producto más vendido
                </p>
                <p className="mt-3 text-xl font-semibold">{topProduct.nombre}</p>
                <p className="text-sm text-muted-foreground">{topProduct.detalle}</p>
                <p className="num-xl mt-4 text-4xl">
                  {topProduct.unidades}{" "}
                  <span className="text-base font-normal text-muted-foreground">uds / semana</span>
                </p>
              </Card>
            </div>
          </div>

          {/* Ingrediente más vendido por categoría */}
          <div>
            <p className="mb-1 text-sm font-semibold">Ingrediente más vendido por categoría</p>
            <p className="mb-4 text-xs text-muted-foreground">
              kg consumidos esta semana, ordenados de más a menos
            </p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {ingredientes.map((cat) => {
                const maxKg = Math.max(...cat.items.map((i) => i.kg));
                return (
                  <Card key={cat.categoria}>
                    <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-soft">
                      {cat.categoria}
                    </p>
                    <div className="space-y-3">
                      {cat.items.map((item) => (
                        <div key={item.nombre}>
                          <div className="mb-1 flex items-baseline justify-between gap-2">
                            <span className="text-xs">{item.nombre}</span>
                            <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                              {item.kg.toString().replace(".", ",")} kg
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(item.kg / maxKg) * 100}%`,
                                background:
                                  item.kg === maxKg
                                    ? "var(--color-brand)"
                                    : "var(--color-brand-soft)",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Mix de ventas por formato */}
          <div>
            <p className="mb-1 text-sm font-semibold">Mix de ventas por formato</p>
            <p className="mb-4 text-xs text-muted-foreground">
              Los packs cuentan como 1 venta pero incluyen 4 o 6 tartas
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="pb-2 font-medium">Formato</th>
                      <th className="pb-2 text-right font-medium">Unidades</th>
                      <th className="pb-2 text-right font-medium">% total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mixVentas.map((f) => (
                      <tr key={f.formato} className="border-t border-border">
                        <td className="py-3">{f.formato}</td>
                        <td className="py-3 text-right tabular-nums text-muted-foreground">
                          {f.unidades}
                          {f.tartas !== f.unidades && (
                            <span className="block text-xs">(= {f.tartas} tartas)</span>
                          )}
                        </td>
                        <td className="py-3 text-right font-semibold tabular-nums">
                          {f.pct.toString().replace(".", ",")}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
              <Card>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        {...tooltipStyle}
                        formatter={(v: number, name: string) => [`${v} uds`, name]}
                      />
                      <Pie
                        data={mixVentas}
                        dataKey="unidades"
                        nameKey="formato"
                        innerRadius={60}
                        outerRadius={100}
                        strokeWidth={2}
                        stroke="var(--color-card)"
                      >
                        {mixVentas.map((f, i) => (
                          <Cell key={f.formato} fill={`var(--color-chart-${(i % 6) + 1})`} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                  {mixVentas.map((f, i) => (
                    <span
                      key={f.formato}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <span
                        className="h-2 w-4 rounded-full"
                        style={{ background: `var(--color-chart-${(i % 6) + 1})` }}
                        aria-hidden
                      />
                      {f.formato} · {f.pct.toString().replace(".", ",")}%
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3 */}
      <section className="mb-10">
        <SectionTitle n="03">Food cost y margen</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <p className="mb-4 text-sm font-semibold">Food cost</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="num-xl text-5xl">{foodCost.teorico}%</p>
                <p className="mt-1 text-xs text-muted-foreground">Teórico (recetas)</p>
              </div>
              <div>
                <p className={`num-xl text-5xl ${fcColor}`}>{foodCost.real}%</p>
                <p className="mt-1 text-xs text-muted-foreground">Real (obrador)</p>
              </div>
            </div>
            <div
              className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
                fcState === "rojo"
                  ? "border-brand/40 bg-brand/10 text-brand"
                  : fcState === "amarillo"
                    ? "border-warning/40 bg-warning/10 text-warning"
                    : "border-success/40 bg-success/10 text-success"
              }`}
            >
              {fcMsg}
            </div>
          </Card>

          <Card>
            <p className="mb-4 text-sm font-semibold">Margen bruto</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="num-xl text-4xl text-success">{eur(margen.hoy.euros)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Hoy · {margen.hoy.pct}%</p>
              </div>
              <div>
                <p className="num-xl text-4xl text-success">{eur(margen.semana.euros)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Esta semana · {margen.semana.pct}%
                </p>
              </div>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Facturación menos food cost real del periodo.
            </p>
          </Card>

          <Card className="lg:col-span-2">
            <p className="mb-1 text-sm font-semibold">Histórico de merma · 8 semanas</p>
            <p className="mb-4 text-xs text-muted-foreground">
              % sobre producción por elaboración. Tendencia a la baja = mejora.
            </p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={merma} margin={{ left: -18, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis
                    dataKey="semana"
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <Tooltip {...tooltipStyle} cursor={{ stroke: "var(--color-border)" }} />
                  {mermaSeries.map((s) => (
                    <Line
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.label}
                      stroke={s.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              {mermaSeries.map((s) => (
                <span key={s.key} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    className="h-2 w-4 rounded-full"
                    style={{ background: s.color }}
                    aria-hidden
                  />
                  {s.label}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* SECCIÓN 4 */}
      <section>
        <SectionTitle n="04">Comparativa y tendencia</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <p className="mb-4 text-sm font-semibold">Esta semana vs semana anterior</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 font-medium">Métrica</th>
                  <th className="pb-2 text-right font-medium">Anterior</th>
                  <th className="pb-2 text-right font-medium">Actual</th>
                  <th className="pb-2 text-right font-medium">Dif.</th>
                </tr>
              </thead>
              <tbody>
                {comparativa.map((r) => {
                  const positive = r.good ?? r.diff >= 0;
                  return (
                    <tr key={r.metrica} className="border-t border-border">
                      <td className="py-3">{r.metrica}</td>
                      <td className="py-3 text-right tabular-nums text-muted-foreground">
                        {r.anterior}
                      </td>
                      <td className="py-3 text-right font-semibold tabular-nums">{r.actual}</td>
                      <td
                        className={`py-3 text-right font-semibold tabular-nums ${positive ? "text-success" : "text-brand"}`}
                      >
                        {r.diff > 0 ? "+" : ""}
                        {r.unidad === "pt"
                          ? `${r.diff} pt`
                          : `${r.diff.toString().replace(".", ",")}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          <Card>
            <p className="mb-1 text-sm font-semibold">Objetivo semanal (break even)</p>
            <p className="mb-5 text-xs text-muted-foreground">
              {objetivo.unidadesMeta} uds × ticket medio real {eur(objetivo.ticketMedio, 2)} ={" "}
              {eur(objFacturacion)}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="num-xl text-4xl">{eur(objetivo.facturacionActual)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Facturación de {eur(objFacturacion)}
                </p>
              </div>
              <div>
                <p className="num-xl text-4xl">{objetivo.unidadesActuales}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Unidades de {objetivo.unidadesMeta}
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Facturación</span>
                  <span className="tabular-nums">{objPctFact}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(objPctFact, 100)}%`, background: objColor }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Unidades</span>
                  <span className="tabular-nums">{objPctUds}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(objPctUds, 100)}%`, background: objColor }}
                  />
                </div>
              </div>
            </div>
            <p
              className={`mt-4 text-sm font-semibold ${objCumplido ? "text-success" : "text-brand"}`}
            >
              {objCumplido
                ? `Objetivo superado · ${eur(objetivo.facturacionActual - objFacturacion)} por encima`
                : `Faltan ${eur(objFacturacion - objetivo.facturacionActual)} y ${objetivo.unidadesMeta - objetivo.unidadesActuales} uds · quedan sábado y domingo, buen ritmo`}
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
