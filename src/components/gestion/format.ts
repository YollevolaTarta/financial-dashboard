const DASH = "—";
const isNum = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

export const eur = (n: number | null | undefined, decimals = 0) =>
  isNum(n)
    ? new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: "always" as unknown as boolean,
      }).format(n)
    : DASH;

export const num = (n: number | null | undefined, decimals = 0) =>
  isNum(n)
    ? new Intl.NumberFormat("es-ES", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: "always" as unknown as boolean,
      }).format(n)
    : DASH;

export const pct = (n: number | null | undefined) => (isNum(n) ? `${num(n, 1)} %` : DASH);

/** "2026-09-22" -> "22/09" */
export const ddmm = (s: string | null | undefined) => {
  if (!s) return DASH;
  const [, m, d] = s.slice(0, 10).split("-");
  return d && m ? `${d}/${m}` : DASH;
};

export const hhmm = (s: string | null | undefined) => {
  if (!s) return DASH;
  const d = new Date(s);
  if (isNaN(d.getTime())) return DASH;
  return d.toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

export const DIAS = ["", "L", "M", "X", "J", "V", "S", "D"];

export { isNum };
