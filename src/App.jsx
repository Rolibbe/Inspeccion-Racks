import { useEffect, useMemo, useState } from 'react';
import introductionFallbackText from '../introduccion.txt?raw';

const rackTypes = [
  'Selectivo',
  'Drive-in',
  'Push-back',
  'Cantilever',
  'Dinamico',
  'Otro',
];

const damageLevels = [
  { value: 'none', label: 'Sin dano' },
  { value: 'leve', label: 'Leve' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'grave', label: 'Grave' },
  { value: 'critico', label: 'Critico' },
];

const complianceStatuses = [
  { value: 'cumple', label: 'Cumple' },
  { value: 'no-cumple', label: 'No cumple' },
];

const complianceRequirements = [
  {
    category: 'Senalizacion y seguridad',
    icon: 'S',
    items: [
      {
        id: 'capacity-label',
        name: 'Etiqueta de capacidad instalada y visible.',
        description: 'Verificar que el rack cuente con etiqueta indicando capacidad maxima de carga.',
        recommendation: 'Instalar etiqueta de capacidad visible indicando la capacidad maxima permitida del sistema de almacenamiento.',
      },
      {
        id: 'manufacturer-plate',
        name: 'Placa de identificacion del fabricante.',
        description: 'Verificar que exista placa de identificacion con fabricante, modelo o datos del sistema.',
        recommendation: 'Instalar o reponer placa de identificacion del sistema.',
      },
      {
        id: 'marked-aisles',
        name: 'Pasillos correctamente senalizados.',
        description: 'Los pasillos deben estar claramente delimitados para circulacion segura.',
        recommendation: 'Senalizar los pasillos conforme a las condiciones de operacion.',
      },
      {
        id: 'load-signage',
        name: 'Senalizacion de carga maxima.',
        description: 'Verificar que exista senalizacion visible indicando restricciones de carga.',
        recommendation: 'Instalar senalizacion de carga maxima permitida.',
      },
      {
        id: 'impact-protection',
        name: 'Proteccion contra impacto (Esquineros).',
        description: 'Verificar existencia de protectores donde exista riesgo de impacto por montacargas.',
        recommendation: 'Instalar protectores de columna o esquineros.',
      },
      {
        id: 'convex-mirrors',
        name: 'Espejos convexos.',
        description: 'Verificar instalacion en cruces o zonas con poca visibilidad.',
        recommendation: 'Instalar espejos convexos para reducir riesgos de colision.',
      },
      {
        id: 'barriers-stops',
        name: 'Topes o barreras de proteccion cuando sean necesarios.',
        description: 'Verificar existencia de elementos que protejan el rack contra impactos.',
        recommendation: 'Instalar barreras o topes de proteccion.',
      },
    ],
  },
  {
    category: 'Instalacion',
    icon: 'I',
    items: [
      {
        id: 'anchors-installed',
        name: 'Anclas instaladas correctamente.',
        description: 'Verificar que todos los bastidores se encuentren correctamente anclados.',
        recommendation: 'Instalar las anclas faltantes.',
      },
      {
        id: 'anchor-torque',
        name: 'Evidencia de torque de anclas.',
        description: 'Confirmar que exista evidencia del torque aplicado durante la instalacion.',
        recommendation: 'Realizar torque conforme a especificaciones del fabricante y documentarlo.',
      },
      {
        id: 'verticality',
        name: 'Verticalidad del sistema.',
        description: 'Verificar que el rack no presente inclinaciones visibles.',
        recommendation: 'Realizar alineacion y nivelacion del sistema.',
      },
    ],
  },
  {
    category: 'Operacion',
    icon: 'O',
    items: [
      {
        id: 'no-overload',
        name: 'No existen sobrecargas.',
        description: 'Verificar que no se exceda la capacidad del rack.',
        recommendation: 'Reducir carga conforme a capacidad del fabricante.',
      },
      {
        id: 'no-unauthorized-mods',
        name: 'No existen modificaciones no autorizadas.',
        description: 'Verificar que no existan perforaciones, soldaduras o modificaciones estructurales.',
        recommendation: 'Eliminar modificaciones no autorizadas y evaluar la estructura.',
      },
    ],
  },
  {
    category: 'Documentacion',
    icon: 'D',
    items: [
      {
        id: 'maintenance-program',
        name: 'Evidencia de programa de mantenimiento.',
        description: 'Verificar existencia del programa de mantenimiento.',
        recommendation: 'Implementar programa documentado.',
      },
      {
        id: 'preventive-maintenance',
        name: 'Evidencia de mantenimiento preventivo.',
        description: 'Verificar registros de mantenimiento.',
        recommendation: 'Realizar mantenimiento preventivo periodico.',
      },
      {
        id: 'previous-findings-corrected',
        name: 'Evidencia de correccion de hallazgos anteriores.',
        description: 'Verificar registros de acciones correctivas.',
        recommendation: 'Documentar la correccion de todos los hallazgos.',
      },
      {
        id: 'periodic-inspections',
        name: 'Evidencia de inspecciones periodicas.',
        description: 'Verificar historial de inspecciones.',
        recommendation: 'Implementar inspecciones periodicas documentadas.',
      },
      {
        id: 'staff-training',
        name: 'Evidencia de capacitacion del personal.',
        description: 'Verificar que operadores y almacenistas hayan recibido capacitacion.',
        recommendation: 'Capacitar al personal y conservar evidencia documental.',
      },
    ],
  },
];

const complianceRequirementMap = complianceRequirements
  .flatMap((group) => group.items.map((item) => ({ ...item, category: group.category })))
  .reduce((items, item) => ({ ...items, [item.id]: item }), {});

const initialForm = {
  companyName: '',
  companyAddress: '',
  rackArea: '',
  rackNumber: '',
  reportFolio: '',
  inspectionDate: '',
  rackType: '',
  bays: 4,
  levels: 3,
  observations: '',
};

function createBayLevels(bays, levels) {
  return Array.from({ length: Math.max(1, Number(bays)) }, (_, index) => [
    String(index + 1),
    Math.max(1, Number(levels)),
  ]).reduce((levelsByBay, [bay, bayLevels]) => ({
    ...levelsByBay,
    [bay]: bayLevels,
  }), {});
}

function normalizeBayLevels(config, bayLevels) {
  if (!config) return {};

  return Array.from({ length: config.bays }, (_, index) => index + 1).reduce((levelsByBay, bay) => ({
    ...levelsByBay,
    [bay]: Math.max(1, Number(bayLevels?.[bay] || config.levels || 1)),
  }), {});
}

