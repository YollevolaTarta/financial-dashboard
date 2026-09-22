# Financial Dashboard

PROMPT LOVABLE — DASHBOARD GESTIÓN MVP

Yo Llevo la Tarta

CONTEXTO

"Yo Llevo la Tarta" es una tienda de postres personalizados en formato pequeño. Este dashboard es para el gestor del negocio, no para el operario de cocina. Su función es ver en 30 segundos si el negocio va bien o mal, sin abrir ninguna hoja de cálculo ni preguntar a nadie.

QUÉ ES ESTE DASHBOARD

Una pantalla de gestión financiera y operativa del negocio. Muestra datos agregados de ventas, márgenes y rendimiento. En el sistema real se nutrirá automáticamente de los pedidos registrados. Para el MVP se carga con datos de prueba ficticios pero realistas.

LO QUE TIENE QUE VER EL GESTOR DE UN VISTAZO

Facturación: hoy / esta semana / este mes

Número de pedidos: hoy / esta semana / este mes

Ticket medio: hoy / esta semana / este mes

Producto más vendido de la semana

Combinación (crema + topping) más vendida de la semana

Horas de mayor venta (heatmap o gráfico por franja horaria)

Food cost real vs food cost teórico

Margen real del día y de la semana

ESTRUCTURA DEL DASHBOARD — 4 SECCIONES

SECCIÓN 1 — RESUMEN NUMÉRICO (parte superior, siempre visible)

Tres columnas: Hoy / Esta semana / Este mes

Métrica Hoy Esta semana Este mes Facturación X € X € X € Nº pedidos X X X Ticket medio X € X € X €

Formato: números grandes, sin decimales innecesarios. Lo más importante de la pantalla.

SECCIÓN 2 — VENTAS Y RENDIMIENTO

2A — Gráfico de facturación diaria

Gráfico de barras: últimos 14 días

Una barra por día

