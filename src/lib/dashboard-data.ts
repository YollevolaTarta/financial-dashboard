export const summary = {
  hoy: { facturacion: 487, pedidos: 73, ticket: 6.67 },
  semana: { facturacion: 1842, pedidos: 312, ticket: 5.9 },
  mes: { facturacion: 6240, pedidos: 1087, ticket: 5.74 },
};

export const dailyRevenue = [
  { dia: "Lun", label: "Lun -2s", valor: 180, hoy: false },
  { dia: "Mar", label: "Mar -2s", valor: 0, hoy: false },
  { dia: "Mié", label: "Mié -2s", valor: 210, hoy: false },
  { dia: "Jue", label: "Jue -2s", valor: 390, hoy: false },
  { dia: "Vie", label: "Vie -2s", valor: 510, hoy: false },
  { dia: "Sáb", label: "Sáb -2s", valor: 620, hoy: false },
  { dia: "Dom", label: "Dom -2s", valor: 430, hoy: false },
  { dia: "Lun", label: "Lun -1s", valor: 190, hoy: false },
  { dia: "Mar", label: "Mar -1s", valor: 0, hoy: false },
  { dia: "Mié", label: "Mié -1s", valor: 225, hoy: false },
  { dia: "Jue", label: "Jue -1s", valor: 410, hoy: false },
  { dia: "Vie", label: "Vie -1s", valor: 530, hoy: false },
  { dia: "Sáb", label: "Sáb -1s", valor: 650, hoy: false },
  { dia: "Dom", label: "Dom -1s", valor: 460, hoy: false },
];

export const peakHours = [
  { franja: "17:00", pedidos: 8 },
  { franja: "17:30", pedidos: 14 },
  { franja: "18:00", pedidos: 22 },
  { franja: "18:30", pedidos: 31 },
  { franja: "19:00", pedidos: 48 },
  { franja: "19:30", pedidos: 52 },
  { franja: "20:00", pedidos: 44 },
  { franja: "20:30", pedidos: 38 },
  { franja: "21:00", pedidos: 29 },
  { franja: "21:30", pedidos: 18 },
  { franja: "22:00", pedidos: 8 },
];

export const topProduct = {
  nombre: "Tarta abierta pequeña",
  detalle: "Crema vainilla",
  unidades: 142,
};

export const topCombo = {
  nombre: "Crema vainilla + Ganache café",
  unidades: 67,
};

export const foodCost = { teorico: 28, real: 31 };

export const margen = {
  hoy: { euros: 336, pct: 69 },
  semana: { euros: 1271, pct: 69 },
};

export const mermaSeries = [
  { key: "vainilla", label: "Crema vainilla", color: "var(--color-chart-1)" },
  { key: "coulant", label: "Coulant chocolate", color: "var(--color-chart-2)" },
  { key: "lemon", label: "Lemon curd", color: "var(--color-chart-3)" },
  { key: "ny", label: "NY cheesecake", color: "var(--color-chart-4)" },
  { key: "basque", label: "Basque cheesecake", color: "var(--color-chart-5)" },
  { key: "crumble", label: "Crumble", color: "var(--color-chart-6)" },
];

export const merma = [
  { semana: "S-8", vainilla: 18, coulant: 12, lemon: 22, ny: 9, basque: 14, crumble: 6 },
  { semana: "S-7", vainilla: 17, coulant: 11, lemon: 20, ny: 9, basque: 13, crumble: 6 },
  { semana: "S-6", vainilla: 16, coulant: 11, lemon: 19, ny: 8, basque: 12, crumble: 5 },
  { semana: "S-5", vainilla: 15, coulant: 10, lemon: 18, ny: 8, basque: 12, crumble: 5 },
  { semana: "S-4", vainilla: 14, coulant: 10, lemon: 17, ny: 7, basque: 11, crumble: 5 },
  { semana: "S-3", vainilla: 13, coulant: 9, lemon: 16, ny: 7, basque: 10, crumble: 4 },
  { semana: "S-2", vainilla: 13, coulant: 9, lemon: 15, ny: 7, basque: 10, crumble: 4 },
  { semana: "S-1", vainilla: 12, coulant: 8, lemon: 14, ny: 6, basque: 9, crumble: 4 },
];

export const comparativa = [
  { metrica: "Facturación", anterior: "1.710 €", actual: "1.842 €", diff: 7.7, unidad: "%" },
  { metrica: "Nº pedidos", anterior: "289", actual: "312", diff: 7.9, unidad: "%" },
  { metrica: "Ticket medio", anterior: "5,91 €", actual: "5,90 €", diff: -0.2, unidad: "%" },
  { metrica: "Food cost real", anterior: "32 %", actual: "31 %", diff: -1, unidad: "pt", good: true },
];

export const objetivo = { actual: 312, meta: 500, precioBase: 4.9 };

export const eur = (n: number, decimals = 0) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
