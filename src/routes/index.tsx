import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSupabase } from "@/lib/supabase";
import { Login } from "@/components/gestion/Login";
import { Dashboard, semaforo } from "@/components/gestion/Dashboard";
import { eur, num, pct, isNum } from "@/components/gestion/format";
import type { GestionData } from "@/components/gestion/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gestión · Yo Llevo la Tarta" },
      { name: "description", content: "Panel de gestión de Yo Llevo la Tarta: ventas, food cost, merma y objetivo semanal." },
      { property: "og:title", content: "Gestión · Yo Llevo la Tarta" },
      { property: "og:description", content: "Panel de gestión de Yo Llevo la Tarta: ventas, food cost, merma y objetivo semanal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const STORE_KEY = "yllt_gestion_tienda";
const ALL = "__all__";

function Index() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const qc = useQueryClient();

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await getSupabase()?.auth.signOut();
  }

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }
  if (!session) return <Login />;
  if (session.user.app_metadata?.["rol"] !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm rounded-2xl border bg-card p-8 text-center">
          <h1 className="text-lg font-semibold">No tienes acceso a este panel</h1>
          <p className="mt-2 text-sm text-muted-foreground">Esta cuenta no tiene permisos de administración.</p>
          <Button className="mt-6" variant="outline" onClick={signOut}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    );
  }
  return <Panel onSignOut={signOut} userId={session.user.id} />;
}

function Panel({ onSignOut, userId }: { onSignOut: () => void; userId: string }) {
  const [store, setStore] = useState<string | null>(null);
  const [storeReady, setStoreReady] = useState(false);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(STORE_KEY);
      if (v) setStore(v);
    } catch {
      /* ignorar */
    }
    setStoreReady(true);
  }, []);

  function changeStore(v: string) {
    const next = v === ALL ? null : v;
    setStore(next);
    try {
      if (next) window.localStorage.setItem(STORE_KEY, next);
      else window.localStorage.removeItem(STORE_KEY);
    } catch {
      /* ignorar */
    }
  }

  const q = useQuery({
    queryKey: ["gestion_dashboard", userId, store],
    enabled: storeReady,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
    queryFn: async () => {
      const sb = getSupabase();
      if (!sb) throw new Error("Sin conexión");
      const { data, error } = await sb.rpc("gestion_dashboard", { p_store: store });
      if (error) throw error;
      return (data ?? {}) as GestionData;
    },
  });

  const tiendas = q.data?.tiendas ?? [];
  const validStore = store && (tiendas.length === 0 || tiendas.some((t) => t.id === store)) ? store : null;
  const updated = q.dataUpdatedAt
    ? new Date(q.dataUpdatedAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand" />
            <span className="text-sm font-semibold tracking-tight">
              Yo Llevo la Tarta <span className="font-normal text-muted-foreground">· Gestión</span>
            </span>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <Select value={validStore ?? ALL} onValueChange={changeStore}>
              <SelectTrigger className="h-9 w-[190px]">
                <SelectValue placeholder="Todas las tiendas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas las tiendas</SelectItem>
                {tiendas.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {updated && (
              <span className="hidden text-xs tabular-nums text-muted-foreground sm:inline">
                {q.isFetching ? "Actualizando…" : `Actualizado ${updated}`}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={onSignOut}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {q.isError && !q.data ? (
          <div className="mx-auto max-w-sm rounded-2xl border bg-card p-8 text-center">
            <p className="text-sm font-medium">No se han podido cargar los datos.</p>
            <Button className="mt-4" variant="outline" onClick={() => q.refetch()}>
              Reintentar
            </Button>
          </div>
        ) : !q.data ? (
          <Skeletons />
        ) : (
          <>
            {q.isError && (
              <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-sm">
                <span className="text-alert">No se ha podido actualizar.</span>
                <Button size="sm" variant="outline" onClick={() => q.refetch()}>
                  Reintentar
                </Button>
              </div>
            )}
            <Highlights d={q.data} />
            <Dashboard d={q.data} store={validStore} />
          </>
        )}
      </main>
    </div>
  );
}

/** Franja de lectura rápida: semana, objetivo y semáforo del food cost. */
function Highlights({ d }: { d: GestionData }) {
  const o = d.objetivo;
  const pT = isNum(o?.tartas) && isNum(o?.objetivo_tartas) && o.objetivo_tartas > 0 ? (o.tartas / o.objetivo_tartas) * 100 : null;
  const t = (d.food_cost_real ?? []).find((x) => (x.tartas ?? 0) !== 0);
  const s = t ? semaforo(t.food_cost_real_pct, t.food_cost_teorico_pct) : null;
  const items = [
    { l: "Facturación hoy", v: eur(d.resumen?.hoy?.facturacion) },
    { l: "Facturación semana", v: eur(d.resumen?.semana?.facturacion) },
    { l: "Objetivo semanal", v: pT === null ? "—" : `${num(pT, 1)} %`, sub: `${num(o?.tartas)} / ${num(o?.objetivo_tartas)} tartas` },
  ];
  return (
    <div className="mb-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border lg:grid-cols-4">
      {items.map((i) => (
        <div key={i.l} className="bg-card px-5 py-4">
          <p className="text-xs text-muted-foreground">{i.l}</p>
          <p className="num-xl mt-1 text-2xl">{i.v}</p>
          {i.sub && <p className="text-xs tabular-nums text-muted-foreground">{i.sub}</p>}
        </div>
      ))}
      <div className="bg-card px-5 py-4">
        <p className="text-xs text-muted-foreground">Food cost real</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="num-xl text-2xl">{t ? pct(t.food_cost_real_pct) : "—"}</span>
          {s && <span className={cn("h-2.5 w-2.5 rounded-full", s.dot)} />}
        </div>
        <p className={cn("text-xs", s ? s.text : "text-muted-foreground")}>{s ? s.label : "Sin tandas"}</p>
      </div>
    </div>
  );
}

function Skeletons() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-56 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