function detailHasData(detail) {
  return Boolean(
    detail?.finding ||
    detail?.photo ||
    detail?.status === 'free' ||
    (detail?.damageLevel && detail.damageLevel !== 'none')
  );
}

function formatPositionName(config, position) {
  const rack = String(config?.rackNumber || '01').trim().padStart(2, '0');
  const bay = String(position.bay).padStart(3, '0');
  const level = String(position.level).padStart(2, '0');
  return `${rack}-${bay}-${level}`;
}

function formatDisplayDate(value) {
  if (!value) return new Date().toLocaleDateString('es-MX');

  const [year, month, day] = String(value).split('-').map(Number);
  if (!year || !month || !day) return String(value);

  return new Date(year, month - 1, day).toLocaleDateString('es-MX');
}

function normalizeIntroductionText(text) {
  return String(text || '')
    .trim()
    .replace(/^"([\s\S]*)"$/, '$1')
    .trim();
}

function splitIntroductionParagraphs(text) {
  return normalizeIntroductionText(text)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function calculateComplianceSummary(details = {}) {
  const counts = {
    cumple: 0,
    'no-cumple': 0,
    'no-aplica': 0,
    'no-verificado': 0,
  };

  complianceRequirements.forEach((group) => {
    group.items.forEach((item) => {
      const status = details[item.id]?.status || 'no-verificado';
      counts[status] = (counts[status] || 0) + 1;
    });
  });

  const applicable = counts.cumple + counts['no-cumple'];
  const percentage = applicable > 0 ? Math.round((counts.cumple / applicable) * 100) : 0;
  const tone = percentage >= 80 ? 'good' : percentage >= 60 ? 'warning' : 'danger';

  return {
    counts,
    percentage,
    tone,
    total: complianceRequirements.reduce((sum, group) => sum + group.items.length, 0),
  };
}

const storageKey = 'fmcRackInspections.v1';
const legacyStorageKey = 'fmcRackInspection.current';

function createInspectionId() {
  return `inspection-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadSavedInspections() {
  try {
    const savedInspections = localStorage.getItem(storageKey);
    if (savedInspections) {
      return JSON.parse(savedInspections).map((inspection) => ({
        ...inspection,
        rackConfig: inspection.rackConfig || inspection.config || null,
      }));
    }

    const legacyInspection = localStorage.getItem(legacyStorageKey);
    if (!legacyInspection) return [];

    const parsedInspection = JSON.parse(legacyInspection);

    return [{
      ...parsedInspection,
      id: createInspectionId(),
      rackConfig: parsedInspection.rackConfig || parsedInspection.config || null,
      updatedAt: parsedInspection.savedAt || new Date().toISOString(),
    }];
  } catch {
    return [];
  }
}

function hasFormData(form) {
  return Object.entries(form).some(([key, value]) => value !== initialForm[key]);
}

function App() {
  const initialSavedInspections = useMemo(loadSavedInspections, []);
  const [savedInspections, setSavedInspections] = useState(initialSavedInspections);
  const [activeInspectionId, setActiveInspectionId] = useState(null);
  const [isSavedPanelOpen, setIsSavedPanelOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [screen, setScreen] = useState('home');
  const [form, setForm] = useState(initialForm);
  const [rackConfig, setRackConfig] = useState(null);
  const [bayLevels, setBayLevels] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [cellDetails, setCellDetails] = useState({});
  const [complianceDetails, setComplianceDetails] = useState({});
  const [introductionText, setIntroductionText] = useState(introductionFallbackText);

  const hasActiveWork = Boolean(
    rackConfig || Object.keys(cellDetails).length > 0 || Object.keys(complianceDetails).length > 0 || hasFormData(form)
  );

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(savedInspections));
  }, [savedInspections]);

  useEffect(() => {
    fetch('/introduccion.txt', { cache: 'no-store' })
      .then((response) => (response.ok ? response.text() : introductionFallbackText))
      .then((text) => setIntroductionText(text || introductionFallbackText))
      .catch(() => setIntroductionText(introductionFallbackText));
  }, []);

  useEffect(() => {
    if (!activeInspectionId || !hasActiveWork) return;

    const updatedAt = new Date().toISOString();
    const nextSavedInspection = {
      id: activeInspectionId,
      form,
      rackConfig,
      bayLevels,
      selectedCell,
      cellDetails,
      complianceDetails,
      companyName: rackConfig?.companyName || form.companyName,
      companyAddress: rackConfig?.companyAddress || form.companyAddress,
      rackArea: rackConfig?.rackArea || form.rackArea,
      rackNumber: rackConfig?.rackNumber || form.rackNumber,
      reportFolio: rackConfig?.reportFolio || form.reportFolio,
      inspectionDate: rackConfig?.inspectionDate || form.inspectionDate,
      rackType: rackConfig?.rackType || form.rackType,
      updatedAt,
    };

    setSavedInspections((currentInspections) => {
      const existingIndex = currentInspections.findIndex(
        (inspection) => inspection.id === activeInspectionId
      );

      if (existingIndex === -1) return [nextSavedInspection, ...currentInspections];

      const updatedInspections = [...currentInspections];
      updatedInspections[existingIndex] = nextSavedInspection;
      return updatedInspections.sort((first, second) =>
        (second.updatedAt || '').localeCompare(first.updatedAt || '')
      );
    });
  }, [activeInspectionId, form, rackConfig, bayLevels, selectedCell, cellDetails, complianceDetails, hasActiveWork]);

  const rackPositions = useMemo(() => {
    if (!rackConfig) return [];

    const normalizedLevels = normalizeBayLevels(rackConfig, bayLevels);

    return Array.from({ length: rackConfig.bays }, (_, bayIndex) =>
      Array.from({ length: normalizedLevels[bayIndex + 1] }, (_, levelIndex) => ({
        id: `B${bayIndex + 1}-N${levelIndex + 1}`,
        bay: bayIndex + 1,
        level: levelIndex + 1,
      }))
    ).flat();
  }, [rackConfig, bayLevels]);

  function handleFieldChange(event) {
    const { name, value } = event.target;
    const numericFields = ['bays', 'levels'];

    setForm((currentForm) => ({
      ...currentForm,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  }

  function handleNewInspection() {
    setActiveInspectionId(createInspectionId());
    setScreen('configuration');
    setForm(initialForm);
    setRackConfig(null);
    setBayLevels({});
    setSelectedCell(null);
    setCellDetails({});
    setComplianceDetails({});
  }

  function handleOpenInspection(inspectionId) {
    const inspection = savedInspections.find((currentInspection) => (
      currentInspection.id === inspectionId
    ));
    if (!inspection) return;

    setActiveInspectionId(inspection.id);
    setIsSavedPanelOpen(false);
    setForm(inspection.form || initialForm);
    setRackConfig(inspection.rackConfig || inspection.config || null);
    setBayLevels(normalizeBayLevels(inspection.rackConfig || inspection.config, inspection.bayLevels));
    setSelectedCell(inspection.selectedCell || null);
    setCellDetails(inspection.cellDetails || {});
    setComplianceDetails(inspection.complianceDetails || {});
    setScreen(inspection.rackConfig ? 'rack' : 'configuration');
  }

  function handleDeleteInspection(inspectionId) {
    setSavedInspections((currentInspections) => (
      currentInspections.filter((inspection) => inspection.id !== inspectionId)
    ));

    if (activeInspectionId === inspectionId) {
      setActiveInspectionId(null);
      setScreen('home');
      setForm(initialForm);
      setRackConfig(null);
      setBayLevels({});
      setSelectedCell(null);
      setCellDetails({});
      setComplianceDetails({});
    }
  }

  function handleSaveInspection() {
    if (!activeInspectionId) setActiveInspectionId(createInspectionId());
    setSaveMessage('Guardado');
    window.setTimeout(() => setSaveMessage(''), 1800);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const cleanConfig = {
      ...form,
      companyName: form.companyName.trim(),
      companyAddress: form.companyAddress.trim(),
      rackArea: form.rackArea.trim(),
      rackNumber: form.rackNumber.trim(),
      reportFolio: form.reportFolio.trim(),
      inspectionDate: form.inspectionDate,
      rackType: form.rackType.trim(),
      observations: form.observations.trim(),
      bays: Math.max(1, Number(form.bays)),
      levels: Math.max(1, Number(form.levels)),
    };

    setRackConfig(cleanConfig);
    setBayLevels(createBayLevels(cleanConfig.bays, cleanConfig.levels));
    setSelectedCell(null);
    setCellDetails({});
    setComplianceDetails({});
    setScreen('rack');
  }

  function handleSelectCell(position) {
    setSelectedCell(position);
  }

  function handleUpdateCell(cellId, nextDetail) {
    setCellDetails((currentDetails) => ({
      ...currentDetails,
      [cellId]: nextDetail,
    }));
  }

  function handleSetBayLevel(bay, nextLevelCount) {
    const safeLevelCount = Math.max(1, Number(nextLevelCount));
    const currentLevelCount = Number(bayLevels[bay] || rackConfig.levels);

    if (safeLevelCount < currentLevelCount) {
      const removedIds = Array.from(
        { length: currentLevelCount - safeLevelCount },
        (_, index) => `B${bay}-N${safeLevelCount + index + 1}`
      );
      const hasData = removedIds.some((cellId) => detailHasData(cellDetails[cellId]));

      if (
        hasData &&
        !window.confirm('Este nivel tiene hallazgos registrados. Seguro que deseas eliminarlo?')
      ) {
        return;
      }

      setCellDetails((currentDetails) => {
        const updatedDetails = { ...currentDetails };
        removedIds.forEach((cellId) => {
          delete updatedDetails[cellId];
        });
        return updatedDetails;
      });
    }

    setBayLevels((currentLevels) => ({
      ...currentLevels,
      [bay]: safeLevelCount,
    }));
    setSelectedCell(null);
  }

  function handleApplyBayLevelRange(fromBay, toBay, nextLevelCount) {
    const startBay = Math.max(1, Math.min(Number(fromBay), Number(toBay)));
    const endBay = Math.min(rackConfig.bays, Math.max(Number(fromBay), Number(toBay)));
    const safeLevelCount = Math.max(1, Number(nextLevelCount));
    const normalizedLevels = normalizeBayLevels(rackConfig, bayLevels);
    const removedIds = [];

    for (let bay = startBay; bay <= endBay; bay += 1) {
      const currentLevelCount = normalizedLevels[bay] || rackConfig.levels;
      if (safeLevelCount < currentLevelCount) {
        removedIds.push(...Array.from(
          { length: currentLevelCount - safeLevelCount },
          (_, index) => `B${bay}-N${safeLevelCount + index + 1}`
        ));
      }
    }

    const hasData = removedIds.some((cellId) => detailHasData(cellDetails[cellId]));

    if (
      hasData &&
      !window.confirm('Este nivel tiene hallazgos registrados. Seguro que deseas eliminarlo?')
    ) {
      return;
    }

    setCellDetails((currentDetails) => {
      const updatedDetails = { ...currentDetails };
      removedIds.forEach((cellId) => {
        delete updatedDetails[cellId];
      });
      return updatedDetails;
    });

    setBayLevels((currentLevels) => {
      const updatedLevels = { ...currentLevels };
      for (let bay = startBay; bay <= endBay; bay += 1) {
        updatedLevels[bay] = safeLevelCount;
      }
      return updatedLevels;
    });
    setSelectedCell(null);
  }

  function handleBulkRename(nextNames) {
    setCellDetails((currentDetails) => {
      const updatedDetails = { ...currentDetails };

      Object.entries(nextNames).forEach(([cellId, locationName]) => {
        updatedDetails[cellId] = {
          ...(updatedDetails[cellId] || {}),
          locationName,
        };
      });

      return updatedDetails;
    });
  }

  function handleUpdateCompliance(requirementId, nextDetail) {
    setComplianceDetails((currentDetails) => ({
      ...currentDetails,
      [requirementId]: {
        ...(currentDetails[requirementId] || {}),
        ...nextDetail,
      },
    }));
  }

  return (
    <main className="app-shell">
      <SavedInspectionsMenu
        isOpen={isSavedPanelOpen}
        inspections={savedInspections}
        onToggle={() => setIsSavedPanelOpen((isOpen) => !isOpen)}
        onOpenInspection={handleOpenInspection}
        onDeleteInspection={handleDeleteInspection}
      />

      {screen === 'home' && (
        <HomeScreen
          onNewInspection={handleNewInspection}
        />
      )}

      {screen === 'configuration' && (
        <ConfigurationScreen
          form={form}
          onChange={handleFieldChange}
          onSubmit={handleSubmit}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'rack' && rackConfig && (
        <RackScreen
          config={rackConfig}
          positions={rackPositions}
          bayLevels={normalizeBayLevels(rackConfig, bayLevels)}
          selectedCell={selectedCell}
          cellDetails={cellDetails}
        complianceDetails={complianceDetails}
        introductionText={introductionText}
        onSelectCell={handleSelectCell}
          onUpdateCell={handleUpdateCell}
          onUpdateCompliance={handleUpdateCompliance}
          onSetBayLevel={handleSetBayLevel}
          onApplyBayLevelRange={handleApplyBayLevelRange}
          onBulkRename={handleBulkRename}
          onEdit={() => setScreen('configuration')}
          onNewInspection={handleNewInspection}
          onPrint={() => window.print()}
          onSaveInspection={handleSaveInspection}
          saveMessage={saveMessage}
        />
      )}
    </main>
  );
}

function HomeScreen({ onNewInspection }) {
  return (
    <section className="home-view">
      <div className="hero-brand" aria-label="FMC Industrial">
        <img src="logo.png" alt="FMC Industrial" />
      </div>

      <div className="home-copy">
        <p className="eyebrow">FMC Industrial</p>
        <h1>Inspeccion de racks industriales</h1>
        <p>
          Crea la estructura del rack antes de revisarlo y trabaja con una
          cuadricula visual adaptada a cada empresa, area y numero de rack.
        </p>
      </div>

      <div className="home-actions">
        <button className="primary-action" type="button" onClick={onNewInspection}>
          Nueva inspeccion
        </button>
      </div>
    </section>
  );
}

function SavedInspectionsMenu({
  isOpen,
  inspections,
  onToggle,
  onOpenInspection,
  onDeleteInspection,
}) {
  return (
    <aside className={`saved-drawer ${isOpen ? 'open' : ''}`} aria-label="Archivo de inspecciones">
      <button className="menu-toggle" type="button" onClick={onToggle} aria-label="Abrir archivo">
        <span />
        <span />
        <span />
      </button>

      {isOpen && (
        <div className="saved-drawer-panel">
          <div className="saved-inspections-header">
            <p className="eyebrow">Archivo local</p>
            <h2>Inspecciones guardadas</h2>
          </div>

          {inspections.length > 0 ? (
            <div className="saved-inspections-list">
              {inspections.map((inspection) => (
                <SavedInspectionCard
                  inspection={inspection}
                  key={inspection.id}
                  onOpen={() => onOpenInspection(inspection.id)}
                  onDelete={() => onDeleteInspection(inspection.id)}
                />
              ))}
            </div>
          ) : (
            <p className="empty-saved-message">No hay inspecciones guardadas todavia.</p>
          )}
        </div>
      )}
    </aside>
  );
}

function SavedInspectionCard({ inspection, onOpen, onDelete }) {
  const config = inspection.rackConfig || inspection.config || {};
  const companyName = inspection.companyName || config.companyName || inspection.form?.companyName || 'Empresa sin nombre';
  const rackArea = inspection.rackArea || config.rackArea || inspection.form?.rackArea || 'Area sin capturar';
  const rackNumber = inspection.rackNumber || config.rackNumber || inspection.form?.rackNumber || 'Sin rack';
  const rackType = inspection.rackType || config.rackType || inspection.form?.rackType || 'Tipo pendiente';
  const updatedAt = inspection.updatedAt
    ? new Date(inspection.updatedAt).toLocaleDateString('es-MX')
    : 'Sin fecha';

  return (
    <article className="saved-inspection-card">
      <div>
        <span>{companyName}</span>
        <h3>Rack {rackNumber}</h3>
        <p>{rackArea} / {rackType}</p>
        <small>Actualizada: {updatedAt}</small>
      </div>
      <div className="saved-inspection-actions">
        <button className="secondary-action" type="button" onClick={onOpen}>
          Abrir
        </button>
        <button className="ghost-action" type="button" onClick={onDelete}>
          Borrar
        </button>
      </div>
    </article>
  );
}

function ConfigurationScreen({ form, onChange, onSubmit, onBack }) {
  return (
    <section className="workspace-view">
      <header className="section-header">
        <div>
          <p className="eyebrow">Primer paso</p>
          <h1>Configuracion del Rack</h1>
        </div>
        <button className="secondary-action" type="button" onClick={onBack}>
          Volver
        </button>
      </header>

      <form className="configuration-form" onSubmit={onSubmit}>
        <label>
          <span>Nombre de la empresa</span>
          <input
            name="companyName"
            value={form.companyName}
            onChange={onChange}
            placeholder="Ej. Manufacturas Norte"
            required
          />
        </label>

        <label>
          <span>Direccion de la empresa</span>
          <input
            name="companyAddress"
            value={form.companyAddress}
            onChange={onChange}
            placeholder="Ej. Calle, ciudad, estado"
          />
        </label>

        <label>
          <span>Area o ubicacion del rack</span>
          <input
            name="rackArea"
            value={form.rackArea}
            onChange={onChange}
            placeholder="Ej. Almacen A - Pasillo 3"
            required
          />
        </label>

        <label>
          <span>Numero de rack</span>
          <input
            name="rackNumber"
            value={form.rackNumber}
            onChange={onChange}
            placeholder="Ej. R-014"
            required
          />
        </label>

        <label>
          <span>Folio del reporte</span>
          <input
            name="reportFolio"
            value={form.reportFolio}
            onChange={onChange}
            placeholder="Ej. REPORTE 26-159"
          />
        </label>

        <label>
          <span>Fecha de inspeccion</span>
          <input
            name="inspectionDate"
            type="date"
            value={form.inspectionDate}
            onChange={onChange}
          />
        </label>

        <label>
          <span>Tipo de rack</span>
          <select name="rackType" value={form.rackType} onChange={onChange} required>
            <option value="">Seleccionar tipo</option>
            {rackTypes.map((rackType) => (
              <option key={rackType} value={rackType}>
                {rackType}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Cantidad de bahias</span>
          <input
            name="bays"
            type="number"
            min="1"
            max="30"
            value={form.bays}
            onChange={onChange}
            required
          />
        </label>

        <label>
          <span>Cantidad de niveles</span>
          <input
            name="levels"
            type="number"
            min="1"
            max="20"
            value={form.levels}
            onChange={onChange}
            required
          />
        </label>

        <label className="full-width">
          <span>Observaciones generales</span>
          <textarea
            name="observations"
            value={form.observations}
            onChange={onChange}
            rows="4"
            placeholder="Condiciones generales, referencias del area o notas iniciales."
          />
        </label>

        <div className="form-actions">
          <button className="primary-action" type="submit">
            Guardar configuracion
          </button>
        </div>
      </form>
    </section>
  );
}

function RackScreen({
  config,
  positions,
  bayLevels,
  selectedCell,
  cellDetails,
  complianceDetails,
  introductionText,
  onSelectCell,
  onUpdateCell,
  onUpdateCompliance,
  onSetBayLevel,
  onApplyBayLevelRange,
  onBulkRename,
  onEdit,
  onNewInspection,
  onPrint,
  onSaveInspection,
  saveMessage,
}) {
  const [isStructureMode, setIsStructureMode] = useState(false);
  const [selectedBay, setSelectedBay] = useState(1);
  const [copiedLevelCount, setCopiedLevelCount] = useState(null);
  const [rangeEdit, setRangeEdit] = useState({
    fromBay: 1,
    toBay: Math.min(config.bays, 10),
    levels: config.levels,
  });
  const selectedDetail = selectedCell ? cellDetails[selectedCell.id] : null;
  const flatPositions = positions;
  const maxLevels = Math.max(...Object.values(bayLevels), 1);
  const bays = Array.from({ length: config.bays }, (_, index) => index + 1);
  const reportItems = flatPositions
    .map((position) => ({
      ...position,
      detail: cellDetails[position.id] || {},
    }))
    .filter((position) => position.detail.status === 'free' || position.detail.finding || position.detail.photo);
  const freeSpaceCount = reportItems.filter((position) => position.detail.status === 'free').length;
  const findingCount = reportItems.filter((position) => position.detail.finding).length;
  const complianceSummary = calculateComplianceSummary(complianceDetails);

  return (
    <section className="workspace-view rack-workspace">
      <header className="section-header rack-header">
        <div>
          <p className="eyebrow">Rack generado</p>
          <h1>{config.companyName}</h1>
          <p className="header-detail">
            {config.rackArea} / Rack {config.rackNumber} / {config.rackType}
          </p>
        </div>
        <div className="header-actions">
          <button className="secondary-action" type="button" onClick={onEdit}>
            Editar
          </button>
          <button className="secondary-action" type="button" onClick={onNewInspection}>
            Nueva
          </button>
          <button className="primary-action" type="button" onClick={onPrint}>
            Generar PDF
          </button>
        </div>
      </header>

      <div className="rack-summary">
        <SummaryItem label="Bahias" value={config.bays} />
        <SummaryItem label="Niveles max." value={maxLevels} />
        <SummaryItem label="Hallazgos" value={findingCount} />
        <SummaryItem label="Espacios libres" value={freeSpaceCount} />
        <SummaryItem
          label="Seleccion"
          value={
            selectedCell
              ? selectedDetail?.locationName || formatPositionName(config, selectedCell)
              : 'Sin seleccionar'
          }
        />
      </div>

      <BulkRenamePanel config={config} positions={flatPositions} onApply={onBulkRename} />

      <div className="rack-visual-toolbar">
        <div>
          <p className="eyebrow">Vista del rack</p>
          <h2>{isStructureMode ? 'Editar estructura' : 'Cuadricula de inspeccion'}</h2>
        </div>
        <div className="rack-visual-actions">
          {saveMessage && <span className="save-message">{saveMessage}</span>}
          <button
            className="secondary-action"
            type="button"
            onClick={() => {
              setIsStructureMode((currentMode) => !currentMode);
              onSelectCell(null);
            }}
          >
            {isStructureMode ? 'Terminar edicion' : 'Editar estructura'}
          </button>
          <button className="primary-action" type="button" onClick={onSaveInspection}>
            Guardar inspeccion
          </button>
        </div>
      </div>

      {isStructureMode && (
        <StructureEditor
          bayLevels={bayLevels}
          copiedLevelCount={copiedLevelCount}
          rangeEdit={rangeEdit}
          selectedBay={selectedBay}
          onApplyRange={() => onApplyBayLevelRange(
            rangeEdit.fromBay,
            rangeEdit.toBay,
            rangeEdit.levels
          )}
          onCopy={() => setCopiedLevelCount(bayLevels[selectedBay])}
          onPaste={() => copiedLevelCount && onSetBayLevel(selectedBay, copiedLevelCount)}
          onRangeChange={(field, value) => setRangeEdit((currentRange) => ({
            ...currentRange,
            [field]: Number(value),
          }))}
          onSelectBay={setSelectedBay}
          onSetBayLevel={onSetBayLevel}
        />
      )}

      <div className="rack-board-wrapper" aria-label="Cuadricula del rack">
        <div
          className={`rack-board ${isStructureMode ? 'structure-mode' : ''}`}
          style={{ gridTemplateColumns: `repeat(${config.bays}, minmax(96px, 1fr))` }}
        >
          {Array.from({ length: maxLevels }, (_, levelOffset) => maxLevels - levelOffset).map((level) => (
            bays.map((bay) => {
              if (level > bayLevels[bay]) {
                return (
                  <div
                    className="rack-cell-placeholder"
                    key={`B${bay}-N${level}-empty`}
                    aria-hidden="true"
                  />
                );
              }

              const position = {
                id: `B${bay}-N${level}`,
                bay,
                level,
              };
              const isSelected = selectedCell?.id === position.id;
              const detail = cellDetails[position.id];
              const isFreeSpace = detail?.status === 'free';
              const hasFinding = Boolean(detail?.finding);
              const label = detail?.locationName || formatPositionName(config, position);
              const findingLabel = detail?.finding || 'Sin hallazgo';
              const damageLabel = damageLevels.find((level) => level.value === detail?.damageLevel)?.label;

              return (
                <button
                  className={[
                    'rack-cell',
                    isSelected ? 'selected' : '',
                    isFreeSpace ? 'free-space' : '',
                    hasFinding ? 'has-finding' : '',
                  ].join(' ')}
                  key={position.id}
                  type="button"
                  onClick={() => {
                    if (isStructureMode) {
                      setSelectedBay(position.bay);
                      return;
                    }
                    onSelectCell(position);
                  }}
                  aria-pressed={isSelected}
                >
                  <strong>{label}</strong>
                  {damageLabel && detail?.damageLevel !== 'none' && (
                    <em className={`damage-badge ${detail.damageLevel}`}>{damageLabel}</em>
                  )}
                  <span>{findingLabel}</span>
                </button>
              );
            })
          ))}
        </div>
      </div>

      {selectedCell && (
        <CellEditor
          key={selectedCell.id}
          cell={selectedCell}
          detail={selectedDetail}
          onClose={() => onSelectCell(null)}
          onSave={(nextDetail) => {
            onUpdateCell(selectedCell.id, nextDetail);
            onSelectCell(null);
          }}
        />
      )}

      {config.observations && (
        <aside className="notes-panel">
          <h2>Observaciones generales</h2>
          <p>{config.observations}</p>
        </aside>
      )}

      <ComplianceModule
        details={complianceDetails}
        onUpdate={onUpdateCompliance}
        summary={complianceSummary}
      />

      <ReportPreview
        config={config}
        positions={flatPositions}
        cellDetails={cellDetails}
        complianceDetails={complianceDetails}
        complianceSummary={complianceSummary}
        introductionText={introductionText}
        reportItems={reportItems}
        findingCount={findingCount}
        freeSpaceCount={freeSpaceCount}
      />
    </section>
  );
}

function StructureEditor({
  bayLevels,
  copiedLevelCount,
  rangeEdit,
  selectedBay,
  onApplyRange,
  onCopy,
  onPaste,
  onRangeChange,
  onSelectBay,
  onSetBayLevel,
}) {
  const selectedLevelCount = bayLevels[selectedBay] || 1;
  const bayOptions = Object.keys(bayLevels).map(Number);

  return (
    <section className="structure-editor" aria-label="Editar estructura del rack">
      <div className="structure-editor-main">
        <div>
          <p className="eyebrow">Bahia seleccionada</p>
          <h2>Bahia {String(selectedBay).padStart(3, '0')}</h2>
        </div>
        <label>
          <span>Niveles</span>
          <input
            min="1"
            type="number"
            value={selectedLevelCount}
            onChange={(event) => onSetBayLevel(selectedBay, event.target.value)}
          />
        </label>
        <div className="structure-actions">
          <button
            className="secondary-action"
            type="button"
            onClick={() => onSetBayLevel(selectedBay, selectedLevelCount + 1)}
          >
            + Nivel
          </button>
          <button
            className="secondary-action"
            type="button"
            onClick={() => onSetBayLevel(selectedBay, selectedLevelCount - 1)}
          >
            - Nivel
          </button>
          <button className="secondary-action" type="button" onClick={onCopy}>
            Copiar estructura
          </button>
          <button
            className="secondary-action"
            disabled={!copiedLevelCount}
            type="button"
            onClick={onPaste}
          >
            Pegar estructura
          </button>
        </div>
      </div>

      <div className="structure-bay-strip">
        {bayOptions.map((bay) => (
          <button
            className={selectedBay === bay ? 'selected' : ''}
            key={bay}
            type="button"
            onClick={() => onSelectBay(bay)}
          >
            {String(bay).padStart(3, '0')}
            <span>{bayLevels[bay]} niveles</span>
          </button>
        ))}
      </div>

      <form
        className="structure-range"
        onSubmit={(event) => {
          event.preventDefault();
          onApplyRange();
        }}
      >
        <label>
          <span>Desde bahia</span>
          <input
            min="1"
            type="number"
            value={rangeEdit.fromBay}
            onChange={(event) => onRangeChange('fromBay', event.target.value)}
          />
        </label>
        <label>
          <span>Hasta bahia</span>
          <input
            min="1"
            type="number"
            value={rangeEdit.toBay}
            onChange={(event) => onRangeChange('toBay', event.target.value)}
          />
        </label>
        <label>
          <span>Niveles</span>
          <input
            min="1"
            type="number"
            value={rangeEdit.levels}
            onChange={(event) => onRangeChange('levels', event.target.value)}
          />
        </label>
        <button className="primary-action" type="submit">
          Aplicar a rango
        </button>
      </form>
    </section>
  );
}

function ComplianceModule({ details, onUpdate, summary }) {
  return (
    <section className="compliance-module" aria-label="Cumplimiento normativo">
      <div className="compliance-header">
        <div>
          <p className="eyebrow">Inspeccion general del sistema de racks</p>
          <h2>Cumplimiento normativo</h2>
        </div>
        <div className={`compliance-score ${summary.tone}`}>
          <span>Cumplimiento general</span>
          <strong>{summary.percentage}%</strong>
          <div>
            <i style={{ width: `${summary.percentage}%` }} />
          </div>
        </div>
      </div>

      <div className="compliance-counts">
        <span className="cumple">Cumple: {summary.counts.cumple}</span>
        <span className="no-cumple">No cumple: {summary.counts['no-cumple']}</span>
        <span className="no-verificado">Pendientes: {summary.counts['no-aplica'] + summary.counts['no-verificado']}</span>
      </div>

      <div className="compliance-groups">
        {complianceRequirements.map((group) => (
          <section className="compliance-group" key={group.category}>
            <div className="compliance-group-title">
              <span>{group.icon}</span>
              <h3>{group.category}</h3>
            </div>
            <div className="compliance-cards">
              {group.items.map((item) => (
                <ComplianceCard
                  detail={details[item.id] || {}}
                  item={item}
                  key={item.id}
                  onUpdate={(nextDetail) => onUpdate(item.id, nextDetail)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function ComplianceCard({ detail, item, onUpdate }) {
  const status = detail.status || 'no-verificado';
  const showFindingFields = status === 'no-cumple';

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onUpdate({ photo: String(reader.result) });
    };
    reader.readAsDataURL(file);
  }

  return (
    <article className={`compliance-card ${status}`}>
      <div className="compliance-card-main">
        <div>
          <h4>{item.name}</h4>
          <p>{item.description}</p>
        </div>
        <div className="status-chips" role="group" aria-label={`Estado de ${item.name}`}>
          {complianceStatuses.map((statusOption) => (
            <button
              className={status === statusOption.value ? 'selected' : ''}
              key={statusOption.value}
              type="button"
              onClick={() => onUpdate({
                status: statusOption.value,
                recommendation: statusOption.value === 'no-cumple' ? item.recommendation : '',
              })}
            >
              <span className={`status-dot ${statusOption.value}`} />
              {statusOption.label}
            </button>
          ))}
        </div>
      </div>

      {showFindingFields && (
        <div className="compliance-finding-fields">
          <label>
            <span>Observaciones</span>
            <textarea
              rows="3"
              value={detail.observations || ''}
              onChange={(event) => onUpdate({ observations: event.target.value })}
              placeholder="Describe la condicion encontrada."
            />
          </label>
          <label>
            <span>Evidencia fotografica</span>
            <input accept="image/*" type="file" onChange={handlePhotoChange} />
          </label>
          {detail.photo && (
            <div className="compliance-photo-preview">
              <img src={detail.photo} alt="Evidencia normativa" />
              <button className="secondary-action" type="button" onClick={() => onUpdate({ photo: '' })}>
                Quitar foto
              </button>
            </div>
          )}
          <div className="auto-recommendation">
            <span>Recomendacion automatica</span>
            <p>{detail.recommendation || item.recommendation}</p>
          </div>
        </div>
      )}
    </article>
  );
}

function ReportPreview({
  config,
  positions,
  cellDetails,
  complianceDetails,
  complianceSummary,
  introductionText,
  reportItems,
  findingCount,
  freeSpaceCount,
}) {
  const generatedAt = new Date().toLocaleDateString('es-MX');
  const inspectionDateLabel = formatDisplayDate(config.inspectionDate);
  const reportNumber = config.reportFolio || `RACK-${String(config.rackNumber || 'SN').replace(/\s+/g, '-')}`;
  const introductionParagraphs = splitIntroductionParagraphs(introductionText);
  const maxLevels = Math.max(...positions.map((position) => position.level), 1);
  const evidenceItems = reportItems.filter((position) => position.detail.photo);
  const complianceRows = complianceRequirements.flatMap((group) => (
    group.items.map((item) => ({
      ...item,
      category: group.category,
      detail: complianceDetails[item.id] || {},
    }))
  ));
  const complianceFindings = complianceRows.filter((item) => item.detail.status === 'no-cumple');
  const mapPositions = Array.from({ length: maxLevels }, (_, levelIndex) => (
    Array.from({ length: config.bays }, (_, bayIndex) => {
      const bay = bayIndex + 1;
      const level = maxLevels - levelIndex;
      return positions.find((position) => position.bay === bay && position.level === level) || {
        id: `empty-B${bay}-N${level}`,
        bay,
        level,
        empty: true,
      };
    })
  )).flat();

  return (
    <section className="report-preview report-page" aria-label="Reporte imprimible">
      <table className="report-header-table">
        <tbody>
          <tr>
            <td className="report-logo-cell">
              <img src="logo.png" alt="FMC Industrial" />
            </td>
            <td className="report-title-cell">
              <strong>REPORTE TECNICO DE INSPECCION DE RACKS</strong>
              <span>SUMINISTROS BAJA NORTE FMC S. DE R.L. DE C.V.</span>
              <span>Inspeccion visual y registro de condiciones por ubicacion</span>
            </td>
            <td className="report-folio-cell">
              <span>Folio</span>
              <strong>{reportNumber}</strong>
              <span>Revision 01</span>
            </td>
          </tr>
        </tbody>
      </table>

      <section className="report-block">
        <div className="report-section-banner">Datos generales del servicio</div>
        <table className="report-info-table">
          <tbody>
            <tr>
              <td><span>Cliente / empresa</span><strong>{config.companyName}</strong></td>
              <td><span>Direccion de la empresa</span><strong>{config.companyAddress || 'No capturada'}</strong></td>
              <td><span>Fecha de inspeccion</span><strong>{inspectionDateLabel}</strong></td>
            </tr>
            <tr>
              <td><span>Area / ubicacion</span><strong>{config.rackArea}</strong></td>
              <td><span>Fecha del reporte</span><strong>{generatedAt}</strong></td>
              <td><span>Rack inspeccionado</span><strong>{config.rackNumber}</strong></td>
            </tr>
            <tr>
              <td><span>Tipo de rack</span><strong>{config.rackType}</strong></td>
              <td><span>Formato de ubicacion</span><strong>Rack-Bahia-Nivel</strong></td>
              <td><span>Folio</span><strong>{reportNumber}</strong></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="report-block">
        <div className="report-section-banner">Resumen general del rack</div>
        <div className="report-summary-panel">
          <div className="report-summary-cards">
            <div><span>Bahias</span><strong>{config.bays}</strong></div>
            <div><span>Niveles maximos</span><strong>{maxLevels}</strong></div>
            <div><span>Hallazgos</span><strong>{findingCount}</strong></div>
            <div><span>Espacios libres / puentes</span><strong>{freeSpaceCount}</strong></div>
          </div>
          <div className="report-summary-note">
            <span>Observaciones generales</span>
            <p>{config.observations || 'Sin observaciones generales registradas.'}</p>
          </div>
        </div>
      </section>

      <section className="report-block report-page-start report-introduction-block">
        <div className="report-section-banner">INTRODUCCION</div>
        <div className="report-introduction-text">
          {(introductionParagraphs.length ? introductionParagraphs : ['No se encontro contenido en introduccion.txt.']).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="report-block report-page-start">
        <div className="report-section-banner">Evaluacion general de cumplimiento normativo</div>
        <div className={`report-compliance-summary ${complianceSummary.tone}`}>
          <strong>Cumplimiento general: {complianceSummary.percentage}%</strong>
          <span>Cumple: {complianceSummary.counts.cumple}</span>
          <span>No cumple: {complianceSummary.counts['no-cumple']}</span>
          <span>Pendientes: {complianceSummary.counts['no-aplica'] + complianceSummary.counts['no-verificado']}</span>
        </div>
        <table className="report-table report-compliance-table">
          <thead>
            <tr>
              <th>Requisito</th>
              <th>Estado</th>
              <th>Observaciones</th>
              <th>Recomendacion</th>
            </tr>
          </thead>
          <tbody>
            {complianceRows.map((item) => {
              const status = item.detail.status || 'no-verificado';
              const statusLabel = complianceStatuses.find((option) => option.value === status)?.label || 'No verificado';

              return (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong><span>{item.category}</span></td>
                  <td>{statusLabel}</td>
                  <td>{item.detail.observations || 'Sin observaciones.'}</td>
                  <td>{status === 'no-cumple' ? item.detail.recommendation || item.recommendation : 'Sin recomendacion.'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="report-block report-page-start">
        <div className="report-section-banner">Hallazgos generales</div>
        {complianceFindings.length > 0 ? (
          <table className="report-table report-compliance-table">
            <thead>
              <tr>
                <th>Requisito</th>
                <th>Observaciones</th>
                <th>Recomendacion</th>
                <th>Evidencia</th>
              </tr>
            </thead>
            <tbody>
              {complianceFindings.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.detail.observations || 'Sin observaciones.'}</td>
                  <td>{item.detail.recommendation || item.recommendation}</td>
                  <td>
                    {item.detail.photo ? (
                      <img className="report-photo" src={item.detail.photo} alt="Evidencia normativa" />
                    ) : (
                      'Sin foto'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No se registraron hallazgos generales.</p>
        )}
      </section>

      <section className="report-block">
        <div className="report-section-banner">Detalle de hallazgos y espacios libres</div>
        {reportItems.length > 0 ? (
          <table className="report-table">
            <thead>
              <tr>
                <th>Ubicacion</th>
                <th>Bahia</th>
                <th>Nivel</th>
                <th>Tipo</th>
                <th>Nivel de dano</th>
                <th>Hallazgo / observacion</th>
                <th>Foto</th>
              </tr>
            </thead>
            <tbody>
              {reportItems.map((position) => (
                <tr key={position.id}>
                  <td>{position.detail.locationName || formatPositionName(config, position)}</td>
                  <td>{position.bay}</td>
                  <td>{position.level}</td>
                  <td>{position.detail.status === 'free' ? 'Espacio libre / puente' : 'Posicion normal'}</td>
                  <td>{damageLevels.find((level) => level.value === position.detail.damageLevel)?.label || 'Sin dano'}</td>
                  <td>{position.detail.finding || 'Sin hallazgo registrado.'}</td>
                  <td>
                    {position.detail.photo ? (
                      <img className="report-photo" src={position.detail.photo} alt="Evidencia" />
                    ) : (
                      'Sin foto'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay hallazgos ni espacios libres registrados.</p>
        )}
      </section>

      {evidenceItems.length > 0 && (
        <section className="report-block report-evidence-block">
          <div className="report-section-banner">Evidencia fotografica</div>
          <div className="report-evidence-grid">
            {evidenceItems.map((position, index) => (
              <figure className="report-evidence-card" key={position.id}>
                <img src={position.detail.photo} alt={`Evidencia ${index + 1}`} />
                <figcaption>
                  <strong>{position.detail.locationName || formatPositionName(config, position)}</strong>
                  <span>{position.detail.finding || 'Sin hallazgo registrado.'}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <footer className="report-footer">
        <div>
          <span>Inspector / responsable</span>
          <strong>________________________________</strong>
        </div>
        <div>
          <span>Firma</span>
          <strong>________________________________</strong>
        </div>
        <p>Documento generado automaticamente desde la app de inspecciones FMC Industrial.</p>
      </footer>
    </section>
  );
}

function ReportMetric({ label, value, tone }) {
  return (
    <div className={`report-metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function BulkRenamePanel({ config, positions, onApply }) {
  const [settings, setSettings] = useState({
    rackName: config.rackNumber || '01',
    bayNumber: '001',
    levelNumber: '01',
  });

  const previewPositions = positions.slice(0, 4);

  function handleChange(event) {
    const { name, value } = event.target;

    setSettings((currentSettings) => ({
      ...currentSettings,
      [name]: value,
    }));
  }

  function buildName(position) {
    const rackName = settings.rackName.trim() || '01';
    const bay = String(position.bay).padStart(Math.max(1, settings.bayNumber.length), '0');
    const level = String(position.level).padStart(Math.max(1, settings.levelNumber.length), '0');
    return `${rackName}-${bay}-${level}`;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextNames = positions.reduce((names, position) => {
      names[position.id] = buildName(position);
      return names;
    }, {});

    onApply(nextNames);
  }

  return (
    <form className="bulk-rename-panel" onSubmit={handleSubmit}>
      <div className="bulk-rename-header">
        <div>
          <p className="eyebrow">Nombres masivos</p>
          <h2>Renombrar todas las ubicaciones</h2>
        </div>
        <button className="primary-action" type="submit">
          Aplicar a todo el rack
        </button>
      </div>

      <div className="bulk-rename-grid">
        <label>
          <span>Nombre del rack</span>
          <input name="rackName" value={settings.rackName} onChange={handleChange} />
        </label>

        <label>
          <span>Bahia</span>
          <input name="bayNumber" value={settings.bayNumber} onChange={handleChange} />
        </label>

        <label>
          <span>Nivel</span>
          <input name="levelNumber" value={settings.levelNumber} onChange={handleChange} />
        </label>
      </div>

      <div className="bulk-preview">
        <span>Vista previa</span>
        <div>
          {previewPositions.map((position) => (
            <strong key={position.id}>{buildName(position)}</strong>
          ))}
        </div>
      </div>
    </form>
  );
}

function ReportField({ label, value }) {
  return (
    <div className="report-field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function CellEditor({ cell, detail, onClose, onSave }) {
  const [draft, setDraft] = useState({
    locationName: detail?.locationName || '',
    status: detail?.status || 'normal',
    damageLevel: detail?.damageLevel || 'none',
    finding: detail?.finding || '',
    photo: detail?.photo || '',
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setDraft((currentDraft) => ({
      ...currentDraft,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave({
      locationName: draft.locationName.trim(),
      status: draft.status,
      damageLevel: draft.damageLevel,
      finding: draft.finding.trim(),
      photo: draft.photo,
    });
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((currentDraft) => ({
        ...currentDraft,
        photo: String(reader.result),
      }));
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="cell-editor modal-panel" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Posicion seleccionada</p>
            <h2>Bahia {cell.bay} / Nivel {cell.level}</h2>
          </div>
          <button className="icon-action" type="button" onClick={onClose} aria-label="Cerrar">
            x
          </button>
        </div>

        <label>
          <span>Nombre de ubicacion</span>
          <input
            name="locationName"
            value={draft.locationName}
            onChange={handleChange}
            placeholder={`Bahia ${cell.bay} / Nivel ${cell.level}`}
          />
        </label>

        <label>
          <span>Tipo de posicion</span>
          <select name="status" value={draft.status} onChange={handleChange}>
            <option value="normal">Posicion normal</option>
            <option value="free">Espacio libre / puente</option>
          </select>
        </label>

        <label>
          <span>Nivel de dano</span>
          <select name="damageLevel" value={draft.damageLevel} onChange={handleChange}>
            {damageLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </label>

        <label className="full-width">
          <span>Hallazgo</span>
          <textarea
            name="finding"
            value={draft.finding}
            onChange={handleChange}
            rows="4"
            placeholder="Describe golpe, deformacion, falta de anclaje, corrosion u otro hallazgo."
          />
        </label>

        <label className="full-width">
          <span>Foto</span>
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
        </label>

        {draft.photo && (
          <div className="photo-preview full-width">
            <img src={draft.photo} alt="Vista previa" />
            <button
              className="secondary-action"
              type="button"
              onClick={() => setDraft((currentDraft) => ({ ...currentDraft, photo: '' }))}
            >
              Quitar foto
            </button>
          </div>
        )}

        <div className="form-actions">
          <button className="secondary-action" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary-action" type="submit">
            Guardar posicion
          </button>
        </div>
      </form>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;
