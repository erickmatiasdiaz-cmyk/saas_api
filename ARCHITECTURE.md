# ApiGestor Chile - Arquitectura

## Stack

- Next.js App Router
- React
- TypeScript estricto
- CSS global migrado desde el prototipo
- Datos mock tipados en `src/lib`

## Estructura

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    layout/
      AppShell.tsx
      FloatingActions.tsx
      Sidebar.tsx
      Topbar.tsx
    ui/
      Card.tsx
  features/
    apiary/
      GenericRecordView.tsx
    auth/
      LoginScreen.tsx
    compliance/
      ComplianceHub.tsx
    dashboard/
      DashboardView.tsx
    field/
      FieldHub.tsx
      InspectionView.tsx
    production/
      ProductionHub.tsx
    sales/
      SalesView.tsx
    settings/
      SettingsView.tsx
  lib/
    mock-data.ts
    types.ts
```

## Criterio de separacion

- `components/layout`: estructura permanente de la app.
- `components/ui`: piezas reutilizables sin reglas de negocio.
- `features/*`: pantallas y flujos por dominio.
- `lib`: tipos, datos mock y helpers compartidos.

## Siguiente etapa

1. Reemplazar `mock-data.ts` por API real.
2. Separar `globals.css` en design tokens y estilos por componente.
3. Agregar shadcn/ui cuando el diseño visual se estabilice.
4. Agregar persistencia de login y roles.
5. Conectar exportacion PDF/Excel real.
