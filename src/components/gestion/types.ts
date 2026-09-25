export type N = number | null;

export interface Periodo {
  facturacion: N;
  facturacion_sin_iva: N;
  iva: N;
  pedidos: N;
  tartas: N;
  ticket_medio: N;
  ticket_medio_sin_iva: N;
  margen_bruto?: N;
  margen_pct?: N;
  food_cost_teorico_pct?: N;
}

export interface RankingItem {
  nombre: string;
  unidades: N;
  kg: N;
}

export interface GestionData {
  tiendas?: { id: string; nombre: string }[];
  resumen?: { hoy?: Periodo; semana?: Periodo; mes?: Periodo; semana_anterior?: Periodo };
  diario?: {
    fecha: string;
    dia_semana: number;
    abierto: boolean;
    facturacion: N;
    facturacion_sin_iva: N;
    pedidos: N;
  }[];
  horas?: { franja: string; pedidos: N }[];
  ranking?: {
    crema?: RankingItem[];
    mermelada?: RankingItem[];
    frutos_secos?: RankingItem[];
    mousse?: RankingItem[];
  };
  mix?: { clave: string; nombre: string; ventas: N; tartas: N; pct_tartas: N }[];
  food_cost_real?: {
    desde: string;
    hasta: string;
    ventas_sin_iva: N;
    tartas: N;
    coste_real: N;
    coste_teorico: N;
    food_cost_real_pct: N;
    food_cost_teorico_pct: N;
    reparto_pct: N;
  }[];
  merma?: {
    semanas?: { semana: string; merma_kg: N; base_kg: N; merma_pct: N }[];
    elaboraciones?: {
      nombre: string;
      tipo: string;
      total_kg: N;
      serie: { semana: string; merma_pct: N; merma_kg: N }[];
    }[];
  };
  objetivo?: {
    tartas: N;
    objetivo_tartas: N;
    facturacion_sin_iva: N;
    objetivo_facturacion_sin_iva: N;
    facturacion?: N;
    objetivo_facturacion?: N;
    pvp_tarta: N;
    dias_abiertos_restantes: N;
  };
  rehechos?: {
    semana: N;
    mes: N;
    pct_semana: N;
    coste_mes: N;
    por_tienda?: { tienda: string; semana: N; mes: N }[];
    detalle?: {
      fecha: string;
      serie?: string | null;
      numero_pedido?: string | number | null;
      tienda?: string | null;
      tipo?: string | null;
      contenido?: string | null;
      veces?: N;
      estaciones?: string | string[] | null;
      estacion?: string | string[] | null;
      minutos_perdidos?: N;
      coste?: N;
    }[];
  };
}
