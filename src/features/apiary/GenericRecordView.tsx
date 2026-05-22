import { apiaries, treatments } from "@/lib/mock-data";
import type { ViewId } from "@/lib/types";

interface GenericRecordViewProps {
  view: ViewId;
}

const viewCopy: Partial<Record<ViewId, { title: string; cards: Array<[string, string, string]>; rows: string[][]; headers: string[] }>> = {
  apiaries: {
    title: "Apiarios FRADA",
    cards: [["4", "Apiarios activos", "Con coordenadas WGS-84"], ["128", "Colmenas", "Declarables"], ["100%", "Actividad", "Clasificada por rubro"]],
    headers: ["N apiario", "Nombre", "Comuna / region", "Coordenadas", "Actividad", "Colmenas"],
    rows: apiaries.map((item) => [item.id, item.name, `${item.commune} / ${item.region}`, item.coordinates, item.activity, String(item.hives)])
  },
  hives: {
    title: "Colmenas",
    cards: [["128", "Total", "Activas"], ["7", "Revisar reina", "Seguimiento"], ["4", "Baja reserva", "Alimentacion"]],
    headers: ["Codigo", "Apiario", "Reina", "Postura", "Alimento", "Estado"],
    rows: [["MZ-024", "El Manzano", "Presente", "Normal", "Medio", "Buena"], ["LP-007", "Las Palmas", "No vista", "Baja", "Medio", "Revision"]]
  },
  treatments: {
    title: "Tratamientos",
    cards: [["3", "Alertas", "Sanidad"], ["100%", "Con lote", "Trazabilidad"], ["1", "Vencido", "Atencion"]],
    headers: ["Diagnostico", "Colmena", "Medicamento", "Dosis", "Lote", "Retiro"],
    rows: treatments.map((item) => [item.diagnosis, item.hive, item.medicine, item.dose, item.batch, item.withdrawal])
  },
  biosecurity: {
    title: "Bioseguridad y mortalidad",
    cards: [["4", "Registros", "Activos"], ["1", "Mortalidad", "Seguimiento"], ["12", "Marcos", "Por renovar"]],
    headers: ["Registro", "Apiario", "Fecha", "Estado", "Observacion"],
    rows: [["Limpieza de alzas", "El Manzano", "18 may 2026", "Completado", "Desinfeccion con soplete"], ["Mortalidad anormal", "Los Boldos", "20 may 2026", "Alerta", "14 abejas adultas en piquera"]]
  },
  traceability: {
    title: "Trazabilidad",
    cards: [["M2026-001", "Lote", "QR publicado"], ["320 kg", "Cosecha", "El Manzano"], ["43,8%", "Margen", "$672.000"]],
    headers: ["Campo", "Valor"],
    rows: [["Fecha cosecha", "12 may 2026"], ["Kilos cosechados", "320 kg"], ["Apiario origen", "El Manzano"], ["Comuna / Region", "San Carlos, Nuble"]]
  },
  inventory: {
    title: "Inventario",
    cards: [["480", "Frascos", "500 g"], ["350", "Tapas", "Bajo minimo"], ["2 L", "Acido oxalico", "OK"]],
    headers: ["Insumo", "Stock", "Minimo", "Ubicacion", "Estado"],
    rows: [["Frasco 500 g", "480", "300", "Bodega Norte", "OK"], ["Tapa dorada", "350", "500", "Bodega Norte", "Bajo"]]
  },
  reports: {
    title: "Reportes PDF/Excel",
    cards: [["PDF", "FRADA", "Listo"], ["Excel", "SIPEC", "Borrador"], ["QR", "Ficha publica", "Publicado"]],
    headers: ["Reporte", "Periodo", "Formato", "Uso", "Estado"],
    rows: [["FRADA apicultor/apiarios", "2026", "PDF", "Respaldo SAG", "Listo"], ["SIPEC Octubre", "2026", "Excel", "Declaracion anual", "Borrador"]]
  },
  sipec: {
    title: "Declaracion SIPEC / Octubre",
    cards: [["Octubre", "Ventana anual", "Declaracion"], ["4", "Apiarios", "Con GPS"], ["128", "Colmenas", "Total"]],
    headers: ["Paso", "Estado"],
    rows: [["Perfil apicultor", "Completo"], ["Apiarios FRADA", "Completo"], ["Conteo colmenas", "Listo"], ["Exportar respaldo", "Pendiente"]]
  },
  sagProfile: {
    title: "Perfil Apicultor SAG",
    cards: [["SAG", "Registro", "AP-2026-0142"], ["INDAP", "Usuario", "Activo"], ["FRADA", "Datos", "Completos"]],
    headers: ["Campo", "Valor"],
    rows: [["RUT", "12.345.678-9"], ["Nombre", "Maria Apicultora"], ["Razon social", "Apicola del Valle"], ["Region", "Nuble"]]
  },
  priorities: {
    title: "Prioridades",
    cards: [["Alta", "Campo", "Inspeccion rapida"], ["Alta", "SAG/SIPEC", "Respaldo"], ["Media", "Ventas", "Pipeline"]],
    headers: ["Prioridad", "Modulo", "Estado", "Siguiente paso"],
    rows: [["Alta", "Apiarios FRADA", "Mejorado", "Capturar GPS desde celular"], ["Alta", "Tratamientos", "Mejorado", "Validar productos autorizados"]]
  }
};

export function GenericRecordView({ view }: GenericRecordViewProps) {
  const config = viewCopy[view] ?? viewCopy.apiaries!;

  return (
    <>
      <div className="module-grid">
        {config.cards.map(([value, label, detail]) => (
          <article className="module-card" key={`${value}-${label}`}>
            <strong>{value}</strong>
            <h2>{label}</h2>
            <p>{detail}</p>
          </article>
        ))}
      </div>
      <section className="card">
        <div className="panel-header"><h2>{config.title}</h2></div>
        <div className="table-wrap">
          <table>
            <thead><tr>{config.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
            <tbody>
              {config.rows.map((row) => (
                <tr key={row.join("-")}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
