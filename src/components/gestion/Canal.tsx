import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getSupabase } from "@/lib/supabase";
import { Card, CardTitle, Diario, Mix, RankingCard, ResumenCard, Section } from "./Dashboard";
import { eur, isNum, num, pct } from "./format";
import type { GestionData, N, Periodo, RankingItem } from "./types";

export type CanalId = "tienda" | "envios";

export interface CanalPeriodo {
  facturacion: N;
  facturacion_sin_iva: N;
  ventas_producto: N;
  ventas_producto_sin_iva: N;
  portes: N;
  portes_sin_iva: N;
  pedidos: N;
  tartas: N;
  packs: N;
  ticket_medio: N;
  ticket_medio_sin_iva: N;
  coste_teorico: N;
  food_cost_teorico_pct: N;
  coste_canal: N;
  food_cost_canal_pct: N;
  expediciones: N;
  coste_envio: N;
  resultado_portes: N;
  resultado: N;
  resultado_pct: N;
}

export interface CanalData {
  canal?: string;
  iva_pct?: N;
  store_id?: string | null;
  generado_at?: string;
  costes_envio?: { seur_por_expedicion: N; caja_por_expedicion: N };
  desviacion_global?: null | { desde: string; hasta: string; factor: N };
  resumen?: { hoy?: CanalPeriodo; semana?: CanalPeriodo; mes?: CanalPeriodo; semana_anterior?: CanalPeriodo };
  diario?: { fecha: string; dia_semana: number; facturacion: N; facturacion_sin_iva: N; portes: N; pedidos: N }[];
  ranking?: { crema?: RankingItem[]; mermelada?: RankingItem[]; frutos_secos?: RankingItem[]; mousse?: RankingItem[] };
  mix?: { clave: string; nombre: string; ventas: N; tartas: N; pct_tartas: N }[];
}

type PeriodoKey = "hoy" | "semana" | "mes" | "semana_anterior";
const PERIODOS: { k: PeriodoKey; l: string }[] = [
  { k: "hoy", l: "Hoy" },
  { k: "semana", l: "Esta semana" },
  { k: "mes", l: "Este mes" },
  { k: "semana_anterior", l: "Semana anterior" },
];

/** Adapta un periodo del canal a la forma de ResumenCard (sin cálculos). */
const toPeriodo = (p?: CanalPeriodo): Periodo | undefined =>
  p
    ? {
        facturacion: p.facturacion,
        facturacion_sin_iva: p.facturacion_sin_iva,
        iva: null,
        pedidos: p.pedidos,
        tartas: p.tartas,
        ticket_medio: p.ticket_medio,
        ticket_medio_sin_iva: p.ticket_medio_sin_iva,
      }
    : undefined;

