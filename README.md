# ApiGestor Chile

Demo migrado a Next.js + TypeScript.

## Ejecutar version nueva

```powershell
npm install
npm run dev
```

Luego abre:

```text
http://127.0.0.1:4174
```

## Verificar

```powershell
npm run typecheck
npm run build
```

## Version legacy

El prototipo HTML original sigue disponible en `index.html`.

---

# ColmenaPro Demo Legacy

Demo funcional de un SaaS para gestion apicola local.

## Como verlo

Opcion directa:

1. Abre `index.html` en el navegador.

Opcion con servidor local:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Luego entra a:

```text
http://127.0.0.1:4173
```

## Que incluye

- Panel con metricas de apiarios, colmenas, alertas y venta estimada.
- Mapa simulado con filtro por estado sanitario.
- Tabla de apiarios y rendimiento por temporada.
- Registro de inspecciones desde formulario.
- Trazabilidad de lote de miel con ficha publica y QR simulado.
- Simulador de margen por frasco.
- Pantalla de planes para validar precios con productores.

## Proxima version recomendada

- Guardar datos en una base real.
- Login por productor o cooperativa.
- Exportacion PDF/Excel.
- Registro offline desde celular.
- Integracion futura con WhatsApp para avisos de tratamientos y cosecha.
