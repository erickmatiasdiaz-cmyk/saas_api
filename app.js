const apiaries = [
  { name: "El Manzano", sector: "San Carlos, Nuble", hives: 32, health: "ok", last: "18 may 2026", kg: 320, x: 60, y: 26 },
  { name: "Las Palmas", sector: "San Fabian", hives: 28, health: "watch", last: "17 may 2026", kg: 260, x: 66, y: 72 },
  { name: "El Arrayan", sector: "Quillon", hives: 24, health: "watch", last: "15 may 2026", kg: 210, x: 44, y: 50 },
  { name: "Los Boldos", sector: "Coihueco", hives: 44, health: "risk", last: "12 may 2026", kg: 410, x: 24, y: 76 },
];

const inspections = [
  { hive: "Colmena 24", apiary: "El Manzano", date: "20 may 2026", owner: "Maria Apicultora", status: "ok" },
  { hive: "Colmena 11", apiary: "El Manzano", date: "21 may 2026", owner: "Maria Apicultora", status: "watch" },
  { hive: "Colmena 07", apiary: "Las Palmas", date: "22 may 2026", owner: "Maria Apicultora", status: "watch" },
];

const treatments = [
  { name: "Varroa destructor", hive: "Colmena 18", apiary: "El Manzano", medicine: "Acido oxalico", active: "Oxalico", dose: "5 ml/calle", batch: "OX-2605", applied: "15 may 2026", withdrawal: "Sin carencia miel", due: "Vencido", status: "risk" },
  { name: "Loque Americana", hive: "Colmena 05", apiary: "Las Palmas", medicine: "Muestra laboratorio", active: "Diagnostico", dose: "1 muestra", batch: "LAB-118", applied: "Pendiente", withdrawal: "Aislar material", due: "Por aplicar", status: "watch" },
  { name: "Varroa destructor", hive: "Colmena 32", apiary: "El Arrayan", medicine: "Timol gel", active: "Timol", dose: "1 lamina", batch: "TM-332", applied: "22 may 2026", withdrawal: "7 dias", due: "Proximo", status: "watch" },
];

const sagProfile = {
  rut: "12.345.678-9",
  name: "Maria Apicultora",
  businessName: "Apicola del Valle",
  registry: "SAG-AP-2026-0142",
  address: "Camino Las Flores km 8",
  commune: "San Carlos",
  region: "Nuble",
  phone: "+56 9 5555 1212",
  email: "contacto@apigestor.cl",
  personType: "Persona natural",
  indap: "Usuario INDAP",
  organic: "No organico",
};

const biosecurityRows = [
  ["Limpieza de alzas", "El Manzano", "18 may 2026", "Completado", "Desinfeccion con soplete"],
  ["Renovacion de cera", "Las Palmas", "21 may 2026", "Pendiente", "Cambiar 12 marcos antiguos"],
  ["Mortalidad anormal", "Los Boldos", "20 may 2026", "Alerta", "14 abejas adultas en piquera"],
  ["Ingreso material externo", "El Arrayan", "15 may 2026", "Registrado", "Marcos nuevos lote MC-2026-08"],
];

