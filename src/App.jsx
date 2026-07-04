import { useMemo, useState } from 'react';

const rackTypes = [
  'Selectivo',
  'Drive-in',
  'Push-back',
  'Cantilever',
  'Dinamico',
  'Otro',
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

function App() {
  const [screen, setScreen] = useState('home');
  const [form, setForm] = useState(initialForm);
  const [rackConfig, setRackConfig] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [cellDetails, setCellDetails] = useState({});

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
    setScreen('configuration');
    setForm(initialForm);
    setRackConfig(null);
    setSelectedCell(null);
    setCellDetails({});
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
      {screen === 'home' && <HomeScreen onNewInspection={handleNewInspection} />}

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
        />
      )}
    </main>
  );
}

function HomeScreen({ onNewInspection }) {
  return (
    <section className="home-view">
      <div className="home-copy">
        <p className="eyebrow">Inspeccion industrial</p>
        <h1>Racks configurables para inspecciones en campo</h1>
        <p>
          Crea la estructura del rack antes de revisarlo y trabaja con una
          cuadricula visual adaptada a cada empresa, area y numero de rack.
        </p>
      </div>

      <button className="primary-action" type="button" onClick={onNewInspection}>
        Nueva inspeccion
      </button>
    </section>
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
}) {
  const selectedDetail = selectedCell ? cellDetails[selectedCell.id] : null;
  const flatPositions = positions.flat();
  const reportItems = flatPositions
    .map((position) => ({
      ...position,
      detail: cellDetails[position.id] || {},
    }))
    .filter((position) => position.detail.status === 'free' || position.detail.finding);
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

      <BulkRenamePanel positions={flatPositions} onApply={onBulkRename} />

      <div className="rack-board-wrapper" aria-label="Cuadricula del rack">
        <div
          className="rack-board"
          style={{ gridTemplateColumns: `repeat(${config.bays}, minmax(112px, 1fr))` }}
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
                  <span>Nivel {position.level}</span>
                  {isFreeSpace && <em>Espacio libre</em>}
                  {hasFinding && <em>Con hallazgo</em>}
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
          onSave={(nextDetail) => onUpdateCell(selectedCell.id, nextDetail)}
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
                <th>Hallazgo / observacion</th>
              </tr>
            </thead>
            <tbody>
              {reportItems.map((position) => (
                <tr key={position.id}>
                  <td>{position.detail.locationName || `Bahia ${position.bay} / Nivel ${position.level}`}</td>
                  <td>{position.bay}</td>
                  <td>{position.level}</td>
                  <td>{position.detail.status === 'free' ? 'Espacio libre / puente' : 'Posicion normal'}</td>
                  <td>{position.detail.finding || 'Sin hallazgo registrado.'}</td>
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

function BulkRenamePanel({ positions, onApply }) {
  const [settings, setSettings] = useState({
    pattern: 'bay-level',
    bayPrefix: 'Bahia',
    levelPrefix: 'Nivel',
    separator: ' / ',
    bayPadding: 0,
    levelPadding: 0,
    invertLevels: false,
  });

  const previewPositions = positions.slice(0, 4);

  function handleChange(event) {
    const { name, type, checked, value } = event.target;

    setSettings((currentSettings) => ({
      ...currentSettings,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function formatNumber(value, padding) {
    const size = Number(padding);
    return size > 0 ? String(value).padStart(size, '0') : String(value);
  }

  function buildName(position) {
    const bay = formatNumber(position.bay, settings.bayPadding);
    const levelValue = settings.invertLevels
      ? Math.max(...positions.map((currentPosition) => currentPosition.level)) - position.level + 1
      : position.level;
    const level = formatNumber(levelValue, settings.levelPadding);

    if (settings.pattern === 'level-bay') {
      return `${settings.levelPrefix} ${level}${settings.separator}${settings.bayPrefix} ${bay}`;
    }

    if (settings.pattern === 'compact') {
      return `${settings.bayPrefix}${bay}-${settings.levelPrefix}${level}`;
    }

    return `${settings.bayPrefix} ${bay}${settings.separator}${settings.levelPrefix} ${level}`;
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
          <span>Formato</span>
          <select name="pattern" value={settings.pattern} onChange={handleChange}>
            <option value="bay-level">Bahia / Nivel</option>
            <option value="level-bay">Nivel / Bahia</option>
            <option value="compact">Compacto</option>
          </select>
        </label>

        <label>
          <span>Nombre de bahia</span>
          <input name="bayPrefix" value={settings.bayPrefix} onChange={handleChange} />
        </label>

        <label>
          <span>Nombre de nivel</span>
          <input name="levelPrefix" value={settings.levelPrefix} onChange={handleChange} />
        </label>

        <label>
          <span>Separador</span>
          <input name="separator" value={settings.separator} onChange={handleChange} />
        </label>

        <label>
          <span>Ceros en bahia</span>
          <select name="bayPadding" value={settings.bayPadding} onChange={handleChange}>
            <option value="0">Sin ceros</option>
            <option value="2">01, 02, 03</option>
            <option value="3">001, 002, 003</option>
          </select>
        </label>

        <label>
          <span>Ceros en nivel</span>
          <select name="levelPadding" value={settings.levelPadding} onChange={handleChange}>
            <option value="0">Sin ceros</option>
            <option value="2">01, 02, 03</option>
            <option value="3">001, 002, 003</option>
          </select>
        </label>

        <label className="checkbox-field">
          <input
            name="invertLevels"
            type="checkbox"
            checked={settings.invertLevels}
            onChange={handleChange}
          />
          <span>Invertir numeracion de niveles</span>
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

function CellEditor({ cell, detail, onSave }) {
  const [draft, setDraft] = useState({
    locationName: detail?.locationName || '',
    status: detail?.status || 'normal',
    finding: detail?.finding || '',
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
      finding: draft.finding.trim(),
    });
  }

  return (
    <form className="cell-editor" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">Posicion seleccionada</p>
        <h2>Bahia {cell.bay} / Nivel {cell.level}</h2>
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

      <div className="form-actions">
        <button className="primary-action" type="submit">
          Guardar posicion
        </button>
      </div>
    </form>
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
