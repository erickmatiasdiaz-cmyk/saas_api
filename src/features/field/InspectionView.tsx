interface InspectionViewProps {
  onToast: (message: string) => void;
}

export function InspectionView({ onToast }: InspectionViewProps) {
  return (
    <div className="dashboard-grid">
      <section className="card">
        <div className="panel-header">
          <h2>Inspeccion rapida de colmena</h2>
          <span className="tag ok">Modo terreno</span>
        </div>
        <label>Apiario<select defaultValue="El Manzano"><option>El Manzano</option><option>Las Palmas</option></select></label>
        <label>Colmena<input defaultValue="24" min="1" type="number" /></label>
        {["Cria y reina", "Recursos y poblacion", "Salud y preocupaciones"].map((section) => (
          <div className="inspection-section" key={section}>
            <h3>{section}</h3>
            <div className="checklist-grid">
              <label><input defaultChecked type="checkbox" /> Reina vista</label>
              <label><input type="checkbox" /> Celdas reales</label>
              <label><input defaultChecked type="checkbox" /> Reservas medias</label>
              <label><input defaultChecked type="checkbox" /> Revisar varroa</label>
            </div>
          </div>
        ))}
        <label>Notas<textarea defaultValue="Colmena fuerte, postura normal y reserva media. Revisar varroa en 7 dias." rows={5} /></label>
        <button className="primary-button" onClick={() => onToast("Inspeccion guardada y tarea de seguimiento creada")} type="button">Guardar inspeccion</button>
      </section>
      <section className="card">
        <div className="panel-header"><h2>Acciones sugeridas</h2></div>
        <div className="compliance-list">
          <article><strong>Control varroa</strong><span className="tag watch">7 dias</span></article>
          <article><strong>Agregar alza</strong><span className="tag ok">Si aumenta flujo</span></article>
          <article><strong>Foto de postura</strong><span className="tag watch">Proxima visita</span></article>
        </div>
      </section>
    </div>
  );
}