const modules = {
  field: {
    title: "Campo",
    eyebrow: "Trabajo rapido en terreno",
    custom: "field",
  },
  sagProfile: {
    title: "Perfil Apicultor SAG",
    eyebrow: "Datos FRADA / registro apicola",
    custom: "sagProfile",
  },
  apiaries: {
    title: "Apiarios",
    eyebrow: "FRADA: ubicacion y actividad apicola",
    cards: [
      ["4", "Apiarios activos", "Distribuidos entre Nuble y Maule."],
      ["128", "Colmenas registradas", "Inventario listo para inspeccion."],
      ["100%", "Con coordenadas", "WGS-84 listas para respaldo."],
    ],
    table: ["N apiario", "Nombre", "Comuna / region", "Coordenadas WGS-84", "Actividad apicola", "Colmenas", "Estado"],
    rows: [
      ["API-001", "El Manzano", "San Carlos / Nuble", "-36.4242, -71.9581", "Miel, cera, polinizacion", "32", "Buena"],
      ["API-002", "Las Palmas", "San Fabian / Nuble", "-36.5691, -71.5450", "Miel, nucleos, propoleo", "28", "Revision"],
      ["API-003", "El Arrayan", "Quillon / Nuble", "-36.7421, -72.4700", "Miel, autoconsumo", "24", "Revision"],
      ["API-004", "Los Boldos", "Coihueco / Nuble", "-36.6158, -71.8325", "Miel, seleccion/cria", "44", "Critica"],
    ],
  },
  hives: {
    title: "Colmenas",
    eyebrow: "Inventario productivo",
    cards: [
      ["128", "Total colmenas", "Activas en temporada."],
      ["7", "Con reina por revisar", "Marcadas para proxima visita."],
      ["4", "Baja reserva", "Necesitan alimentacion."],
    ],
    table: ["Codigo", "Apiario", "Reina", "Postura", "Alimento", "Estado"],
    rows: [
      ["MZ-024", "El Manzano", "Presente", "Normal", "Medio", "Buena"],
      ["MZ-011", "El Manzano", "Presente", "Media", "Bajo", "Revision"],
      ["LP-007", "Las Palmas", "No vista", "Baja", "Medio", "Revision"],
      ["LB-018", "Los Boldos", "Presente", "Irregular", "Bajo", "Critica"],
    ],
  },
  sipec: {
    title: "Declaracion SIPEC / Octubre",
    eyebrow: "Flujo anual y actualizaciones",
    custom: "sipec",
  },
  inspections: {
    title: "Inspecciones",
    eyebrow: "Checklist sanitario tecnico",
    custom: "inspections",
  },
  treatments: {
    title: "Tratamientos",
    eyebrow: "Medicamentos, dosis, lote y retiro",
    cards: [
      ["3", "Alertas abiertas", "Requieren gestion sanitaria."],
      ["1", "Vencido", "Aplicacion fuera de fecha."],
      ["100%", "Con lote/dosis", "Trazabilidad de medicamento."],
    ],
    table: ["Diagnostico", "Colmena", "Medicamento", "Principio activo", "Dosis", "Lote", "Aplicacion", "Retiro/carencia"],
    rows: treatments.map((item) => [item.name, item.hive, item.medicine, item.active, item.dose, item.batch, item.applied, item.withdrawal]),
  },
  biosecurity: {
    title: "Bioseguridad y Mortalidad",
    eyebrow: "Control sanitario preventivo",
    cards: [
      ["4", "Registros activos", "Limpieza, cera, material y mortalidad."],
      ["1", "Mortalidad anormal", "Requiere seguimiento tecnico."],
      ["12", "Marcos por renovar", "Planificados esta semana."],
    ],
    table: ["Registro", "Apiario", "Fecha", "Estado", "Observacion"],
    rows: biosecurityRows,
  },
  production: {
    title: "Produccion",
    eyebrow: "Cosecha y rendimiento",
    cards: [
      ["1.200 kg", "Miel proyectada", "Estimacion temporada."],
      ["9,4 kg", "Promedio por colmena", "Hasta la fecha."],
      ["43,8%", "Margen estimado", "Sobre lote M2026-001."],
    ],
    table: ["Lote", "Apiarios", "Kilos", "Envases", "Margen"],
    rows: [
      ["M2026-001", "El Manzano", "320 kg", "640 x 500 g", "$672.000"],
      ["M2026-002", "Las Palmas", "260 kg", "520 x 500 g", "$524.000"],
      ["M2026-003", "El Arrayan", "210 kg", "420 x 500 g", "$386.000"],
    ],
  },
  productionHub: {
    title: "Produccion",
    eyebrow: "Cosecha, trazabilidad e inventario",
    custom: "productionHub",
  },
  traceability: {
    title: "Trazabilidad",
    eyebrow: "Lotes con QR",
    custom: "traceability",
  },
  sales: {
    title: "Ventas",
    eyebrow: "Comercializacion",
    custom: "sales",
  },
  inventory: {
    title: "Inventario",
    eyebrow: "Insumos y bodega",
    cards: [
      ["480", "Frascos disponibles", "Formato 500 g."],
      ["18", "Marcos nuevos", "Listos para recambio."],
      ["6", "Insumos bajos", "Comprar antes de cosecha."],
    ],
    table: ["Insumo", "Stock", "Minimo", "Ubicacion", "Estado"],
    rows: [
      ["Frasco 500 g", "480", "300", "Bodega Norte", "OK"],
      ["Tapa dorada", "350", "500", "Bodega Norte", "Bajo"],
      ["Acido oxalico", "2 L", "1 L", "Sanidad", "OK"],
    ],
  },
  reports: {
    title: "Reportes",
    eyebrow: "Gestion y respaldo",
    custom: "reports",
  },
  compliance: {
    title: "SAG / SIPEC",
    eyebrow: "Registros, declaracion y respaldos",
    custom: "compliance",
  },
  priorities: {
    title: "Prioridades",
    eyebrow: "Checklist de completitud SAG/SIPEC",
    cards: [
      ["1", "Perfil Apicultor SAG", "Datos base para FRADA y respaldo."],
      ["2", "Apiarios FRADA", "Coordenadas, comuna, region y actividad."],
      ["3", "SIPEC Octubre", "Declaracion anual y cambios de apiarios."],
    ],
    table: ["Prioridad", "Modulo", "Estado en app", "Siguiente paso", "Impacto"],
    rows: [
      ["Alta", "Perfil Apicultor SAG", "Agregado", "Validar campos con apicultor real", "Registro base"],
      ["Alta", "Apiarios FRADA", "Mejorado", "Capturar GPS desde celular", "Declaracion y avisos"],
      ["Alta", "SIPEC Octubre", "Agregado", "Exportar respaldo anual", "Cumplimiento operativo"],
      ["Alta", "Inspeccion sanitaria", "Mejorado", "Agregar evidencia/fotos por colmena", "Sanidad"],
      ["Alta", "Tratamientos", "Mejorado", "Validar productos autorizados", "Trazabilidad sanitaria"],
      ["Media", "Bioseguridad y mortalidad", "Agregado", "Agregar protocolo de denuncia/aislamiento", "Prevencion"],
      ["Media", "Reportes PDF/Excel", "Agregado", "Conectar generador real", "Respaldo comercial"],
    ],
  },
  settings: {
    title: "Configuracion",
    eyebrow: "Cuenta y parametros",
    custom: "settings",
  },
};

