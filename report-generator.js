
const DEFAULT_TEMPLATE_CONFIG = {
  companyName: "FMC Industrial",
  companySubtitle: "Servicio tecnico especializado",
  logoMode: "image",
  logoText: "FMC",
  logoImageUrl: "logo.png",
  reportTitle: "REPORTE DE SERVICIO",
  reportRevision: "01",
  footerLegend: "Documento generado automaticamente desde la app de inspecciones.",
  accentColor: "#f28c28",
  headerColor: "#1f1f1f"
};

const DEFAULT_COMPLIANCE_REQUIREMENTS = [
  { category: "Senalizacion y seguridad", items: [
    { id: "capacity-label", name: "Etiqueta de capacidad instalada y visible.", description: "Verificar que el rack cuente con etiqueta indicando capacidad maxima de carga.", recommendation: "Instalar etiqueta de capacidad visible indicando la capacidad maxima permitida del sistema de almacenamiento." },
    { id: "manufacturer-plate", name: "Placa de identificacion del fabricante.", description: "Verificar que exista placa de identificacion con fabricante, modelo o datos del sistema.", recommendation: "Instalar o reponer placa de identificacion del sistema." },
    { id: "marked-aisles", name: "Pasillos correctamente senalizados.", description: "Los pasillos deben estar claramente delimitados para circulacion segura.", recommendation: "Senalizar los pasillos conforme a las condiciones de operacion." },
    { id: "load-signage", name: "Senalizacion de carga maxima.", description: "Verificar que exista senalizacion visible indicando restricciones de carga.", recommendation: "Instalar senalizacion de carga maxima permitida." },
    { id: "impact-protection", name: "Proteccion contra impacto (Esquineros).", description: "Verificar existencia de protectores donde exista riesgo de impacto por montacargas.", recommendation: "Instalar protectores de columna o esquineros." },
    { id: "convex-mirrors", name: "Espejos convexos.", description: "Verificar instalacion en cruces o zonas con poca visibilidad.", recommendation: "Instalar espejos convexos para reducir riesgos de colision." },
    { id: "barriers-stops", name: "Topes o barreras de proteccion cuando sean necesarios.", description: "Verificar existencia de elementos que protejan el rack contra impactos.", recommendation: "Instalar barreras o topes de proteccion." }
  ] },
  { category: "Instalacion", items: [
    { id: "anchors-installed", name: "Anclas instaladas correctamente.", description: "Verificar que todos los bastidores se encuentren correctamente anclados.", recommendation: "Instalar las anclas faltantes." },
    { id: "anchor-torque", name: "Evidencia de torque de anclas.", description: "Confirmar que exista evidencia del torque aplicado durante la instalacion.", recommendation: "Realizar torque conforme a especificaciones del fabricante y documentarlo." },
    { id: "verticality", name: "Verticalidad del sistema.", description: "Verificar que el rack no presente inclinaciones visibles.", recommendation: "Realizar alineacion y nivelacion del sistema." }
  ] },
  { category: "Operacion", items: [
    { id: "no-overload", name: "No existen sobrecargas.", description: "Verificar que no se exceda la capacidad del rack.", recommendation: "Reducir carga conforme a capacidad del fabricante." },
    { id: "no-unauthorized-mods", name: "No existen modificaciones no autorizadas.", description: "Verificar que no existan perforaciones, soldaduras o modificaciones estructurales.", recommendation: "Eliminar modificaciones no autorizadas y evaluar la estructura." }
  ] },
  { category: "Documentacion", items: [
    { id: "maintenance-program", name: "Evidencia de programa de mantenimiento.", description: "Verificar existencia del programa de mantenimiento.", recommendation: "Implementar programa documentado." },
    { id: "preventive-maintenance", name: "Evidencia de mantenimiento preventivo.", description: "Verificar registros de mantenimiento.", recommendation: "Realizar mantenimiento preventivo periodico." },
    { id: "previous-findings-corrected", name: "Evidencia de correccion de hallazgos anteriores.", description: "Verificar registros de acciones correctivas.", recommendation: "Documentar la correccion de todos los hallazgos." },
    { id: "periodic-inspections", name: "Evidencia de inspecciones periodicas.", description: "Verificar historial de inspecciones.", recommendation: "Implementar inspecciones periodicas documentadas." },
    { id: "staff-training", name: "Evidencia de capacitacion del personal.", description: "Verificar que operadores y almacenistas hayan recibido capacitacion.", recommendation: "Capacitar al personal y conservar evidencia documental." }
  ] }
];

const COMPLIANCE_FIRST_PAGE_ROWS = 10;
const COMPLIANCE_CONTINUATION_ROWS = 15;

