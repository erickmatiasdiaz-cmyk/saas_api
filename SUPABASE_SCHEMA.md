# Supabase schema

Proyecto: `Saas_Apicola`

Migracion aplicada: `20260522201444_create_apigestor_core_schema`

## Tablas principales

- `companies`: cuenta empresa, marca, datos SAG/FRADA y facturacion.
- `company_members`: usuarios y roles por empresa.
- `apiaries`: apiarios con comuna, region, coordenadas, actividad apicola, salud y estado para archivar.
- `hives`: colmenas, QR, estado de reina, cria, reservas y marcos.
- `inspections`: inspecciones sanitarias con prioridad y seguimiento.
- `inspection_checklist_items`: checklist tecnico por inspeccion.
- `treatments`: medicamentos, principio activo, dosis, lote, fecha y retiro.
- `biosecurity_events`: bioseguridad, acciones preventivas y mortalidad.
- `harvest_lots`: lotes de cosecha trazables con QR, costos y precio.
- `harvest_lot_sources`: origen de cada lote por apiario.
- `inventory_items`: envases, medicamentos, insumos y alertas de stock.
- `sales_orders`: ventas, clientes, cantidades, estados y montos.
- `sipec_declarations`: declaracion anual SIPEC / Octubre.
- `export_jobs`: solicitudes de exportacion PDF, Excel o ZIP.
- `audit_logs`: bitacora de acciones.

## Seguridad

Todas las tablas publicas tienen RLS activado. Las politicas permiten acceso a usuarios autenticados que pertenezcan a la empresa mediante `company_members`.

Nota: los datos semilla crean miembros demo sin `user_id` asociado. Cuando se active Supabase Auth, hay que enlazar el usuario real a `company_members.user_id`.