const viewTitles = Object.fromEntries(Object.entries(modules).map(([key, value]) => [key, value.title]));
viewTitles.dashboard = "Panel Apicola";

const viewEyebrows = Object.fromEntries(Object.entries(modules).map(([key, value]) => [key, value.eyebrow]));
viewEyebrows.dashboard = "Temporada 2025/2026";

function qs(selector) {
  return document.querySelector(selector);
}

function qsa(selector) {
  return [...document.querySelectorAll(selector)];
}

function healthLabel(status) {
  return status === "ok" ? "Buena" : status === "watch" ? "Revision" : "Critica";
}

function showToast(message) {
  const toast = qs("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2300);
}

function renderMap() {
  const filter = qs("#healthFilter").value;
  const visible = filter === "all" ? apiaries : apiaries.filter((apiary) => apiary.health === filter);
  qs("#apiaryMap").innerHTML = visible
    .map(
      (apiary) => `
        <button class="map-pin ${apiary.health}" style="left:${apiary.x}%; top:${apiary.y}%;" title="${apiary.name}" type="button">
          <span>${apiary.hives}</span>
        </button>
      `,
    )
    .join("");

  qs("#apiaryList").innerHTML = apiaries
    .map(
      (apiary) => `
        <article class="apiary-row">
          <div>
            <strong>${apiary.name}</strong>
            <small>${apiary.hives} colmenas</small>
          </div>
          <span class="status ${apiary.health}">${healthLabel(apiary.health)}</span>
        </article>
      `,
    )
    .join("");
}

function renderInspectionsList() {
  qs("#inspectionList").innerHTML = inspections
    .map(
      (item) => `
        <article class="inspection-row">
          <div>
            <strong>${item.hive} - ${item.apiary}</strong>
            <small>${item.date} · ${item.owner}</small>
          </div>
          <span class="tag ${item.status}">${item.status === "ok" ? "Lista" : "Pendiente"}</span>
        </article>
      `,
    )
    .join("");
}

function renderTreatmentsList() {
  qs("#treatmentList").innerHTML = treatments
    .map(
      (item) => `
        <article class="treatment-row">
          <div>
            <strong>${item.name} - ${item.hive}</strong>
            <small>${item.apiary}</small>
          </div>
          <span class="tag ${item.status}">${item.due}</span>
        </article>
      `,
    )
    .join("");
}

function renderModuleCards(cards) {
  return `
    <div class="module-grid">
      ${cards
        .map(
          ([value, label, copy]) => `
            <article class="module-card">
              <strong>${value}</strong>
              <h2>${label}</h2>
              <p>${copy}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderTable(headers, rows) {
  return `
    <section class="panel">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderInspectionModule() {
  return `
    <div class="dashboard-grid">
      <section class="panel">
        <div class="panel-header">
          <h2>Inspeccion rapida de colmena</h2>
          <span class="tag ok">Modo terreno</span>
        </div>
        <label>Apiario<select id="inspectionApiary">${apiaries.map((apiary) => `<option>${apiary.name}</option>`).join("")}</select></label>
        <label>Colmena<input id="inspectionHive" type="number" min="1" value="24" /></label>
        <div class="inspection-section">
          <h3>Cria y reina</h3>
          <div class="checklist-grid">
            <label><input type="checkbox" checked /> Reina vista</label>
            <label><input type="checkbox" /> Celdas reales</label>
            <label><input type="checkbox" checked /> Huevos presentes</label>
            <label><input type="checkbox" checked /> Larvas presentes</label>
            <label><input type="checkbox" checked /> Cria operculada</label>
            <label>Patron de postura<select><option>Bueno</option><option>Irregular</option><option>Pobre</option></select></label>
          </div>
        </div>
        <div class="inspection-section">
          <h3>Recursos y poblacion</h3>
          <div class="form-grid">
            <label>Reservas de miel<select><option>Medio</option><option>Ninguno</option><option>Bajo</option><option>Alto</option></select></label>
            <label>Reservas de polen<select><option>Medio</option><option>Ninguno</option><option>Bajo</option><option>Alto</option></select></label>
            <label>Poblacion<select><option>Promedio</option><option>Pequena</option><option>Grande</option></select></label>
            <label>Peso colmena<input type="number" min="0" value="50" /></label>
          </div>
        </div>
        <div class="inspection-section">
          <h3>Salud y preocupaciones</h3>
          <div class="checklist-grid">
            <label><input type="checkbox" /> Sospecha loque</label>
            <label><input type="checkbox" /> Mortalidad anormal</label>
            <label><input type="checkbox" checked /> Requiere control varroa</label>
            <label><input type="checkbox" /> Colonia encontrada muerta</label>
          </div>
        </div>
        <div class="checklist-grid">
          <label><input type="checkbox" checked /> Crear tarea de seguimiento</label>
          <label><input type="checkbox" /> Registrar tratamiento ahora</label>
        </div>
        <label>Porcentaje varroa estimado<input type="number" min="0" max="100" value="3" /></label>
        <label>Clima / floracion<input value="Templado, floracion media de quillay" /></label>
        <label>Nota<textarea id="inspectionNote" rows="5">Colmena fuerte, postura normal y reserva media. Revisar varroa en 7 dias.</textarea></label>
        <button class="primary-button" id="saveInspectionForm" type="button">Guardar inspeccion</button>
      </section>
      <section class="panel">
        <div class="panel-header"><h2>Historial reciente</h2></div>
        <div class="inspection-list">
          ${inspections
            .map(
              (item) => `
                <article class="inspection-row">
                  <div>
                    <strong>${item.hive} - ${item.apiary}</strong>
                    <small>${item.date} · ${item.owner}</small>
                  </div>
                  <span class="tag ${item.status}">${item.status === "ok" ? "Lista" : "Pendiente"}</span>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    </div>
  `;
}

function renderSagProfileModule() {
  return `
    <div class="dashboard-grid">
      <section class="panel">
        <div class="panel-header"><h2>Datos del apicultor</h2><span class="tag ok">FRADA listo</span></div>
        <div class="form-grid">
          <label>RUT<input value="${sagProfile.rut}" /></label>
          <label>Nombre<input value="${sagProfile.name}" /></label>
          <label>Razon social<input value="${sagProfile.businessName}" /></label>
          <label>N registro SAG<input value="${sagProfile.registry}" /></label>
          <label>Tipo persona<input value="${sagProfile.personType}" /></label>
          <label>Usuario INDAP<input value="${sagProfile.indap}" /></label>
          <label>Certificacion organica<input value="${sagProfile.organic}" /></label>
          <label>Correo<input value="${sagProfile.email}" /></label>
          <label>Telefono<input value="${sagProfile.phone}" /></label>
          <label>Direccion<input value="${sagProfile.address}" /></label>
          <label>Comuna<input value="${sagProfile.commune}" /></label>
          <label>Region<input value="${sagProfile.region}" /></label>
        </div>
        <button class="primary-button export-action" data-export="perfil-sag" type="button">Guardar perfil SAG</button>
      </section>
      <section class="panel">
        <div class="panel-header"><h2>Completitud</h2></div>
        <div class="compliance-list">
          <article><strong>Identificacion</strong><span class="tag ok">Completo</span></article>
          <article><strong>Contacto</strong><span class="tag ok">Completo</span></article>
          <article><strong>Registro SAG</strong><span class="tag ok">Completo</span></article>
          <article><strong>Certificaciones</strong><span class="tag watch">Validar</span></article>
        </div>
      </section>
    </div>
  `;
}

function renderSipecModule() {
  return `
    <div class="dashboard-grid">
      <section class="panel">
        <div class="panel-header"><h2>Declaracion anual octubre</h2><span class="tag watch">Borrador 2026</span></div>
        <div class="flow-list">
          <article class="flow-step done"><b>1</b><div><strong>Perfil apicultor</strong><small>RUT, contacto y registro SAG completos.</small></div></article>
          <article class="flow-step done"><b>2</b><div><strong>Apiarios FRADA</strong><small>Coordenadas, comuna, region y actividad registradas.</small></div></article>
          <article class="flow-step active"><b>3</b><div><strong>Conteo de colmenas</strong><small>128 colmenas declarables para octubre.</small></div></article>
          <article class="flow-step"><b>4</b><div><strong>Actualizar cambios</strong><small>Movimientos, altas, bajas y actividad apicola.</small></div></article>
          <article class="flow-step"><b>5</b><div><strong>Exportar respaldo</strong><small>PDF/Excel para carga o archivo interno.</small></div></article>
        </div>
      </section>
      <section class="panel">
        <div class="panel-header"><h2>Resumen SIPEC</h2></div>
        <div class="module-grid">
          <article class="module-card"><strong>Octubre</strong><h2>Ventana anual</h2><p>Declaracion y actualizacion principal.</p></article>
          <article class="module-card"><strong>4</strong><h2>Apiarios</h2><p>Todos con coordenadas WGS-84.</p></article>
          <article class="module-card"><strong>128</strong><h2>Colmenas</h2><p>Total para declaracion.</p></article>
        </div>
        <button class="primary-button export-action" data-export="sipec-octubre" type="button">Generar borrador SIPEC</button>
      </section>
    </div>
  `;
}

function renderReportsModule() {
  return `
    <div class="module-grid export-grid">
      <article class="module-card"><strong>PDF</strong><h2>Perfil SAG / FRADA</h2><p>Datos de apicultor, apiarios y colmenas.</p><button class="primary-button export-action" data-export="frada-pdf" type="button">Exportar PDF</button></article>
      <article class="module-card"><strong>Excel</strong><h2>SIPEC Octubre</h2><p>Resumen anual para respaldo y carga operativa.</p><button class="primary-button export-action" data-export="sipec-excel" type="button">Exportar Excel</button></article>
      <article class="module-card"><strong>PDF</strong><h2>Sanidad y tratamientos</h2><p>Inspecciones, medicamentos, dosis, lote y retiro.</p><button class="primary-button export-action" data-export="sanidad-pdf" type="button">Exportar PDF</button></article>
      <article class="module-card"><strong>Excel</strong><h2>Produccion y ventas</h2><p>Lotes, kilos, envases, costos y margen.</p><button class="primary-button export-action" data-export="ventas-excel" type="button">Exportar Excel</button></article>
      <article class="module-card"><strong>QR</strong><h2>Ficha publica</h2><p>Trazabilidad de lote para clientes.</p><button class="primary-button export-action" data-export="lote-qr" type="button">Generar QR</button></article>
      <article class="module-card"><strong>PDF</strong><h2>Bioseguridad</h2><p>Mortalidad, limpieza, cera y material externo.</p><button class="primary-button export-action" data-export="bioseguridad-pdf" type="button">Exportar PDF</button></article>
    </div>
    ${renderTable(["Reporte", "Periodo", "Formato", "Uso", "Estado"], [
      ["FRADA apicultor/apiarios", "2026", "PDF", "Respaldo SAG", "Listo"],
      ["SIPEC Octubre", "2026", "Excel", "Declaracion anual", "Borrador"],
      ["Sanidad temporada", "Mayo 2026", "PDF", "Respaldo tecnico", "Listo"],
      ["Cosecha y margen", "2025/2026", "Excel", "Gestion interna", "Listo"],
    ])}
  `;
}

function renderTraceabilityModule() {
  return `
    <div class="dashboard-grid">
      <section class="panel">
        <div class="panel-header">
          <h2>Lote M2026-001</h2>
          <span class="tag ok">QR publicado</span>
        </div>
        <div class="jar-hero">
          <div class="jar"></div>
          <div class="jar"></div>
          <div class="qr">QR</div>
        </div>
        <dl class="lot-details">
          <div><dt>Fecha cosecha</dt><dd>12 may 2026</dd></div>
          <div><dt>Kilos cosechados</dt><dd>320 kg</dd></div>
          <div><dt>Apiario origen</dt><dd>El Manzano</dd></div>
          <div><dt>Comuna / Region</dt><dd>San Carlos, Nuble</dd></div>
        </dl>
      </section>
      <section class="panel">
        <div class="panel-header"><h2>Resultado comercial</h2></div>
        <div class="module-grid">
          <article class="module-card"><strong>$1.536.000</strong><h2>Ingresos estimados</h2><p>Precio referencial por lote.</p></article>
          <article class="module-card"><strong>$864.000</strong><h2>Costo estimado</h2><p>Produccion, envase y logistica.</p></article>
          <article class="module-card"><strong>$672.000</strong><h2>Margen estimado</h2><p>43,8% sobre venta.</p></article>
        </div>
        <button class="primary-button" id="copyTraceBtn" type="button">Copiar ficha publica</button>
      </section>
    </div>
  `;
}

function actionCard(title, copy, target, badge = "Abrir") {
  return `
    <article class="module-card action-card">
      <span class="tag ok">${badge}</span>
      <h2>${title}</h2>
      <p>${copy}</p>
      <button class="ghost-button" data-view-target="${target}" type="button">Entrar</button>
    </article>
  `;
}

function renderFieldHub() {
  return `
    <div class="hero-strip">
      <div>
        <span class="pill">Offline-first</span>
        <h2>Registra una inspeccion en terreno sin pelear con el telefono.</h2>
        <p>Flujo simple tipo libreta digital: escanea la colmena, dicta observaciones, completa checklist sanitario y guarda acciones de seguimiento.</p>
      </div>
      <div class="quick-actions">
        <button class="primary-button" id="startVoiceLog" type="button">Grabar nota de voz</button>
        <button class="ghost-button" id="scanHiveTag" type="button">Escanear QR/NFC</button>
      </div>
    </div>
    <div class="module-grid">
      ${actionCard("Inspeccion rapida", "Reina, cria, reservas, temperamento, varroa, salud y acciones.", "inspections", "Principal")}
      ${actionCard("QR/NFC de colmena", "Abre el historial exacto de la colmena antes de registrar.", "hives")}
      ${actionCard("Apiarios y colmenas", "Mapa, ubicacion, historial y estructura de cada apiario.", "apiaries")}
      ${actionCard("Tratamientos", "Medicamento, principio activo, dosis, lote, aplicacion y retiro.", "treatments")}
      ${actionCard("Bioseguridad", "Limpieza, renovacion de cera, material externo y mortalidad.", "biosecurity")}
      <article class="module-card">
        <strong>24h</strong>
        <h2>Clima y floracion</h2>
        <p>Ventana favorable para inspeccion: templado, viento bajo, floracion media.</p>
      </article>
    </div>
  `;
}

function renderProductionHub() {
  return `
    <div class="ops-layout">
      <section class="panel production-command">
        <div class="panel-header">
          <div>
            <span class="pill">De la colmena al frasco</span>
            <h2>Centro de produccion</h2>
          </div>
          <button class="primary-button export-action" data-export="lote-comercial" type="button">Crear lote trazable</button>
        </div>
        <div class="batch-progress">
          <div><strong>Cosecha</strong><span class="done"></span></div>
          <div><strong>Filtrado</strong><span class="done"></span></div>
          <div><strong>Envasado</strong><span class="active"></span></div>
          <div><strong>Etiqueta QR</strong><span></span></div>
          <div><strong>Venta</strong><span></span></div>
        </div>
        <div class="lot-board">
          <article><span class="tag ok">Activo</span><strong>M2026-001</strong><p>El Manzano · 320 kg · 640 frascos</p><b>$672.000 margen</b></article>
          <article><span class="tag watch">Envasando</span><strong>M2026-002</strong><p>Las Palmas · 260 kg · 520 frascos</p><b>$524.000 margen</b></article>
          <article><span class="tag watch">Borrador</span><strong>M2026-003</strong><p>El Arrayan · 210 kg · 420 frascos</p><b>$386.000 margen</b></article>
        </div>
      </section>
      <section class="panel">
        <div class="panel-header"><h2>Inventario critico</h2></div>
        <div class="stock-list">
          <article><strong>Frascos 500 g</strong><span>480 disponibles</span><progress value="62" max="100"></progress></article>
          <article><strong>Tapas doradas</strong><span>350 disponibles</span><progress value="38" max="100"></progress></article>
          <article><strong>Etiquetas QR</strong><span>640 impresas</span><progress value="78" max="100"></progress></article>
        </div>
      </section>
    </div>
    <div class="module-grid">
      ${actionCard("Cosecha y rendimiento", "Kilos por apiario, rendimiento por colmena y comparativo de temporada.", "production")}
      ${actionCard("Trazabilidad QR", "Lote, origen, fecha, envases, costos, margen y ficha publica.", "traceability")}
      ${actionCard("Inventario", "Frascos, tapas, marcos, medicamentos y alertas de stock.", "inventory")}
    </div>
  `;
}

function renderSalesModule() {
  return `
    <div class="sales-layout">
      <section class="panel sales-hero">
        <div>
          <span class="pill">Pipeline comercial</span>
          <h2>$1.536.000 en oportunidades activas</h2>
          <p>Gestiona clientes, lotes, reservas y margen sin mezclarlo con los registros sanitarios.</p>
        </div>
        <button class="primary-button" id="newSaleBtn" type="button">Nueva venta</button>
      </section>
      <section class="panel">
        <div class="panel-header"><h2>Resumen</h2></div>
        <div class="metric-stack">
          <article><strong>$4.800/kg</strong><span>Precio promedio</span></article>
          <article><strong>18</strong><span>Clientes activos</span></article>
          <article><strong>43,8%</strong><span>Margen lote lider</span></article>
        </div>
      </section>
    </div>
    <div class="kanban-board">
      <section class="kanban-column"><h2>Cotizado</h2><article><strong>Tienda Natural Sur</strong><p>120 frascos · Miel 500 g</p><b>$576.000</b></article></section>
      <section class="kanban-column"><h2>Reservado</h2><article><strong>Feria San Carlos</strong><p>80 frascos · Miel 1 kg</p><b>$640.000</b></article></section>
      <section class="kanban-column"><h2>Pagado</h2><article><strong>Restaurant Valle</strong><p>12 baldes · 5 kg</p><b>$360.000</b></article></section>
      <section class="kanban-column"><h2>Entregado</h2><article><strong>Mercado Local</strong><p>48 frascos · Pack degustacion</p><b>$216.000</b></article></section>
    </div>
  `;
}

function renderSettingsModule() {
  return `
    <div class="settings-layout">
      <section class="panel">
        <div class="panel-header"><h2>Operacion</h2><span class="tag ok">Activo</span></div>
        <div class="form-grid">
          <label>Temporada activa<input value="2025/2026" /></label>
          <label>Region principal<input value="Nuble" /></label>
          <label>Unidad comercial<input value="CLP" /></label>
          <label>Modo terreno<select><option>Offline-first</option><option>Solo online</option></select></label>
        </div>
      </section>
      <section class="panel">
        <div class="panel-header"><h2>Usuarios y roles</h2></div>
        <div class="compliance-list">
          <article><strong>Maria Apicultora</strong><span class="tag ok">Admin</span></article>
          <article><strong>Tecnico de campo</strong><span class="tag watch">Inspecciones</span></article>
          <article><strong>Ventas</strong><span class="tag watch">Comercial</span></article>
        </div>
      </section>
      <section class="panel">
        <div class="panel-header"><h2>Recordatorios</h2></div>
        <div class="toggle-list">
          <label><input type="checkbox" checked /> Alertas de tratamientos</label>
          <label><input type="checkbox" checked /> Declaracion SIPEC Octubre</label>
          <label><input type="checkbox" /> Avisos por WhatsApp</label>
          <label><input type="checkbox" checked /> Backup automatico</label>
        </div>
      </div>
      </section>
    </div>
  `;
}

function renderComplianceHub() {
  return `
    <div class="compliance-dashboard">
      <section class="panel compliance-score">
        <span class="pill">Chile / SAG</span>
        <strong>86%</strong>
        <h2>Preparacion documental</h2>
        <p>Perfil, FRADA, SIPEC, tratamientos, bioseguridad y reportes en un solo flujo.</p>
        <button class="primary-button export-action" data-export="paquete-sag-sipec" type="button">Exportar paquete SAG</button>
      </section>
      <section class="panel">
        <div class="panel-header"><h2>Checklist cumplimiento</h2></div>
        <div class="flow-list compact">
          <article class="flow-step done"><b>1</b><div><strong>Perfil Apicultor SAG</strong><small>Datos base completos.</small></div></article>
          <article class="flow-step done"><b>2</b><div><strong>Apiarios FRADA</strong><small>GPS, comuna y actividad.</small></div></article>
          <article class="flow-step active"><b>3</b><div><strong>SIPEC Octubre</strong><small>Borrador listo para revisar.</small></div></article>
          <article class="flow-step"><b>4</b><div><strong>Reportes</strong><small>PDF/Excel para respaldo.</small></div></article>
        </div>
      </section>
    </div>
    <div class="module-grid">
      ${actionCard("Perfil Apicultor SAG", "RUT, registro, contacto, INDAP, certificacion y domicilio.", "sagProfile")}
      ${actionCard("Declaracion SIPEC Octubre", "Flujo anual con apiarios, colmenas, cambios y respaldo.", "sipec")}
      ${actionCard("Reportes PDF/Excel", "FRADA, sanidad, bioseguridad, produccion y trazabilidad.", "reports")}
      ${actionCard("Prioridades de cumplimiento", "Checklist de completitud para vender e implementar.", "priorities")}
    </div>
  `;
}

function renderModules() {
  Object.entries(modules).forEach(([id, module]) => {
    const view = qs(`#${id}`);
    if (!view) return;

    if (module.custom === "field") {
      view.innerHTML = renderFieldHub();
      return;
    }

    if (module.custom === "productionHub") {
      view.innerHTML = renderProductionHub();
      return;
    }

    if (module.custom === "sales") {
      view.innerHTML = renderSalesModule();
      return;
    }

    if (module.custom === "compliance") {
      view.innerHTML = renderComplianceHub();
      return;
    }

    if (module.custom === "settings") {
      view.innerHTML = renderSettingsModule();
      return;
    }

    if (module.custom === "sagProfile") {
      view.innerHTML = renderSagProfileModule();
      return;
    }

    if (module.custom === "sipec") {
      view.innerHTML = renderSipecModule();
      return;
    }

    if (module.custom === "inspections") {
      view.innerHTML = renderInspectionModule();
      return;
    }

    if (module.custom === "traceability") {
      view.innerHTML = renderTraceabilityModule();
      return;
    }

    if (module.custom === "reports") {
      view.innerHTML = renderReportsModule();
      return;
    }

    view.innerHTML = `${renderModuleCards(module.cards)}${renderTable(module.table, module.rows)}`;
  });
}

function switchView(viewId) {
  qsa(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
  qsa(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewId));
  qs("#viewTitle").textContent = viewTitles[viewId] || "Panel Apicola";
  qs("#viewEyebrow").textContent = viewEyebrows[viewId] || "Temporada 2025/2026";
  closeMobileMenu();
}

function closeMobileMenu() {
  const sidebar = qs(".sidebar");
  const menuToggle = qs("#menuToggle");
  const menuText = menuToggle.querySelector(".sr-only");
  sidebar.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
  menuText.textContent = "Abrir menu";
}

function toggleMobileMenu() {
  const sidebar = qs(".sidebar");
  const menuToggle = qs("#menuToggle");
  const menuText = menuToggle.querySelector(".sr-only");
  const isOpen = sidebar.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menu" : "Abrir menu");
  menuText.textContent = isOpen ? "Cerrar menu" : "Abrir menu";
}

function fillModalSelect() {
  qs("#dialogApiary").innerHTML = apiaries.map((apiary) => `<option>${apiary.name}</option>`).join("");
}

function bindEvents() {
  qs("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    unlockApp();
  });

  qs("#demoLoginBtn").addEventListener("click", unlockApp);
  qs("#logoutBtn").addEventListener("click", lockApp);

  qsa(".nav-item").forEach((item) => item.addEventListener("click", () => switchView(item.dataset.view)));
  qsa("[data-view-target]").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.viewTarget)));

  qs("#menuToggle").addEventListener("click", toggleMobileMenu);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });

  qs("#healthFilter").addEventListener("change", renderMap);
  qs("#exportBtn").addEventListener("click", () => showToast("Reporte ejecutivo preparado para descargar"));
  qs("#pilotBtn").addEventListener("click", () => showToast("Propuesta piloto lista para presentar"));
  qs("#newInspectionBtn").addEventListener("click", () => qs("#inspectionDialog").showModal());
  qs("#floatInspectionBtn").addEventListener("click", () => switchView("inspections"));
  qs("#floatVoiceBtn").addEventListener("click", () => {
    switchView("inspections");
    showToast("Nota de voz demo: se completo el checklist sanitario");
  });
  qs("#floatQrBtn").addEventListener("click", () => {
    switchView("hives");
    showToast("QR/NFC detectado: Colmena MZ-024");
  });

  qs("#saveDialogInspection").addEventListener("click", () => {
    inspections.unshift({
      hive: `Colmena ${qs("#dialogHive").value}`,
      apiary: qs("#dialogApiary").value,
      date: "Recien",
      owner: "Maria Apicultora",
      status: "ok",
    });
    renderInspectionsList();
    renderModules();
    showToast("Inspeccion guardada");
  });

  document.addEventListener("click", (event) => {
    if (event.target?.id === "saveInspectionForm") {
      inspections.unshift({
        hive: `Colmena ${qs("#inspectionHive").value}`,
        apiary: qs("#inspectionApiary").value,
        date: "Recien",
        owner: "Maria Apicultora",
        status: "ok",
      });
      renderModules();
      showToast("Inspeccion agregada al historial");
    }

    if (event.target?.id === "copyTraceBtn") {
      navigator.clipboard?.writeText("Lote M2026-001 - 320 kg - El Manzano - Margen $672.000");
      showToast("Ficha publica copiada");
    }

    if (event.target?.classList.contains("export-action")) {
      const exportName = event.target.dataset.export;
      showToast(`Respaldo ${exportName} generado en demo`);
    }

    if (event.target?.id === "startVoiceLog" || event.target?.id === "aiVoiceBtn") {
      showToast("Nota de voz convertida en checklist de inspeccion");
    }

    if (event.target?.id === "scanHiveTag") {
      showToast("QR/NFC detectado: Colmena MZ-024");
    }

    if (event.target?.id === "aiPlanBtn") {
      showToast("Plan semanal generado con prioridades sanitarias");
    }
  });
}

function unlockApp() {
  const email = qs("#loginEmail").value.trim();
  const password = qs("#loginPassword").value.trim();

  if (!email || !password) {
    showToast("Ingresa correo y clave");
    return;
  }

  document.body.classList.remove("locked");
  showToast("Bienvenida a ApiGestor");
}

function lockApp() {
  document.body.classList.add("locked");
  closeMobileMenu();
  showToast("Sesion cerrada");
}

renderModules();
renderMap();
renderInspectionsList();
renderTreatmentsList();
fillModalSelect();
bindEvents();
