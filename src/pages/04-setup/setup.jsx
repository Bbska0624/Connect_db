import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './setup.css';
import Navbar from '../../shared/Navbar';
import { getProfile, updateProfile } from '../../services/profileService';

const ALL_INTERESTS = [
  '💻 Код бичих', '☕ Кофе', '📖 Уншлага', '🎵 Хөгжим',
  '⚽ Спорт', '🎬 Кино', '✈️ Аялал', '🍳 Хоол',
  '📷 Фото', '🎨 Дизайн', '🧬 Шинжлэх ухаан', '🎮 Тоглоом',
];

const ALL_GOALS = [
  { id: 'study',    icon: '📚', name: 'Хамт суралцах' },
  { id: 'project',  icon: '💻', name: 'Проект хийх'   },
  { id: 'research', icon: '🔬', name: 'Судалгаа'       },
  { id: 'chill',    icon: '☕', name: 'Амрах'          },
  { id: 'language', icon: '🗣️', name: 'Хэлний практик' },
  { id: 'club',     icon: '🎯', name: 'Клуб'           },
];

const MBTI_GROUPS = [
  { label: '🔭 Аналитик',  types: ['INTJ','INTP','ENTJ','ENTP'] },
  { label: '🌿 Дипломат',  types: ['INFJ','INFP','ENFJ','ENFP'] },
  { label: '🛡️ Хамгаалагч', types: ['ISTJ','ISFJ','ESTJ','ESFJ'] },
  { label: '⚡ Судлаач',   types: ['ISTP','ISFP','ESTP','ESFP'] },
];

