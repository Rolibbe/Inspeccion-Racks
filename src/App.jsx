import { useEffect, useMemo, useState } from 'react';

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

const initialForm = {
  companyName: '',
  rackArea: '',
  rackNumber: '',
  rackType: '',
  bays: 4,
  levels: 3,
  observations: '',
};

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
  const [selectedCell, setSelectedCell] = useState(null);
  const [cellDetails, setCellDetails] = useState({});

  const hasActiveWork = Boolean(
    rackConfig || Object.keys(cellDetails).length > 0 || hasFormData(form)
  );

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(savedInspections));
  }, [savedInspections]);

  useEffect(() => {
    if (!activeInspectionId || !hasActiveWork) return;

    const updatedAt = new Date().toISOString();
    const nextSavedInspection = {
      id: activeInspectionId,
      form,
      rackConfig,
      selectedCell,
      cellDetails,
      companyName: rackConfig?.companyName || form.companyName,
      rackArea: rackConfig?.rackArea || form.rackArea,
      rackNumber: rackConfig?.rackNumber || form.rackNumber,
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
  }, [activeInspectionId, form, rackConfig, selectedCell, cellDetails, hasActiveWork]);

  const rackPositions = useMemo(() => {
    if (!rackConfig) return [];

    return Array.from({ length: rackConfig.levels }, (_, levelIndex) =>
      Array.from({ length: rackConfig.bays }, (_, bayIndex) => ({
        id: `B${bayIndex + 1}-N${levelIndex + 1}`,
        bay: bayIndex + 1,
        level: levelIndex + 1,
      }))
    );
  }, [rackConfig]);

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
    setSelectedCell(null);
    setCellDetails({});
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
    setSelectedCell(inspection.selectedCell || null);
    setCellDetails(inspection.cellDetails || {});
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
      setSelectedCell(null);
      setCellDetails({});
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
      rackArea: form.rackArea.trim(),
      rackNumber: form.rackNumber.trim(),
      rackType: form.rackType.trim(),
      observations: form.observations.trim(),
      bays: Math.max(1, Number(form.bays)),
      levels: Math.max(1, Number(form.levels)),
    };

    setRackConfig(cleanConfig);
    setSelectedCell(null);
    setCellDetails({});
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
          selectedCell={selectedCell}
          cellDetails={cellDetails}
          onSelectCell={handleSelectCell}
          onUpdateCell={handleUpdateCell}
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
  selectedCell,
  cellDetails,
  onSelectCell,
  onUpdateCell,
  onBulkRename,
  onEdit,
  onNewInspection,
  onPrint,
  onSaveInspection,
  saveMessage,
}) {
  const selectedDetail = selectedCell ? cellDetails[selectedCell.id] : null;
  const flatPositions = positions.flat();
  const reportItems = flatPositions
    .map((position) => ({
      ...position,
      detail: cellDetails[position.id] || {},
    }))
    .filter((position) => position.detail.status === 'free' || position.detail.finding || position.detail.photo);
  const freeSpaceCount = reportItems.filter((position) => position.detail.status === 'free').length;
  const findingCount = reportItems.filter((position) => position.detail.finding).length;

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
        <SummaryItem label="Niveles" value={config.levels} />
        <SummaryItem label="Hallazgos" value={findingCount} />
        <SummaryItem label="Espacios libres" value={freeSpaceCount} />
        <SummaryItem
          label="Seleccion"
          value={
            selectedCell
              ? selectedDetail?.locationName || `Bahia ${selectedCell.bay} / Nivel ${selectedCell.level}`
              : 'Sin seleccionar'
          }
        />
      </div>

      <BulkRenamePanel config={config} positions={flatPositions} onApply={onBulkRename} />

      <div className="rack-visual-toolbar">
        <div>
          <p className="eyebrow">Vista del rack</p>
          <h2>Cuadricula de inspeccion</h2>
        </div>
        <div className="rack-visual-actions">
          {saveMessage && <span className="save-message">{saveMessage}</span>}
          <button className="primary-action" type="button" onClick={onSaveInspection}>
            Guardar inspeccion
          </button>
        </div>
      </div>

      <div className="rack-board-wrapper" aria-label="Cuadricula del rack">
        <div
          className="rack-board"
          style={{ gridTemplateColumns: `repeat(${config.bays}, minmax(96px, 1fr))` }}
        >
          {positions
            .slice()
            .reverse()
            .flat()
            .map((position) => {
              const isSelected = selectedCell?.id === position.id;
              const detail = cellDetails[position.id];
              const isFreeSpace = detail?.status === 'free';
              const hasFinding = Boolean(detail?.finding);
              const label = detail?.locationName || `Bahia ${position.bay}`;
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
                  onClick={() => onSelectCell(position)}
                  aria-pressed={isSelected}
                >
                  <strong>{label}</strong>
                  {damageLabel && detail?.damageLevel !== 'none' && (
                    <em className={`damage-badge ${detail.damageLevel}`}>{damageLabel}</em>
                  )}
                  <span>{findingLabel}</span>
                </button>
              );
            })}
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

      <ReportPreview
        config={config}
        positions={flatPositions}
        cellDetails={cellDetails}
        reportItems={reportItems}
        findingCount={findingCount}
        freeSpaceCount={freeSpaceCount}
      />
    </section>
  );
}

