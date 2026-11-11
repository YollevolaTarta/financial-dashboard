import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { eur, isNum, num } from "./format";

/* ---------- tipos ---------- */

type N = number | null;

interface CampanaCliente {
  nombre: string | null;
  apellidos: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  codigo_postal: string | null;
  ciudad: string | null;
}

interface CampanaPedido {
  pedido_id: string;
  numero: string | null;
  creado: string | null;
  estado: string | null;
  pago: string | null;
  prueba: boolean | null;
  packs: N;
  total: N;
  envio: N;
  fecha_envio: string | null;
  cliente: CampanaCliente | null;
}

interface CampanaData {
  codigo: string;
  nombre: string | null;
  fecha_envio: string | null;
  venta_hasta: string | null;
  activa: boolean | null;
  cupo: N;
  ocupados: N;
  disponibles: N;
  pedidos: CampanaPedido[] | null;
}

const CODIGO = "diciembre-2026";
const TZ = "Europe/Madrid";
const DASH = "—";

/* ---------- formato ---------- */

/** Fecha "2026-12-17" -> "17/12/2026" (sin pasar por zona horaria). */
function fechaLarga(s: string | null | undefined) {
  if (!s) return DASH;
  const [y, m, d] = s.slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : DASH;
}

function madrid(s: string | null | undefined, conAnio: boolean) {
  if (!s) return DASH;
  const d = new Date(s);
  if (isNaN(d.getTime())) return DASH;
  const p: Record<string, string> = Object.fromEntries(
    new Intl.DateTimeFormat("es-ES", {
      timeZone: TZ,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  const g = (k: string) => p[k] ?? "";
  return conAnio
    ? `${g("day")}/${g("month")}/${g("year")} ${g("hour")}:${g("minute")}`
    : `${g("day")}/${g("month")} ${g("hour")}:${g("minute")}`;
}

const dec = (n: N) => (isNum(n) ? num(n, 2) : "");
const txt = (s: string | null | undefined) => s ?? "";
const cancelado = (p: CampanaPedido) => p.estado === "cancelado";
const valido = (p: CampanaPedido) => !cancelado(p) && p.prueba !== true;

/* ---------- piezas (mismo estilo que el panel) ---------- */

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border bg-card p-5 sm:p-6", className)}>{children}</div>;
}

function Badge({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "ok" | "alert" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tone === "ok" && "border-success/40 bg-success/10 text-foreground",
        tone === "alert" && "border-alert/40 bg-alert/10 text-alert",
        tone === "muted" && "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

/* ---------- exportación ---------- */

const COLS = ["Nº", "Fecha compra", "Packs", "Total", "Nombre", "Apellidos", "Teléfono", "Email", "Dirección", "CP", "Ciudad", "Fecha expedición"];

function filas(pedidos: CampanaPedido[], fechaCampana: string | null) {
  return pedidos.map((p) => [
    p.numero ?? "Pendiente de pago",
    madrid(p.creado, false),
    isNum(p.packs) ? String(p.packs) : "",
    dec(p.total),
    txt(p.cliente?.nombre),
    txt(p.cliente?.apellidos),
    txt(p.cliente?.telefono),
    txt(p.cliente?.email),
    txt(p.cliente?.direccion),
    txt(p.cliente?.codigo_postal),
    txt(p.cliente?.ciudad),
    fechaLarga(p.fecha_envio ?? fechaCampana),
  ]);
}

const limpio = (v: string) => v.replace(/[\t\r\n]+/g, " ");
const csvCelda = (v: string) => (/[;"\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/* ---------- sección ---------- */

export function Campana({ userId }: { userId: string }) {
  const q = useQuery({
    queryKey: ["gestion_campana", userId],
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
    queryFn: async () => {
      const sb = getSupabase();
      if (!sb) throw new Error("Sin conexión");
      const { data, error } = await sb.rpc("gestion_campana", { p_codigo: CODIGO });
      if (error) throw error;
      return data as CampanaData;
    },
  });

  return (
    <section className="mt-12 space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-xs font-medium tabular-nums text-muted-foreground">06</span>
        <h2 className="text-lg font-semibold tracking-tight">Campaña de diciembre</h2>
        <span className="text-xs text-muted-foreground">Campaña web · no depende de la tienda seleccionada</span>
      </div>
      {q.isError && !q.data ? (
        <Card className="text-center">
          <p className="text-sm font-medium">No se han podido cargar los datos de la campaña.</p>
          <Button className="mt-4" variant="outline" onClick={() => q.refetch()}>
            Reintentar
          </Button>
        </Card>
      ) : !q.data ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (
        <>
          {q.isError && (
            <div className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-sm">
              <span className="text-alert">No se ha podido actualizar la campaña.</span>
              <Button size="sm" variant="outline" onClick={() => q.refetch()}>
                Reintentar
              </Button>
            </div>
          )}
          <Contenido c={q.data} />
        </>
      )}
    </section>
  );
}

function Contenido({ c }: { c: CampanaData }) {
  const pedidos = c.pedidos ?? [];
  const validos = pedidos.filter(valido);
  const nPrueba = pedidos.filter((p) => p.prueba === true).length;
  const nCancel = pedidos.filter(cancelado).length;
  const packs = validos.reduce((s, p) => s + (isNum(p.packs) ? p.packs : 0), 0);
  const euros = validos.reduce((s, p) => s + (isNum(p.total) ? p.total : 0), 0);
  const prog = isNum(c.ocupados) && isNum(c.cupo) && c.cupo > 0 ? (c.ocupados / c.cupo) * 100 : 0;
  const [aviso, setAviso] = useState<string | null>(null);

  function avisar(t: string) {
    setAviso(t);
    window.setTimeout(() => setAviso(null), 3000);
  }

  async function copiar() {
    const rows = [COLS, ...filas(validos, c.fecha_envio)];
    const text = rows.map((r) => r.map(limpio).join("\t")).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      avisar("Lista copiada al portapapeles");
    } catch {
      avisar("No se ha podido copiar");
    }
  }

  function descargar() {
    const rows = [COLS, ...filas(validos, c.fecha_envio)];
    const csv = "\uFEFF" + rows.map((r) => r.map(csvCelda).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `envios-${CODIGO}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    avisar("CSV descargado");
  }

  const sinValidos = validos.length === 0;

  return (
    <>
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-base font-semibold tracking-tight">{c.nombre ?? DASH}</h3>
          {c.activa ? <Badge tone="ok">Activa</Badge> : <Badge>Desactivada</Badge>}
        </div>
        <div className="mt-5 grid gap-6 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Packs vendidos</p>
            <p className="num-xl mt-1 text-3xl">
              {num(c.ocupados)} <span className="text-base font-normal text-muted-foreground">/ {num(c.cupo)}</span>
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(0, Math.min(100, prog))}%` }} />
            </div>
            <p className="mt-2 text-xs tabular-nums text-muted-foreground">Disponibles: {num(c.disponibles)}</p>
          </div>
          <div className="space-y-2 text-sm tabular-nums">
            <p>
              <span className="text-muted-foreground">Expedición: </span>
              {fechaLarga(c.fecha_envio)}
            </p>
            <p>
              <span className="text-muted-foreground">Venta hasta: </span>
              {madrid(c.venta_hasta, true)}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-sm font-semibold tracking-tight">Pedidos</h3>
        {pedidos.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Todavía no hay pedidos de la campaña</p>
        ) : (
          <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
            <table className="w-full min-w-[1100px] text-sm tabular-nums">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  {["Nº", "Fecha de compra", "Packs", "Total", "Envío", "Estado", "Pago", "Nombre y apellidos", "Teléfono", "Email", "Dirección", "CP", "Ciudad"].map((h) => (
                    <th key={h} className={cn("whitespace-nowrap py-2 pr-4 font-medium", ["Packs", "Total", "Envío"].includes(h) && "text-right")}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.pedido_id} className={cn("border-b last:border-0", !valido(p) && "opacity-50")}>
                    <td className="whitespace-nowrap py-2.5 pr-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={cn(!p.numero && "text-muted-foreground")}>{p.numero ?? "Pendiente de pago"}</span>
                        {p.prueba && <Badge>Prueba</Badge>}
                        {cancelado(p) && <Badge tone="alert">Cancelado</Badge>}
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-4">{madrid(p.creado, false)}</td>
                    <td className="py-2.5 pr-4 text-right">{num(p.packs)}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4 text-right">{eur(p.total, 2)}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4 text-right">{eur(p.envio, 2)}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4">{p.estado ?? DASH}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4">{p.pago ?? DASH}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4">
                      {[p.cliente?.nombre, p.cliente?.apellidos].filter(Boolean).join(" ") || DASH}
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-4">{p.cliente?.telefono ?? DASH}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4">{p.cliente?.email ?? DASH}</td>
                    <td className="py-2.5 pr-4">{p.cliente?.direccion ?? DASH}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4">{p.cliente?.codigo_postal ?? DASH}</td>
                    <td className="whitespace-nowrap py-2.5 pr-4">{p.cliente?.ciudad ?? DASH}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5 border-t pt-4">
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm tabular-nums">
            <p>
              <span className="text-muted-foreground">Pedidos válidos: </span>
              <span className="font-semibold">{num(validos.length)}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Packs: </span>
              <span className="font-semibold">{num(packs)}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Total: </span>
              <span className="font-semibold">{eur(euros, 2)}</span>
            </p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {num(nPrueba)} de prueba y {num(nCancel)} cancelados no cuentan
          </p>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold tracking-tight">Lista de envíos</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Solo pedidos válidos</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="outline" disabled={sinValidos} onClick={copiar}>
            Copiar lista de envíos
          </Button>
          <Button variant="outline" disabled={sinValidos} onClick={descargar}>
            Descargar CSV
          </Button>
          {sinValidos && <span className="text-xs text-muted-foreground">No hay pedidos válidos para enviar</span>}
          {aviso && <span className="text-xs font-medium" role="status">{aviso}</span>}
        </div>
      </Card>
    </>
  );
}
