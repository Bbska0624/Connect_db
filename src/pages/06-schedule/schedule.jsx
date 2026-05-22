import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './schedule.css';
import Navbar from '../../shared/Navbar';
import { getSchedule, saveSchedule, getCachedCells } from '../../services/scheduleService';

// Days Mon–Sun (index 0=ДА … 6=НЯ)
const DAYS = ['ДА', 'МЯ', 'ЛХ', 'ПҮ', 'БА', 'БЯ', 'НЯ'];

// Hours 08:00 – 20:00
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);

const Schedule = () => {
  const navigate  = useNavigate();

  // cells: { "dayIndex-hour": "f" | "b" }
  const [cells,      setCells]      = useState({});
  const [mode,       setMode]       = useState('free');
  const [isDragging, setIsDragging] = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState('');

  // GET /api/schedule/me (with localStorage fast-path)
  useEffect(() => {
    const cached = getCachedCells();
    if (cached) {
      setCells(buildMap(cached));
      setLoading(false);
    } else {
      getSchedule().then(res => {
        if (res.success) setCells(buildMap(res.data.cells));
        setLoading(false);
      });
    }
  }, []);

  const buildMap = (cellArr) => {
    const map = {};
    (cellArr ?? []).forEach(c => { map[`${c.day}-${c.hour}`] = c.type; });
    return map;
  };

  // Apply current mode to a cell
  const applyCell = (dayIndex, hour) => {
    const key = `${dayIndex}-${hour}`;
    setCells(prev => {
      if (mode === 'clear') {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      // 'free' → 'f',  'busy' → 'b'
      return { ...prev, [key]: mode === 'free' ? 'f' : 'b' };
    });
  };

  // PUT /api/schedule/me
  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError('');
    const cellArray = Object.entries(cells).map(([key, type]) => {
      const [day, hour] = key.split('-').map(Number);
      return { day, hour, type };
    });
    const res = await saveSchedule(cellArray);
    setSaving(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => navigate('/discover'), 800);
    } else {
      setError(res.message || 'Хуваарь хадгалахад алдаа гарлаа');
    }
  };

  const handleClear = () => setCells({});

  const freeCount = Object.values(cells).filter(v => v === 'f').length;
  const busyCount = Object.values(cells).filter(v => v === 'b').length;

  return (
    <>
      <Navbar />

      {/* Sticky mode bar */}
      <div className="sched-sticky">
        <button className="sched-back" onClick={() => navigate('/setup')}>← Буцах</button>
        <span className="sched-title">Хуваарь тохируулах</span>
        <div className="mode-group">
          <button className={`sm-btn${mode === 'free'  ? ' on' : ''}`} onClick={() => setMode('free')}>🟢 Чөлөөт</button>
          <button className={`sm-btn${mode === 'busy'  ? ' on' : ''}`} onClick={() => setMode('busy')}>🟠 Хичээл</button>
          <button className={`sm-btn${mode === 'clear' ? ' on' : ''}`} onClick={() => setMode('clear')}>✕ Арилгах</button>
        </div>
      </div>

      <div className="sched-page">

        <div style={{ marginBottom: '18px' }}>
          <div className="sched-h">Долоо хоногийн хуваарь</div>
          <div className="sched-sub">Горим сонгоод нүдийг дарж эсвэл чирж тэмдэглэ</div>
        </div>

        {/* Legend */}
        <div className="sched-hint">
          <div className="sh-item"><div className="sh-sw sh-f"></div>Чөлөөт</div>
          <div className="sh-div"></div>
          <div className="sh-item"><div className="sh-sw sh-b"></div>Хичээлтэй</div>
          <div className="sh-div"></div>
          <div className="sh-item"><div className="sh-sw sh-e"></div>Хоосон</div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <span className="spinner" style={{ width: 32, height: 32 }}></span>
          </div>
        ) : (
          /* Grid — mousedown+drag paints cells */
          <div
            className="sched-wrap"
            onMouseLeave={() => setIsDragging(false)}
            onMouseUp={() => setIsDragging(false)}
          >
            {/* Header row */}
            <div className="sg-head">
              <div className="sg-corner"></div>
              {DAYS.map((d, i) => (
                <div key={i} className={`sg-day${i === 0 ? ' today' : ''}`}>{d}</div>
              ))}
            </div>

            {/* Body rows */}
            <div className="sg-body">
              {HOURS.map(hour => (
                <div className="sg-row" key={hour}>
                  <div className="sg-time">{hour}:00</div>
                  {DAYS.map((_, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`sg-cell ${cells[`${dayIndex}-${hour}`] ?? ''}`}
                      onMouseDown={() => { setIsDragging(true); applyCell(dayIndex, hour); }}
                      onMouseEnter={() => { if (isDragging) applyCell(dayIndex, hour); }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="sched-stats">
          <div className="ss-card">
            <div className="ss-n cyan">{freeCount}</div>
            <div className="ss-l">Чөлөөт цаг</div>
          </div>
          <div className="ss-card">
            <div className="ss-n sky">{busyCount}</div>
            <div className="ss-l">Хичээлтэй</div>
          </div>
          <div className="ss-card">
            <div className="ss-n mint">87%</div>
            <div className="ss-l">Match score</div>
          </div>
        </div>

        {success && <div className="api-success" style={{ marginTop: '12px' }}>✓ Хуваарь амжилттай хадгалагдлаа</div>}
        {error && <div className="api-error" style={{ marginTop: '12px' }}>⚠ {error}</div>}

        {/* Action buttons */}
        <div className="sched-btns">
          <button className="btn btn-p btn-full" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner"></span> Хадгалж байна...</> : '✓ Хадгалах'}
          </button>
          <button className="btn btn-s" onClick={handleClear}>🔄 Арилгах</button>
        </div>

      </div>
    </>
  );
};

export default Schedule;