const REPORT_STYLE = `
  @page { size: Letter; margin: 10mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #111; background: #dfe4e7; }
  .report-shell { width: 216mm; margin: 0 auto; padding: 6mm 0 16mm; counter-reset: page; }
  .page { position: relative; width: 100%; min-height: 277mm; margin-bottom: 6mm; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.12); page-break-after: always; counter-increment: page; }
  .page:last-child { page-break-after: auto; }
  .page-inner { padding: 8mm; }
  .header-table, .meta-table, .summary-table, .findings-table, .equipment-table, .evidence-table { width: 100%; border-collapse: collapse; }
  .header-table td, .meta-table td, .summary-table td, .findings-table td, .findings-table th, .equipment-table td, .equipment-table th, .evidence-table td { border: 1px solid var(--header-color); padding: 2.2mm 2.4mm; vertical-align: top; font-size: 9pt; }
  .header-table { table-layout: fixed; }
  .header-brand { width: 34mm; text-align: center; font-weight: 700; background: #f4f4f4; }
  .brand-mark { display: inline-flex; width: 22mm; height: 22mm; align-items: center; justify-content: center; border: 2px solid var(--accent-color); color: var(--accent-color); font-size: 14pt; font-weight: 700; margin-bottom: 2mm; overflow: hidden; background: white; }
  .brand-mark img { width: 100%; height: 100%; object-fit: contain; }
  .header-title { text-align: center; font-size: 15pt; font-weight: 700; letter-spacing: 0.04em; }
  .header-subtitle { display: block; margin-top: 1mm; font-size: 9pt; font-weight: 400; }
  .header-line-strong { display: block; margin-top: 1.2mm; font-size: 10pt; font-weight: 700; }
  .header-line { display: block; margin-top: 0.8mm; font-size: 8.4pt; font-weight: 400; }
  .label { font-size: 7.4pt; font-weight: 700; text-transform: uppercase; color: #2b2b2b; letter-spacing: 0.03em; }
  .value { font-size: 9pt; line-height: 1.35; white-space: pre-wrap; }
  .section-banner { margin-top: 4mm; margin-bottom: 0; padding: 2mm 3mm; background: #d9d9d9; border: 1px solid var(--header-color); font-size: 10pt; font-weight: 700; text-transform: uppercase; }
  .findings-table th, .equipment-table th { background: #efefef; text-transform: uppercase; font-size: 7.8pt; letter-spacing: 0.03em; text-align: left; }
  .notes-box { min-height: 24mm; }
  .evidence-photo { width: 100%; object-fit: contain; display: block; background: #fff; }
  .evidence-photo.finding-photo { height: 48mm; }
  .evidence-photo.service-photo { height: 31mm; }
  .report-thumb { width: 24mm; max-height: 20mm; object-fit: contain; display: block; border: 1px solid #999; background: #fff; }
  .evidence-label { margin-bottom: 1.2mm; }
  .evidence-topbar { display: flex; justify-content: flex-end; margin-bottom: 2mm; }
  .evidence-meta-box { border: 1px solid var(--header-color); background: #f7f7f7; padding: 2mm 2.4mm; min-width: 48mm; }
  .evidence-meta-box .label { font-size: 7pt; }
  .evidence-meta-box .value { font-size: 8.2pt; }
  .checklist-page-image { width: 100%; height: 238mm; object-fit: contain; border: 1px solid var(--header-color); background: #fff; display: block; }
  .muted { color: #666; font-style: italic; }
  .footer { position: absolute; bottom: 5mm; left: 8mm; right: 8mm; display: flex; justify-content: space-between; font-size: 7.5pt; color: #444; }
  .page-number::after { content: counter(page); }
  .detail-page .page-inner { padding: 12mm 13mm 15mm; }
  .detail-page .section-banner { margin-top: 0; margin-bottom: 3mm; padding: 2.4mm 3mm; }
  .detail-page table { page-break-inside: auto; break-inside: auto; }
  .detail-page tr { page-break-inside: avoid; break-inside: avoid; }
  .detail-page thead { display: table-header-group; }
  .detail-page .value { overflow-wrap: anywhere; }
  .compliance-score-box { display: grid; grid-template-columns: 36mm repeat(4, 1fr); gap: 0; margin-bottom: 4mm; border: 1px solid var(--header-color); }
  .compliance-score-box > div { min-height: 18mm; padding: 2.5mm; border-right: 1px solid var(--header-color); background: #f7f7f7; }
  .compliance-score-box > div:last-child { border-right: 0; }
  .compliance-score-box strong { display: block; margin-top: 1mm; font-size: 13pt; }
  .compliance-bar { height: 3mm; margin-top: 2mm; background: #e7e7e7; border: 1px solid #bbb; }
  .compliance-bar span { display: block; height: 100%; background: var(--accent-color); }
  .compliance-table, .general-findings-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .compliance-table th, .compliance-table td, .general-findings-table th, .general-findings-table td { border: 1px solid var(--header-color); padding: 2.2mm 2.4mm; vertical-align: top; font-size: 8.4pt; line-height: 1.35; overflow-wrap: anywhere; }
  .compliance-table th, .general-findings-table th { background: #efefef; text-transform: uppercase; font-size: 7.5pt; letter-spacing: 0.03em; text-align: left; }
  .compliance-table.compact th, .compliance-table.compact td { padding: 1.65mm 1.9mm; font-size: 7.7pt; line-height: 1.22; }
  .compliance-table.compact th { font-size: 7pt; }
  .status-pill { display: inline-block; padding: 1mm 2mm; border-radius: 999px; font-size: 7.2pt; font-weight: 700; background: #efefef; }
  .status-pill.cumple { background: #e8f6ef; color: #126b3c; }
  .status-pill.no-cumple { background: #fdeaea; color: #9f2424; }
  .status-pill.no-aplica { background: #eeeeee; color: #555; }
  .status-pill.no-verificado { background: #fff4d6; color: #8b5d00; }
  .section-note { margin: 0 0 4mm; padding: 2.5mm 3mm; border: 1px solid #cfcfcf; background: #fafafa; color: #444; font-size: 8.5pt; line-height: 1.35; }
  .introduction-title { margin: 0 0 7mm; padding-bottom: 2.5mm; border-bottom: 2px solid var(--accent-color); font-size: 19pt; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; }
  .introduction-content { margin-top: 6mm; font-size: 10.2pt; line-height: 1.62; color: #222; text-align: justify; }
  .introduction-content p { margin: 0 0 5mm; text-align: justify; }
  @media print {
    body { background: white; }
    .report-shell { width: auto; padding: 0; }
    .page { margin: 0; box-shadow: none; }
  }
`;