export function Canal({ userId, canal, titulo, activo }: { userId: string; canal: CanalId; titulo: string; activo: boolean }) {
  const [periodo, setPeriodo] = useState<PeriodoKey>("semana");
  const q = useQuery({
    queryKey: ["gestion_canal", userId, canal],
    enabled: activo,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
    queryFn: async () => {
      const sb = getSupabase();
      if (!sb) throw new Error("Sin conexión");
      const { data, error } = await sb.rpc("gestion_canal", { p_canal: canal });
      if (error) throw error;
      return (data ?? {}) as CanalData;
    },
  });

  if (q.isError && !q.data) {
    return (
      <div className="mx-auto max-w-sm rounded-2xl border bg-card p-8 text-center">
        <p className="text-sm font-medium">No se han podido cargar los datos.</p>
        <Button className="mt-4" variant="outline" onClick={() => q.refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }
  if (!q.data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  const d = q.data;
  const r = d.resumen ?? {};
  const p = r[periodo];
  // Solo se adapta la forma para reutilizar los componentes; los valores llegan tal cual.
  const global = {
    diario: (d.diario ?? []).map((x) => ({
      fecha: x.fecha,
      dia_semana: x.dia_semana,
      abierto: true,
      facturacion: x.facturacion,
      facturacion_sin_iva: x.facturacion_sin_iva,
      pedidos: x.pedidos,
    })),
    mix: d.mix ?? [],
  } satisfies GestionData;
  const dg = d.desviacion_global;
  const sinCostesEnvio = d.costes_envio?.seur_por_expedicion === 0 && d.costes_envio?.caja_por_expedicion === 0;

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{titulo}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pedidos pagados del canal</p>
      </div>

      {q.isError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-sm">
          <span className="text-alert">No se ha podido actualizar.</span>
          <Button size="sm" variant="outline" onClick={() => q.refetch()}>
            Reintentar
          </Button>
        </div>
      )}

      <Section n="01" title="Resumen">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ResumenCard label="Hoy" p={toPeriodo(r.hoy)} main ocultarIva />
          <ResumenCard label="Esta semana" p={toPeriodo(r.semana)} ocultarIva />
          <ResumenCard label="Este mes" p={toPeriodo(r.mes)} ocultarIva />
          <ResumenCard label="Semana anterior (a la misma altura)" p={toPeriodo(r.semana_anterior)} ocultarIva />
        </div>
      </Section>

      <Section n="02" title="Ventas">
        <Diario d={global} todosAbiertos />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <RankingCard title="Cremas base" items={d.ranking?.crema} />
          <RankingCard title="Mermeladas" items={d.ranking?.mermelada} />
          <RankingCard title="Cremas de frutos secos" items={d.ranking?.frutos_secos} />
          <RankingCard title="Mousses" items={d.ranking?.mousse} />
        </div>
        <Mix d={global} />
      </Section>

      <Section n="03" title="Food cost del canal">
        <div className="flex flex-wrap gap-1 rounded-xl border bg-card p-1 sm:w-fit">
          {PERIODOS.map((x) => (
            <button
              key={x.k}
              type="button"
              onClick={() => setPeriodo(x.k)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition-colors",
                periodo === x.k ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {x.l}
            </button>
          ))}
        </div>
        <Card>
          <CardTitle title="Food cost del canal" />
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <div>
              <span className="num-xl text-4xl">{pct(p?.food_cost_canal_pct)}</span>
              <span className="ml-2 text-sm tabular-nums text-muted-foreground">{eur(p?.coste_canal)}</span>
            </div>
            <span className="text-sm tabular-nums text-muted-foreground">Teórico: {pct(p?.food_cost_teorico_pct)}</span>
          </div>
          <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
            {dg == null
              ? "Teórico (sin recuento cerrado)"
              : `Teórico × desviación global del último recuento (×${num(dg.factor, 2)})`}
          </p>
        </Card>
      </Section>

      {canal === "envios" && (
        <Section n="04" title="Cuenta del canal">
          {sinCostesEnvio && (
            <div className="rounded-xl border border-alert/40 bg-card px-4 py-3 text-sm font-medium text-alert">
              Faltan los costes de envío en configuración
            </div>
          )}
          <Card>
            <CardTitle title={`Cuenta del canal · ${PERIODOS.find((x) => x.k === periodo)?.l ?? ""}`} note="Todo sin IVA" />
            <dl className="divide-y text-sm">
              <Fila l="Cobrado sin IVA" v={eur(p?.facturacion_sin_iva)} />
              <Fila l="− Food cost del canal" v={eur(p?.coste_canal)} />
              <Fila
                l="− Coste de envío (SEUR + caja y acumuladores × expediciones)"
                extra={`${num(p?.expediciones)} ${p?.expediciones === 1 ? "expedición" : "expediciones"}`}
                v={eur(p?.coste_envio)}
              />
              <div className="flex flex-wrap items-baseline justify-between gap-2 pt-3">
                <dt className="font-semibold">= Lo que deja el canal antes de publicidad</dt>
                <dd className={cn("num-xl text-2xl", isNum(p?.resultado) && p.resultado < 0 && "text-alert")}>
                  {eur(p?.resultado)} <span className="text-sm font-normal text-muted-foreground">{pct(p?.resultado_pct)}</span>
                </dd>
              </div>
            </dl>
          </Card>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl border bg-card px-4 py-3 text-xs tabular-nums text-muted-foreground">
            <span>
              Portes cobrados sin IVA: <span className="text-foreground">{eur(p?.portes_sin_iva)}</span>
            </span>
            <span>
              Coste de envío: <span className="text-foreground">{eur(p?.coste_envio)}</span>
            </span>
            <span>
              Resultado de portes:{" "}
              <span className={cn("font-semibold", isNum(p?.resultado_portes) && p.resultado_portes < 0 ? "text-alert" : "text-foreground")}>
                {eur(p?.resultado_portes)}
              </span>
            </span>
          </div>
        </Section>
      )}
    </div>
  );
}

function Fila({ l, v, extra }: { l: string; v: string; extra?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
      <dt className="text-muted-foreground">
        {l}
        {extra && <span className="ml-2 text-xs tabular-nums">· {extra}</span>}
      </dt>
      <dd className="font-medium tabular-nums">{v}</dd>
    </div>
  );
}