function ReportPreview({
  config,
  positions,
  cellDetails,
  reportItems,
  findingCount,
  freeSpaceCount,
}) {
  const generatedAt = new Date().toLocaleDateString('es-MX');
  const mapPositions = Array.from({ length: config.levels }, (_, levelIndex) =>
    Array.from({ length: config.bays }, (_, bayIndex) => ({
      id: `B${bayIndex + 1}-N${config.levels - levelIndex}`,
      bay: bayIndex + 1,
      level: config.levels - levelIndex,
    }))
  ).flat();

  return (
    <section className="report-preview" aria-label="Reporte imprimible">
      <header className="report-topline">
        <div className="report-brand">
          <span>Inspeccion de racks industriales</span>
          <h1>Reporte tecnico</h1>
          <p>{config.companyName}</p>
        </div>
        <div className="report-meta-card">
          <strong>Rack {config.rackNumber}</strong>
          <span>Fecha: {generatedAt}</span>
          <span>Area: {config.rackArea}</span>
        </div>
      </header>

      <div className="report-kpis">
        <ReportMetric label="Hallazgos" value={findingCount} tone="danger" />
        <ReportMetric label="Espacios libres / puentes" value={freeSpaceCount} tone="muted" />
        <ReportMetric label="Dimensiones" value={`${config.bays} x ${config.levels}`} tone="neutral" />
        <ReportMetric label="Tipo de rack" value={config.rackType} tone="neutral" />
      </div>

      <section className="report-block">
        <div className="report-block-title">
          <span>01</span>
          <h2>Datos generales</h2>
        </div>
        <div className="report-data-grid">
          <ReportField label="Empresa" value={config.companyName} />
          <ReportField label="Area / ubicacion" value={config.rackArea} />
          <ReportField label="Numero de rack" value={config.rackNumber} />
          <ReportField label="Tipo de rack" value={config.rackType} />
          <ReportField label="Bahias" value={config.bays} />
          <ReportField label="Niveles" value={config.levels} />
        </div>
      </section>

      <section className="report-block">
        <div className="report-block-title">
          <span>02</span>
          <h2>Observaciones generales</h2>
        </div>
        <p className="report-note">{config.observations || 'Sin observaciones generales registradas.'}</p>
      </section>

      <section className="report-block">
        <div className="report-block-title">
          <span>03</span>
          <h2>Resumen visual del rack</h2>
        </div>
        <div
          className="report-rack-map"
          style={{ gridTemplateColumns: `repeat(${config.bays}, minmax(32px, 1fr))` }}
        >
          {mapPositions.map((position) => {
            const detail = cellDetails[position.id] || {};
            const className = [
              'report-map-cell',
              detail.status === 'free' ? 'free' : '',
              detail.finding ? 'finding' : '',
            ].join(' ');

            return (
              <span className={className} key={position.id}>
                B{position.bay}/N{position.level}
              </span>
            );
          })}
        </div>
        <div className="report-legend">
          <span><i className="legend-normal" /> Normal</span>
          <span><i className="legend-free" /> Espacio libre / puente</span>
          <span><i className="legend-finding" /> Con hallazgo</span>
        </div>
      </section>

      <section className="report-block">
        <div className="report-block-title">
          <span>04</span>
          <h2>Detalle de hallazgos y espacios libres</h2>
        </div>
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
                  <td>{position.detail.locationName || `Bahia ${position.bay} / Nivel ${position.level}`}</td>
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

      <footer className="report-footer">
        <div>
          <span>Inspector</span>
          <strong>________________________________</strong>
        </div>
        <div>
          <span>Firma</span>
          <strong>________________________________</strong>
        </div>
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