async function openReportPdfWindow(inspection, existingPopup) {
  const reportData = await buildReportData(inspection);
  const popup = existingPopup || window.open("", "_blank");

  if (!popup) {
    window.alert("No se pudo abrir la vista del PDF. Revisa si el navegador bloqueo la ventana emergente.");
    return false;
  }

  popup.focus();
  popup.document.open();
  popup.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(reportData.reportNumber)} - Reporte de Servicio</title>
  <style>:root { --accent-color: ${escapeHtml(reportData.template.accentColor)}; --header-color: ${escapeHtml(reportData.template.headerColor)}; } ${REPORT_STYLE}</style>
</head>
<body>
  <div class="report-shell">
    ${renderCoverPage(reportData)}
    ${renderIntroductionPages(reportData)}
    ${renderCompliancePage(reportData)}
    ${renderGeneralFindingsPage(reportData)}
    ${reportData.equipments.map((equipment, index) => renderEquipmentSection(reportData, equipment, index)).join("")}
  </div>
  <script>
    window.addEventListener('load', () => {
      setTimeout(() => window.print(), 250);
    });
  <\/script>
</body>
</html>`);
  popup.document.close();
  return true;
}

async function buildReportData(inspection) {
  const template = getTemplateConfig();
  const introductionText = await loadIntroductionText();
  const equipments = await Promise.all(
    (Array.isArray(inspection.equipments) ? inspection.equipments : []).map((equipment) => buildEquipmentData(equipment))
  );
  const totalFindings = equipments.reduce((sum, equipment) => sum + equipment.findings.length, 0);
  const totalServicePhotos = equipments.reduce((sum, equipment) => sum + equipment.servicePhotos.length, 0);
  const totalFindingPhotos = equipments.reduce((sum, equipment) => sum + equipment.totalFindingPhotos, 0);
  const complianceRows = buildComplianceRows(inspection);
  const complianceSummary = buildComplianceSummary(complianceRows);
  const generalFindings = buildGeneralFindings(inspection, complianceRows);

  return {
    ...inspection,
    reportNumber: inspection.reportFolio || inspection.reportNumber || inspection.config?.reportFolio || "",
    plantName: inspection.plantName || inspection.companyName || inspection.config?.companyName || "",
    plantLocation: inspection.plantLocation || inspection.companyAddress || inspection.config?.companyAddress || inspection.rackArea || inspection.config?.rackArea || "",
    companyAddress: inspection.companyAddress || inspection.config?.companyAddress || "",
    rackArea: inspection.rackArea || inspection.config?.rackArea || "",
    template,
    introductionText,
    equipments,
    complianceRows,
    complianceSummary,
    generalFindings,
    totalFindings,
    totalServicePhotos,
    totalFindingPhotos,
    inspectionDateLabel: formatDate(inspection.inspectionDate || inspection.config?.inspectionDate)
  };
}

async function loadIntroductionText() {
  const introductionFiles = [
    "introduccion.txt",
    "templates/introduccion.txt"
  ];

  for (const filePath of introductionFiles) {
    try {
      const response = await fetch(filePath, { cache: "no-store" });
      if (response.ok) return (await response.text()).trim();
    } catch {
      // Try the next editable introduction file.
    }
  }

  return "";
}

async function buildEquipmentData(equipment) {
  const findings = Array.isArray(equipment.findings) ? equipment.findings : [];
  const servicePhotos = Array.isArray(equipment.servicePhotos) ? equipment.servicePhotos : [];
  const totalFindingPhotos = findings.reduce((sum, finding) => sum + ((finding.photos || []).length), 0);
  const checklistImage = equipment.checklistImage && equipment.checklistImage.dataUrl ? equipment.checklistImage : null;

  return {
    ...equipment,
    findings,
    servicePhotos,
    totalFindingPhotos,
    checklistImage,
    recommendationText: equipment.recommendations && equipment.recommendations.trim()
      ? equipment.recommendations.trim()
      : buildAutomaticRecommendations(findings, equipment.overallCondition),
    summaryText: equipment.serviceSummary && equipment.serviceSummary.trim()
      ? equipment.serviceSummary.trim()
      : buildEquipmentSummary(equipment, findings, totalFindingPhotos, servicePhotos.length),
    nextInspectionLabel: formatDate(equipment.nextInspection)
  };
}

function buildComplianceRows(inspection) {
  if (Array.isArray(inspection.complianceRows)) {
    return inspection.complianceRows.map(normalizeComplianceRow);
  }

  const requirements = Array.isArray(inspection.complianceRequirements)
    ? inspection.complianceRequirements
    : DEFAULT_COMPLIANCE_REQUIREMENTS;
  const details = inspection.complianceDetails || {};
  const rows = requirements.flatMap((group) => {
    const items = Array.isArray(group.items) ? group.items : [];
    return items.map((item) => normalizeComplianceRow({
      ...item,
      category: group.category || item.category || "",
      ...(details[item.id] || {})
    }));
  });

  if (rows.length) return rows;

  if (inspection.complianceDetails && typeof inspection.complianceDetails === "object") {
    return Object.entries(inspection.complianceDetails).map(([id, detail]) => normalizeComplianceRow({
      id,
      ...detail
    }));
  }

  return [];
}

function normalizeComplianceRow(row) {
  const status = normalizeComplianceStatus(row.status || row.estado || "no-verificado");
  return {
    id: row.id || "",
    category: row.category || row.categoria || "",
    requirement: row.requirement || row.name || row.requisito || row.title || row.id || "Requisito",
    status,
    observations: row.observations || row.observaciones || row.notes || "",
    recommendation: row.recommendation || row.recomendacion || "",
    photo: row.photo || row.evidencePhoto || row.evidencia || ""
  };
}

function buildComplianceSummary(rows) {
  const counts = {
    cumple: 0,
    "no-cumple": 0,
    "no-aplica": 0,
    "no-verificado": 0
  };

  rows.forEach((row) => {
    const status = normalizeComplianceStatus(row.status);
    counts[status] = (counts[status] || 0) + 1;
  });

  const applicable = counts.cumple + counts["no-cumple"];
  const percentage = applicable ? Math.round((counts.cumple / applicable) * 100) : 0;

  return { counts, percentage };
}

function buildGeneralFindings(inspection, complianceRows) {
  const explicitFindings = Array.isArray(inspection.generalFindings)
    ? inspection.generalFindings.map((finding) => ({
      title: finding.title || finding.requirement || finding.name || "Hallazgo",
      category: finding.category || "",
      observations: finding.observations || finding.description || "",
      recommendation: finding.recommendation || "",
      photo: finding.photo || finding.evidencePhoto || ""
    }))
    : [];

  const complianceFindings = complianceRows
    .filter((row) => normalizeComplianceStatus(row.status) === "no-cumple")
    .map((row) => ({
      title: row.requirement,
      category: row.category,
      observations: row.observations,
      recommendation: row.recommendation,
      photo: row.photo
    }));

  return [...explicitFindings, ...complianceFindings];
}

function normalizeComplianceStatus(status) {
  const normalized = String(status || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, "-")
    .trim();

  if (["cumple", "ok", "si", "yes"].includes(normalized)) return "cumple";
  if (["no-cumple", "no cumple", "incumple", "fail", "failed"].includes(normalized)) return "no-cumple";
  if (["no-aplica", "no aplica", "na", "n/a"].includes(normalized)) return "no-aplica";
  return "no-verificado";
}

function formatComplianceStatus(status) {
  const normalized = normalizeComplianceStatus(status);
  if (normalized === "cumple") return "Cumple";
  if (normalized === "no-cumple") return "No cumple";
  if (normalized === "no-aplica") return "No aplica";
  return "No verificado";
}

function getTemplateConfig() {
  const custom = window.REPORT_TEMPLATE_CONFIG || {};
  const merged = { ...DEFAULT_TEMPLATE_CONFIG, ...custom };
  if (merged.logoImageUrl) {
    try {
      merged.logoImageUrl = new URL(merged.logoImageUrl, window.location.href).href;
    } catch (error) {
      merged.logoImageUrl = custom.logoImageUrl || "";
    }
  }
  return merged;
}

function renderCoverPage(report) {
  return `
    <section class="page">
      <div class="page-inner">
        ${renderHeader(report)}
        <div class="section-banner">Datos generales del servicio</div>
        <table class="meta-table">
          <tr>
            <td><div class="label">Cliente / Planta</div><div class="value">${escapeHtml(report.plantName || "No capturado")}</div></td>
            <td><div class="label">Direccion / Ubicacion</div><div class="value">${escapeHtml(report.plantLocation || "No capturado")}</div></td>
          </tr>
          <tr>
            <td><div class="label">Area inspeccionada</div><div class="value">${escapeHtml(report.rackArea || "No capturada")}</div></td>
            <td><div class="label">Fecha de inspeccion</div><div class="value">${escapeHtml(report.inspectionDateLabel || "No capturada")}</div></td>
          </tr>
          <tr>
            <td><div class="label">Reporte elaborado por</div><div class="value">${escapeHtml(report.technicianName || "No capturado")}</div></td>
            <td><div class="label">Tipo de servicio</div><div class="value">${escapeHtml(report.serviceType || "No capturado")}</div></td>
          </tr>
        </table>

        <div class="section-banner">Resumen general del reporte</div>
        <table class="summary-table">
          <tr>
            <td class="notes-box"><div class="label">Equipos incluidos</div><div class="value">${escapeHtml(report.equipments.map((equipment, index) => `${index + 1}. ${equipment.equipmentName || equipment.craneType || "Equipo"}`).join("\n") || "Sin equipos registrados")}</div></td>
          </tr>
        </table>
      </div>
      <div class="footer">
        <span>${escapeHtml(report.template.footerLegend)}</span>
        <span>Pagina <span class="page-number"></span></span>
      </div>
    </section>
  `;
}

function renderIntroductionPages(report) {
  const pages = splitIntroductionText(report.introductionText || "");

  if (!pages.length) {
    pages.push(["No se encontro contenido en introduccion.txt."]);
  }

  return pages.map((paragraphs, index) => `
    <section class="page detail-page introduction-page">
      <div class="page-inner">
        ${renderHeader(report)}
        <h1 class="introduction-title">INTRODUCCIÓN${index > 0 ? " - CONTINUACIÓN" : ""}</h1>
        <div class="introduction-content">
          ${paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        </div>
      </div>
      <div class="footer">
        <span>${escapeHtml(report.reportNumber || "Sin folio")} | Introduccion</span>
        <span>Pagina <span class="page-number"></span></span>
      </div>
    </section>
  `).join("");
}

function splitIntroductionText(text) {
  const maxCharactersPerPage = 3200;
  const paragraphs = String(text || "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const pages = [];
  let currentPage = [];
  let currentLength = 0;

  paragraphs.forEach((paragraph) => {
    if (paragraph.length > maxCharactersPerPage) {
      const chunks = splitLongParagraph(paragraph, maxCharactersPerPage);
      chunks.forEach((chunk) => {
        if (currentPage.length) {
          pages.push(currentPage);
          currentPage = [];
          currentLength = 0;
        }
        pages.push([chunk]);
      });
      return;
    }

    const nextLength = currentLength + paragraph.length;
    if (currentPage.length && nextLength > maxCharactersPerPage) {
      pages.push(currentPage);
      currentPage = [];
      currentLength = 0;
    }

    currentPage.push(paragraph);
    currentLength += paragraph.length;
  });

  if (currentPage.length) pages.push(currentPage);
  return pages;
}

function splitLongParagraph(paragraph, maxCharacters) {
  const words = paragraph.split(/\s+/);
  const chunks = [];
  let chunk = "";

  words.forEach((word) => {
    const nextChunk = chunk ? `${chunk} ${word}` : word;
    if (nextChunk.length > maxCharacters && chunk) {
      chunks.push(chunk);
      chunk = word;
      return;
    }
    chunk = nextChunk;
  });

  if (chunk) chunks.push(chunk);
  return chunks;
}

function renderCompliancePage(report) {
  const rows = report.complianceRows || [];
  const summary = report.complianceSummary || buildComplianceSummary(rows);
  const firstRows = rows.slice(0, COMPLIANCE_FIRST_PAGE_ROWS);
  const remainingRows = rows.slice(COMPLIANCE_FIRST_PAGE_ROWS);
  const continuationPages = [];

  for (let index = 0; index < remainingRows.length; index += COMPLIANCE_CONTINUATION_ROWS) {
    continuationPages.push(renderComplianceContinuationPage(
      report,
      remainingRows.slice(index, index + COMPLIANCE_CONTINUATION_ROWS),
      continuationPages.length + 1
    ));
  }

  return `
    <section class="page detail-page">
      <div class="page-inner">
        <div class="section-banner">EVALUACION GENERAL DE CUMPLIMIENTO NORMATIVO</div>
        <p class="section-note">Evaluacion general del sistema de racks basada en los criterios capturados durante la inspeccion. Esta seccion inicia en pagina independiente para facilitar revision, archivo y seguimiento.</p>
        <div class="compliance-score-box">
          <div>
            <div class="label">Cumplimiento general</div>
            <strong>${summary.percentage}%</strong>
            <div class="compliance-bar"><span style="width:${summary.percentage}%"></span></div>
          </div>
          <div><div class="label">Cumple</div><strong>${summary.counts.cumple}</strong></div>
          <div><div class="label">No cumple</div><strong>${summary.counts["no-cumple"]}</strong></div>
          <div><div class="label">No aplica</div><strong>${summary.counts["no-aplica"]}</strong></div>
          <div><div class="label">No verificado</div><strong>${summary.counts["no-verificado"]}</strong></div>
        </div>
        ${firstRows.length ? renderComplianceTable(firstRows, true) : `<table class="compliance-table"><tr><td><span class="muted">No se capturo informacion de cumplimiento normativo.</span></td></tr></table>`}
      </div>
      <div class="footer">
        <span>${escapeHtml(report.reportNumber || "Sin folio")} | Cumplimiento normativo</span>
        <span>Pagina <span class="page-number"></span></span>
      </div>
    </section>
    ${continuationPages.join("")}
  `;
}

function renderComplianceContinuationPage(report, rows, pageIndex) {
  return `
    <section class="page detail-page">
      <div class="page-inner">
        <div class="section-banner">EVALUACION GENERAL DE CUMPLIMIENTO NORMATIVO - CONTINUACION ${pageIndex}</div>
        ${renderComplianceTable(rows, true)}
      </div>
      <div class="footer">
        <span>${escapeHtml(report.reportNumber || "Sin folio")} | Cumplimiento normativo</span>
        <span>Pagina <span class="page-number"></span></span>
      </div>
    </section>
  `;
}

function renderComplianceTable(rows, compact = false) {
  return `
    <table class="compliance-table ${compact ? "compact" : ""}">
      <thead>
        <tr>
          <th width="30%">Requisito</th>
          <th width="14%">Estado</th>
          <th width="28%">Observaciones</th>
          <th width="28%">Recomendacion</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((row) => `
          <tr>
            <td><strong>${escapeHtml(row.requirement || row.name || "Requisito")}</strong>${row.category ? `<div class="muted">${escapeHtml(row.category)}</div>` : ""}</td>
            <td><span class="status-pill ${escapeHtml(normalizeComplianceStatus(row.status))}">${escapeHtml(formatComplianceStatus(row.status))}</span></td>
            <td>${escapeHtml(row.observations || "Sin observaciones.")}</td>
            <td>${escapeHtml(row.recommendation || (normalizeComplianceStatus(row.status) === "no-cumple" ? "Sin recomendacion registrada." : "No aplica."))}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderGeneralFindingsPage(report) {
  const findings = report.generalFindings || [];

  return `
    <section class="page detail-page">
      <div class="page-inner">
        <div class="section-banner">HALLAZGOS GENERALES</div>
        <p class="section-note">Hallazgos generales detectados durante la evaluacion del sistema. Los requisitos marcados como no cumple se listan automaticamente para seguimiento.</p>
        ${findings.length ? `
          <table class="general-findings-table">
            <thead>
              <tr>
                <th width="26%">Hallazgo</th>
                <th width="28%">Observaciones</th>
                <th width="34%">Recomendacion</th>
                <th width="12%">Evidencia</th>
              </tr>
            </thead>
            <tbody>
              ${findings.map((finding) => `
                <tr>
                  <td><strong>${escapeHtml(finding.title || finding.requirement || "Hallazgo")}</strong>${finding.category ? `<div class="muted">${escapeHtml(finding.category)}</div>` : ""}</td>
                  <td>${escapeHtml(finding.observations || finding.description || "Sin observaciones.")}</td>
                  <td>${escapeHtml(finding.recommendation || "Sin recomendacion registrada.")}</td>
                  <td>${finding.photo ? `<img class="report-thumb" src="${finding.photo}" alt="Evidencia">` : "Sin foto"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : `<table class="general-findings-table"><tr><td><span class="muted">No se registraron hallazgos generales.</span></td></tr></table>`}
      </div>
      <div class="footer">
        <span>${escapeHtml(report.reportNumber || "Sin folio")} | Hallazgos generales</span>
        <span>Pagina <span class="page-number"></span></span>
      </div>
    </section>
  `;
}

function renderEquipmentPage(report, equipment, index) {
  return `
    <section class="page">
      <div class="page-inner">
        <div class="section-banner">Equipo ${index + 1}</div>
        <table class="equipment-table">
          <tr>
            <th>Nombre o tag</th>
            <th>Tipo de grua</th>
            <th>Capacidad nominal</th>
          </tr>
          <tr>
            <td>${escapeHtml(equipment.equipmentName || "No capturado")}</td>
            <td>${escapeHtml(equipment.craneType || "No capturado")}</td>
            <td>${escapeHtml(equipment.ratedCapacity || "No capturado")}</td>
          </tr>
          <tr>
            <th>Serie / Identificacion</th>
            <th>Folio checklist</th>
            <th>Ubicacion puntual</th>
          </tr>
          <tr>
            <td>${escapeHtml(equipment.serialNumber || "No capturado")}</td>
            <td>${escapeHtml(equipment.checklistFolio || "No capturado")}</td>
            <td>${escapeHtml(equipment.equipmentLocation || "No capturado")}</td>
          </tr>
          <tr>
            <th colspan="3">Condicion general</th>
          </tr>
          <tr>
            <td colspan="3">${escapeHtml(equipment.overallCondition || "No capturado")}</td>
          </tr>
        </table>

        <div class="section-banner">Datos del polipasto</div>
        <table class="equipment-table">
          <tr>
            <th>Tipo</th>
            <th>Capacidad</th>
            <th>Fabricante</th>
            <th>Modelo</th>
            <th>Serie</th>
          </tr>
          <tr>
            <td>${escapeHtml(equipment.hoistType || "No capturado")}</td>
            <td>${escapeHtml(equipment.hoistCapacity || "No capturado")}</td>
            <td>${escapeHtml(equipment.hoistManufacturer || "No capturado")}</td>
            <td>${escapeHtml(equipment.hoistModel || "No capturado")}</td>
            <td>${escapeHtml(equipment.hoistSerialNumber || "No capturado")}</td>
          </tr>
          <tr>
            <th>Voltaje</th>
            <th colspan="4"></th>
          </tr>
          <tr>
            <td>${escapeHtml(equipment.hoistVoltage || "No capturado")}</td>
            <td colspan="4"></td>
          </tr>
        </table>

        <div class="section-banner">Resumen del equipo</div>
        <table class="summary-table">
          <tr>
            <td><div class="label">Hallazgos</div><div class="value">${equipment.findings.length}</div></td>
            <td><div class="label">Fotos de servicio</div><div class="value">${equipment.servicePhotos.length}</div></td>
            <td><div class="label">Fotos de hallazgos</div><div class="value">${equipment.totalFindingPhotos}</div></td>
            <td><div class="label">Proxima inspeccion</div><div class="value">${escapeHtml(equipment.nextInspectionLabel || "No especificada")}</div></td>
          </tr>
          <tr>
            <td colspan="4" class="notes-box"><div class="label">Resumen del servicio</div><div class="value">${escapeHtml(equipment.summaryText)}</div></td>
          </tr>
          <tr>
            <td colspan="4" class="notes-box"><div class="label">Recomendaciones</div><div class="value">${escapeHtml(equipment.recommendationText)}</div></td>
          </tr>
        </table>
      </div>
      <div class="footer">
        <span>${escapeHtml(report.reportNumber || "Sin folio")} | Equipo ${index + 1}</span>
        <span>Pagina <span class="page-number"></span></span>
      </div>
    </section>
  `;
}
function renderEquipmentSection(report, equipment, index) {
  const findingEvidencePages = equipment.findings.map((finding, findingIndex) => renderEvidencePage(
    report,
    equipment,
    index,
    `Evidencias de los hallazgos ${findingIndex + 1}`,
    Array.isArray(finding.photos) ? finding.photos : [],
    `${equipment.equipmentName || `Equipo ${index + 1}`} | ${finding.category || "Hallazgo"}`,
    finding,
    "finding"
  )).join("");

  const serviceEvidencePage = renderServiceEvidencePages(
    report,
    equipment,
    index,
    equipment.servicePhotos
  );

  const checklistPages = renderChecklistPdfPages(
    report,
    equipment,
    index,
    equipment.checklistImage
  );

  return `
    ${renderEquipmentPage(report, equipment, index)}
    ${findingEvidencePages}
    ${checklistPages}
    ${serviceEvidencePage}
  `;
}
function renderHeader(report) {
  return `
    <table class="header-table">
      <tr>
        <td class="header-brand">
          <div class="brand-mark">${renderLogo(report.template)}</div>
          <div class="label">${escapeHtml(report.template.companySubtitle)}</div>
        </td>
        <td class="header-title">
          ${escapeHtml(report.template.reportTitle)} ${escapeHtml(report.reportNumber || "Sin folio")}
          <span class="header-line-strong">Mantenimiento Preventivo a Gruas</span>
          <span class="header-line-strong">SUMINISTROS BAJA NORTE FMC S. DE R.L de C.V</span>
          <span class="header-line">Av. Ingeniero Juan Ojeda Robles 14990 Int. 9 Col. Guadalupe Victoria, Tijuana, B.C</span>
          <span class="header-line">Fecha del reporte: ${escapeHtml(report.inspectionDateLabel || "No capturada")}</span>
        </td>
      </tr>
    </table>
  `;
}

function renderLogo(template) {
  if (template.logoMode === "image" && template.logoImageUrl) {
    return `<img src="${template.logoImageUrl}" alt="Logotipo">`;
  }
  return escapeHtml(template.logoText || "SB");
}

function renderFindingsTable(findings) {
  if (!findings.length) {
    return `<table class="findings-table"><tr><td><span class="muted">No se registraron hallazgos para este equipo.</span></td></tr></table>`;
  }

  return `
    <table class="findings-table">
      <thead>
        <tr>
          <th width="6%">No.</th>
          <th width="16%">Categoria</th>
          <th width="24%">Incidencia</th>
          <th width="42%">Descripcion</th>
          <th width="12%">Fotos</th>
        </tr>
      </thead>
      <tbody>
        ${findings.map((finding, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(finding.category || "")}</td>
            <td>${escapeHtml(finding.incidence || "")}</td>
            <td>${escapeHtml(finding.description || "")}</td>
            <td>${(finding.photos || []).length}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderServiceEvidencePages(report, equipment, equipmentIndex, photos) {
  if (!photos.length) {
    return renderEvidencePage(
      report,
      equipment,
      equipmentIndex,
      "Evidencia del servicio",
      [],
      `${equipment.equipmentName || `Equipo ${equipmentIndex + 1}`} | Servicio`,
      null,
      "service"
    );
  }

  const pages = [];
  for (let index = 0; index < photos.length; index += 9) {
    const chunk = photos.slice(index, index + 9);
    pages.push(renderEvidencePage(
      report,
      equipment,
      equipmentIndex,
      "Evidencia del servicio",
      chunk,
      `${equipment.equipmentName || `Equipo ${equipmentIndex + 1}`} | Servicio`,
      null,
      "service"
    ));
  }
  return pages.join("");
}

function renderEvidencePage(report, equipment, equipmentIndex, title, photos, subtitle, finding, layout) {
  return `
    <section class="page">
      <div class="page-inner">
        <div class="evidence-topbar">
          <div class="evidence-meta-box">
            <div class="label">Folio checklist</div>
            <div class="value">${escapeHtml(equipment.checklistFolio || "No capturado")}</div>
            <div class="label">Fecha</div>
            <div class="value">${escapeHtml(report.inspectionDateLabel || "No capturada")}</div>
          </div>
        </div>
        <div class="section-banner">${escapeHtml(title)}</div>
        <table class="meta-table">
          <tr>
            <td width="25%"><div class="label">Equipo</div><div class="value">${escapeHtml(equipment.equipmentName || `Equipo ${equipmentIndex + 1}`)}</div></td>
            <td width="25%"><div class="label">Tipo</div><div class="value">${escapeHtml(equipment.craneType || "No capturado")}</div></td>
            <td width="50%"><div class="label">Detalle</div><div class="value">${escapeHtml(subtitle || "Sin detalle")}</div></td>
          </tr>
          ${finding ? `<tr><td><div class="label">Categoria</div><div class="value">${escapeHtml(finding.category || "")}</div></td><td><div class="label">Incidencia</div><div class="value">${escapeHtml(finding.incidence || "")}</div></td><td><div class="label">Descripcion</div><div class="value">${escapeHtml(finding.description || "")}</div></td></tr>` : ""}
          ${finding ? `<tr><td colspan="3"><div class="label">Recomendacion</div><div class="value">${escapeHtml(finding.recommendation || "Sin recomendacion registrada")}</div></td></tr>` : ""}
        </table>
        ${renderEvidenceTable(photos, layout || "finding")}
      </div>
      <div class="footer">
        <span>${escapeHtml(report.reportNumber || "Sin folio")} | ${escapeHtml(equipment.equipmentName || `Equipo ${equipmentIndex + 1}`)}</span>
        <span>Pagina <span class="page-number"></span></span>
      </div>
    </section>
  `;
}

function renderChecklistPdfPages(report, equipment, equipmentIndex, checklistImage) {
  if (!checklistImage || !checklistImage.dataUrl) {
    return "";
  }

  return `
    <section class="page">
      <div class="page-inner">
        <div class="section-banner">Checklist escaneado</div>
        <table class="meta-table">
          <tr>
            <td width="35%"><div class="label">Equipo</div><div class="value">${escapeHtml(equipment.equipmentName || `Equipo ${equipmentIndex + 1}`)}</div></td>
            <td width="30%"><div class="label">Folio checklist</div><div class="value">${escapeHtml(equipment.checklistFolio || "No capturado")}</div></td>
            <td width="35%"><div class="label">Archivo</div><div class="value">${escapeHtml(checklistImage.name || "checklist.jpg")}</div></td>
          </tr>
        </table>
        <img class="checklist-page-image" src="${checklistImage.dataUrl}" alt="Checklist escaneado">
      </div>
      <div class="footer">
        <span>${escapeHtml(report.reportNumber || "Sin folio")} | ${escapeHtml(equipment.equipmentName || `Equipo ${equipmentIndex + 1}`)}</span>
        <span>Pagina <span class="page-number"></span></span>
      </div>
    </section>
  `;
}

function renderEvidenceTable(photos, layout) {
  if (!photos.length) {
    return `<table class="evidence-table"><tr><td><span class="muted">No se adjuntaron fotografias para esta seccion.</span></td></tr></table>`;
  }

  const columns = layout === "service" ? 3 : 2;
  const photoClass = layout === "service" ? "service-photo" : "finding-photo";
  const rows = [];
  for (let index = 0; index < photos.length; index += columns) {
    rows.push(photos.slice(index, index + columns));
  }

  return `
    <table class="evidence-table">
      ${rows.map((row, rowIndex) => `
        <tr>
          ${row.map((photo, photoIndex) => `
            <td width="${100 / columns}%">
              <div class="label evidence-label">Evidencia ${photoIndex + 1 + rowIndex * columns}</div>
              <img class="evidence-photo ${photoClass}" src="${photo}" alt="Evidencia fotografica">
            </td>
          `).join("")}
          ${Array.from({ length: columns - row.length }).map(() => `<td width="${100 / columns}%"></td>`).join("")}
        </tr>
      `).join("")}
    </table>
  `;
}

function buildEquipmentSummary(equipment, findings, totalFindingPhotos, servicePhotoCount) {
  const findingText = findings.length ? `${findings.length} hallazgo(s)` : "sin hallazgos registrados";
  return `Se capturo el equipo ${equipment.equipmentName || equipment.craneType || "sin nombre"} con condicion general ${equipment.overallCondition || "pendiente"}. Se registraron ${findingText}, ${servicePhotoCount} fotografia(s) generales de servicio y ${totalFindingPhotos} fotografia(s) asociadas a hallazgos.`;
}

function buildAutomaticRecommendations(findings, overallCondition) {
  if (!findings.length) {
    return `Mantener el programa de inspeccion vigente y repetir la evaluacion de acuerdo con la frecuencia recomendada. Condicion general registrada: ${overallCondition || "pendiente"}.`;
  }

  const grouped = summarizeByCategory(findings)
    .map((item) => `Atender observaciones de ${item.category.toLowerCase()} (${item.count}).`)
    .join(" ");

  return `${grouped} Verificar el cierre de acciones correctivas antes de la siguiente inspeccion. Condicion general registrada: ${overallCondition || "pendiente"}.`;
}

function summarizeByCategory(findings) {
  const counts = new Map();
  findings.forEach((finding) => {
    const category = finding.category || "Sin categoria";
    counts.set(category, (counts.get(category) || 0) + 1);
  });
  return Array.from(counts.entries()).map(([category, count]) => ({ category, count }));
}

function formatDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value + (value.length <= 10 ? "T12:00:00" : ""));
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("es-MX", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

window.openReportPdfWindow = openReportPdfWindow;