Color de marca (rojo #E8341C para la barra de hoy, rosa #F4A7B9 para el resto)

Eje Y en euros, eje X en fechas

2B — Horas de mayor venta

Heatmap o gráfico de barras horizontal por franja horaria (17h a 23h en intervalos de 30 min)

Muestra en qué horas se concentran más pedidos

Acumulado de la semana actual

2C — Producto y combinación más vendida

Producto más vendido: nombre + unidades esta semana

Combinación más vendida: crema + topping + unidades esta semana

Formato de tarjeta simple, sin gráfico

SECCIÓN 3 — FOOD COST Y MARGEN

3A — Food cost

Dos cifras lado a lado:

Food cost teórico: % calculado desde recetas y precios de materia prima

Food cost real: % calculado desde consumo real registrado en obrador

Si real > teórico en más de 5 puntos: alerta amarilla

Si real > teórico en más de 10 puntos: alerta roja

3B — Margen

Margen bruto del día: facturación − food cost real del día

Margen bruto de la semana: facturación − food cost real de la semana

En euros y en porcentaje

3C — Histórico de merma (viene del dashboard obrador)

Gráfico de línea: % de merma por semana en las últimas 8 semanas

Una línea por elaboración principal (crema vainilla, coulant chocolate, lemon curd, NY cheesecake, basque cheesecake, crumble)

Si una línea baja → mejora. Si sube → problema.

SECCIÓN 4 — COMPARATIVA Y TENDENCIA

4A — Esta semana vs semana anterior

Tabla simple: métrica | semana anterior | esta semana | diferencia %

Métricas: facturación, nº pedidos, ticket medio, food cost real

4B — Objetivo semanal

Break even del negocio: 500 unidades / semana ≈ 2.450€ facturación (500 × 4,90€ precio base)

Barra de progreso: unidades vendidas esta semana vs objetivo 500

Si se supera el objetivo: verde. Si no: rojo con unidades que faltan.

DATOS DE PRUEBA

Carga estos datos ficticios para que el dashboard se vea funcional desde el primer momento.

Hoy (viernes):

Facturación: 487€

Pedidos: 73

Ticket medio: 6,67€

Esta semana (lunes a viernes):

Facturación: 1.842€

Pedidos: 312

Ticket medio: 5,90€

Este mes:

Facturación: 6.240€

Pedidos: 1.087

Ticket medio: 5,74€

Facturación últimos 14 días:

Día Facturación Lun hace 2 sem 180€ Mar hace 2 sem 0€ Mié hace 2 sem 210€ Jue hace 2 sem 390€ Vie hace 2 sem 510€ Sáb hace 2 sem 620€ Dom hace 2 sem 430€ Lun semana pas 190€ Mar semana pas 0€ Mié semana pas 225€ Jue semana pas 410€ Vie semana pas 530€ Sáb semana pas 650€ Dom semana pas 460€

Nota: lunes y martes cerrado (producción).

Horas pico esta semana:

Franja Pedidos 17:00-17:30 8 17:30-18:00 14 18:00-18:30 22 18:30-19:00 31 19:00-19:30 48 19:30-20:00 52 20:00-20:30 44 20:30-21:00 38 21:00-21:30 29 21:30-22:00 18 22:00-22:30 8

Producto más vendido: Tarta abierta pequeña — Crema vainilla — 142 unidades esta semana

Combinación más vendida: Crema vainilla + Ganache café — 67 unidades esta semana

Food cost:

Teórico: 28%

Real: 31%

Margen bruto:

Hoy: 336€ (69%)

Esta semana: 1.271€ (69%)

Histórico merma últimas 8 semanas (% sobre producción):

Semana Vainilla Coulant choco Lemon curd NY cheese Basque Crumble Sem -8 18% 12% 22% 9% 14% 6% Sem -7 17% 11% 20% 9% 13% 6% Sem -6 16% 11% 19% 8% 12% 5% Sem -5 15% 10% 18% 8% 12% 5% Sem -4 14% 10% 17% 7% 11% 5% Sem -3 13% 9% 16% 7% 10% 4% Sem -2 13% 9% 15% 7% 10% 4% Sem -1 12% 8% 14% 6% 9% 4%

Tendencia bajando en todas las elaboraciones — el operario está mejorando.

Comparativa semanas:

Métrica Semana anterior Esta semana Diferencia Facturación 1.710€ 1.842€ +7,7% Nº pedidos 289 312 +7,9% Ticket medio 5,91€ 5,90€ -0,2% Food cost real 32% 31% -1 punto

Objetivo semanal: 312 pedidos de 500 objetivo — 62% completado (es viernes, faltan sábado y domingo).

NAVEGACIÓN Y UX

Una sola pantalla larga, scroll vertical

Sin tabs ni páginas separadas

Sin login para el MVP

Diseñado para móvil y tablet — el gestor lo consulta desde donde esté

Tipografía clara, números grandes

Los semáforos de color (verde/amarillo/rojo) tienen que ser inmediatamente legibles

VISUAL Y ESTILO

Fondo oscuro (casi negro)

Texto blanco

Rojo #E8341C para alertas y barras de hoy

Rosa #F4A7B9 para cabeceras de sección y detalles de marca

Verde #4CAF50 para métricas positivas y objetivos cumplidos

Amarillo #FFC107 para alertas leves

Gráficos limpios, sin decoración innecesaria

Tipografía sans-serif, grandes los números principales

Logo "Yo Llevo la Tarta" pequeño en cabecera

LO QUE NO ES ESTE MVP

No tiene login ni gestión de usuarios

No se conecta a ningún sistema externo

No tiene multi-tienda (escalable en el desarrollo real)

No genera informes exportables

No tiene alertas por email ni notificaciones push

Los datos son estáticos para el MVP (hardcoded). En el desarrollo real se nutren automáticamente de los pedidos registrados y del dashboard de obrador.

RESUMEN: LO QUE TIENE QUE FUNCIONAR

Resumen numérico hoy/semana/mes en la parte superior

Gráfico de barras de facturación últimos 14 días

Heatmap o gráfico de horas pico

Tarjeta de producto y combinación más vendida

Food cost teórico vs real con semáforo

Margen bruto en euros y porcentaje

Gráfico de histórico de merma por elaboración

Comparativa esta semana vs semana anterior

Barra de progreso hacia el objetivo semanal

Datos de prueba cargados y visibles desde el primer momento

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/93e26438-112e-456a-b5fa-8afb3fec4b5b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