const Setup = () => {
  const navigate = useNavigate();

  const [name,      setName]      = useState('');
  const [major,     setMajor]     = useState('Программ хангамж');
  const [year,      setYear]      = useState(3);
  const [bio,       setBio]       = useState('');
  const [interests, setInterests] = useState([]);
  const [goals,     setGoals]     = useState([]);
  const [mbti,      setMbti]      = useState(null);
  const [instagram, setInstagram] = useState('');
  const [facebook,  setFacebook]  = useState('');

  // Photo upload state
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarBase64,  setAvatarBase64]  = useState('');
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(null);

  // GET /api/profile/me
  useEffect(() => {
    getProfile().then(res => {
      if (res.success) {
        const p = res.data;
        setName(p.name);
        setMajor(p.major);
        setYear(p.year);
        setBio(p.bio);
        setInterests(p.interests ?? []);
        setGoals(p.goals ?? []);
        setMbti(p.mbti ?? null);
        setInstagram(p.instagram ?? '');
        setFacebook(p.facebook ?? '');
        if (p.avatarUrl) {
          setAvatarPreview(p.avatarUrl);
          setAvatarBase64(p.avatarUrl);
        }
      }
      setLoading(false);
    });
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Зурагны хэмжээ 2MB-аас хэтрэхгүй байх ёстой');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target.result);
      setAvatarBase64(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const toggleInterest = (item) =>
    setInterests(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );

  const toggleGoal = (name) =>
    setGoals(prev =>
      prev.includes(name) ? prev.filter(g => g !== name) : [...prev, name]
    );

  // PUT /api/profile/me
  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    const payload = { name, major, year, bio, interests, goals, mbti, instagram, facebook };
    if (avatarBase64) payload.avatarUrl = avatarBase64;
    const res = await updateProfile(payload);
    setSaving(false);
    if (res.success) {
      setSuccess(res.message);
      setTimeout(() => navigate('/schedule'), 800);
    } else {
      setError(res.message);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <span className="spinner" style={{ width: 32, height: 32 }}></span>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="setup-wrap">

        {/* Progress bar */}
        <div className="step-bar">
          <div className="step-dots">
            <div className="sd done"></div>
            <div className="sd active"></div>
            <div className="sd"></div>
            <div className="sd"></div>
          </div>
          <div className="step-lbl">Алхам <strong>2/4</strong> — Мэдээлэл</div>
          <button className="skip-btn" onClick={() => navigate('/schedule')}>Алгасах →</button>
        </div>

        <div className="step-content">
          <div className="step-h">Профайл бүрдүүлэх</div>
          <div className="step-p">Таны профайл бусдад хэрхэн харагдахыг тодорхойлно.</div>

          {error   && <div className="api-error">{error}</div>}
          {success && <div className="api-success">{success}</div>}

          {/* Photo upload */}
          <div className="fg">
            <div className="lbl">Профайл зураг <span className="lbl-h">— 2MB хүртэл</span></div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <div className="photo-grid">
              <div
                className="ph-main"
                onClick={() => fileInputRef.current?.click()}
                style={avatarPreview ? { padding: 0, overflow: 'hidden' } : {}}
              >
                {avatarPreview ? (
                  <>
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    <div className="ph-main-badge">ГОЛ</div>
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', transition: '.2s',
                    }}
                      className="ph-overlay"
                    >
                      <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, opacity: 0 }} className="ph-change-lbl">Солих</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="ph-main-plus">+</div>
                    <div className="ph-main-lbl">Гол зураг</div>
                    <div className="ph-main-badge">ГОЛ</div>
                  </>
                )}
              </div>
              {[2,3,4,5].map(n => (
                <div key={n} className="ph-sec">
                  <div className="ph-sec-ico">+</div>
                  <div className="ph-sec-lbl">Зураг {n}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="fg">
            <label className="lbl">Нэр <span className="req">*</span></label>
            <input
              className="inp"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Major + Year */}
          <div className="row2">
            <div className="fg">
              <label className="lbl">Мэргэжил <span className="req">*</span></label>
              <select
                className="inp"
                style={{ cursor: 'pointer' }}
                value={major}
                onChange={e => setMajor(e.target.value)}
              >
                {['Программ хангамж','МТ','Бизнес','Эдийн засаг','Хууль','Математик','Дизайн'].map(m => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="fg">
              <label className="lbl">Дамжаа <span className="req">*</span></label>
              <div className="pill-row">
                {[1,2,3,4,5,6].map(y => (
                  <button
                    key={y}
                    className={`pill${year === y ? ' on' : ''}`}
                    onClick={() => setYear(y)}
                    type="button"
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="fg">
            <label className="lbl">
              Товч танилцуулга{' '}
              <span className="lbl-h">({bio.length}/300)</span>
            </label>
            <textarea
              className="inp"
              rows="3"
              style={{ resize: 'none' }}
              value={bio}
              maxLength={300}
              onChange={e => setBio(e.target.value)}
            />
          </div>

          {/* Interests */}
          <div className="fg">
            <label className="lbl">Сонирхол <span className="lbl-h">— хэд ч дарж болно</span></label>
            <div className="pill-row" style={{ marginTop: '10px' }}>
              {ALL_INTERESTS.map(item => (
                <button
                  key={item}
                  className={`pill${interests.includes(item) ? ' on' : ''}`}
                  onClick={() => toggleInterest(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div className="fg">
            <label className="lbl">Хамтрах зорилго <span className="lbl-h">— хэд ч сонгож болно</span></label>
            <div className="goal-grid">
              {ALL_GOALS.map(g => (
                <button
                  key={g.id}
                  className={`goal-card${goals.includes(g.name) ? ' on' : ''}`}
                  onClick={() => toggleGoal(g.name)}
                  type="button"
                >
                  <span className="goal-icon">{g.icon}</span>
                  <span className="goal-name">{g.name}</span>
                  <span className="goal-check">✓</span>
                </button>
              ))}
            </div>
          </div>

          {/* MBTI */}
          <div className="fg">
            <label className="lbl">MBTI <span className="lbl-h">— нэгийг сонгоно уу</span></label>
            <div className="mbti-hint">
              Мэдэхгүй бол{' '}
              <a href="https://www.16personalities.com/mn" target="_blank" rel="noreferrer" className="mbti-link">
                16personalities.com
              </a>{' '}
              дээр тест өг
            </div>
            <div className="mbti-picker">
              {MBTI_GROUPS.map(group => (
                <div key={group.label} className="mbti-group">
                  <div className="mbti-group-label">{group.label}</div>
                  <div className="mbti-group-pills">
                    {group.types.map(type => (
                      <button
                        key={type}
                        className={`mbti-pill${mbti === type ? ' on' : ''}`}
                        onClick={() => setMbti(mbti === type ? null : type)}
                        type="button"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div>
                <button
                  className={`mbti-pill${mbti === '' ? ' on' : ''}`}
                  style={{ borderStyle: 'dashed', color: 'var(--dim)' }}
                  onClick={() => setMbti('')}
                  type="button"
                >
                  ❓ Мэдэхгүй
                </button>
              </div>
            </div>

            {mbti != null && mbti !== '' && (
              <div className="mbti-selected">
                <span className="mbti-selected-badge">{mbti}</span>
                <span className="mbti-selected-txt">
                  сонгогдлоо —{' '}
                  <span className="mbti-change" onClick={() => setMbti(null)} style={{ cursor: 'pointer' }}>
                    солих
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* SNS */}
          <div className="fg">
            <label className="lbl">SNS <span className="lbl-h">— заавал биш</span></label>
            <div className="sns-list">
              <div className="sns-row">
                <span className="sns-lbl">Instagram</span>
                <input
                  className="inp"
                  placeholder="@username"
                  style={{ padding: '10px 14px' }}
                  value={instagram}
                  onChange={e => setInstagram(e.target.value)}
                />
              </div>
              <div className="sns-row">
                <span className="sns-lbl">Facebook</span>
                <input
                  className="inp"
                  placeholder="facebook.com/..."
                  style={{ padding: '10px 14px' }}
                  value={facebook}
                  onChange={e => setFacebook(e.target.value)}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer buttons */}
        <div className="setup-foot">
          <button className="back-btn" onClick={() => navigate('/otp')}>← Буцах</button>
          <button className="next-btn" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner"></span> Хадгалж байна...</> : 'Дараах: Хуваарь →'}
          </button>
        </div>

      </div>
    </>
  );
};

export default Setup;
