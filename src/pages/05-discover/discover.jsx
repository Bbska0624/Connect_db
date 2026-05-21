import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './discover.css';
import Navbar from '../../shared/Navbar';
import { getAvatarColor } from '../../utils/match-logic';
import { getStudents, connectStudent, passStudent } from '../../services/discoverService';

const Discover = () => {
  const navigate = useNavigate();

  const [viewMode,     setViewMode]     = useState('swipe');
  const [students,     setStudents]     = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading,      setLoading]      = useState(true);

  // GET /api/discover/students
  useEffect(() => {
    getStudents().then(res => {
      if (res.success) setStudents(res.data);
      setLoading(false);
    });
  }, []);

  const currentStudent = students[currentIndex];

  // Build the state object passed to /chat when opening a conversation
  const buildOpenUser = (student) => ({
    id:          String(student._id ?? student.id),
    name:        student.name,
    avatar:      student.avatar,
    avatarUrl:   student.avatarUrl || '',
    avatarStyle: student.avatarStyle ?? getAvatarColor(String(student._id ?? student.id)),
    isOnline:    student.isOnline,
  });

  // POST /api/discover/pass/:id
  const handlePass = async () => {
    if (!currentStudent) return;
    await passStudent(currentStudent.id);
    setCurrentIndex(prev => prev + 1);
  };

  // POST /api/discover/connect/:id → navigate directly to chat
  const handleConnect = async () => {
    if (!currentStudent) return;
    await connectStudent(currentStudent.id);
    navigate('/chat', { state: { openUser: buildOpenUser(currentStudent) } });
  };

  const handleRestart = () => {
    setLoading(true);
    setCurrentIndex(0);
    getStudents().then(res => {
      if (res.success) setStudents(res.data);
      setLoading(false);
    });
  };

  // Open chat from list view
  const handleListItemClick = (student) => {
    navigate('/chat', { state: { openUser: buildOpenUser(student) } });
  };

  return (
    <>
      <Navbar />

      <div className="app-shell">
        {/* Sidebar navigation */}
        <aside className="icon-nav">
          <div className="nav-logo-sm">N</div>
          <div className="n-ico on" title="Discover">💫</div>
          <div className="n-ico" title="Чат" onClick={() => navigate('/chat')}>💬</div>
          <div className="n-ico" title="Хуваарь" onClick={() => navigate('/schedule')}>📅</div>
          <div className="n-sep"></div>
          <div className="n-ico" title="Premium" onClick={() => navigate('/premium')}>👑</div>
          <div className="n-ico" title="Тохиргоо" onClick={() => navigate('/setup')}>⚙️</div>
          <div
            className="nav-ava"
            title="Профайл"
            onClick={() => navigate('/setup')}
            style={{ cursor: 'pointer' }}
          >
            {(() => {
              const raw = localStorage.getItem('auth_user');
              try { const u = JSON.parse(raw); return u.avatar || '😊'; } catch { return '😊'; }
            })()}
          </div>
        </aside>

        <main className="feed-main">
          <div className="feed-top">
            <div>
              <div className="feed-h">Discover <span>💫</span></div>
              <div className="feed-sub">Таны хуваарьтай таарсан оюутнууд</div>
            </div>
            <div className="feed-right">
              <div className="vtgl">
                <button className={`vt ${viewMode === 'swipe' ? 'on' : ''}`} onClick={() => setViewMode('swipe')}>🃏 Swipe</button>
                <button className={`vt ${viewMode === 'list'  ? 'on' : ''}`} onClick={() => setViewMode('list')}>☰ Жагсаалт</button>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
              <span className="spinner" style={{ width: 32, height: 32 }}></span>
            </div>
          )}

          {/* SWIPE VIEW */}
          {!loading && viewMode === 'swipe' && (
            <div className="swipe-view">
              <div className="card-stack">
                {currentIndex < students.length ? (
                  <div className="sw-card">
                    <div className="sw-photo" style={{ background: getAvatarColor(currentStudent.id) }}>
                      {currentStudent.avatarUrl ? (
                        <img
                          src={currentStudent.avatarUrl}
                          alt={currentStudent.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="sw-emo">{currentStudent.avatar}</div>
                      )}
                      <div className="sw-badge-top">📅 {currentStudent.match}% таарсан</div>
                      <div className="sw-online">● {currentStudent.isOnline ? 'Онлайн' : 'Офлайн'}</div>
                    </div>
                    <div className="sw-info">
                      <div className="sw-name">
                        {currentStudent.name}
                        <span className="sw-mbti-tag">{currentStudent.mbti}</span>
                      </div>
                      <div className="sw-meta">{currentStudent.major} · {currentStudent.year}-р курс</div>
                      <div className="sw-tags">
                        {currentStudent.interests.map((tag, i) => (
                          <span key={i} className="sw-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="sw-acts">
                      <button className="act-btn act-pass" onClick={handlePass}>
                        <div className="act-c">✕</div>
                        <span className="act-lbl">Алгасах</span>
                      </button>
                      <button className="act-btn act-like" onClick={handleConnect}>
                        <div className="act-c">🤝</div>
                        <span className="act-lbl">Холбогдох</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="end-state" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '48px' }}>🎉</div>
                    <h3>Бүх картыг үзэж дууслаа!</h3>
                    <button className="btn btn-p" style={{ marginTop: '16px' }} onClick={handleRestart}>
                      Дахин эхлэх
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LIST VIEW */}
          {!loading && viewMode === 'list' && (
            <div className="list-view active">
              {students.map(student => (
                <div
                  key={student.id}
                  className="user-card"
                  onClick={() => handleListItemClick(student)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="u-av" style={{ background: getAvatarColor(student.id) }}>
                    {student.avatarUrl
                      ? <img src={student.avatarUrl} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      : student.avatar
                    }
                    {student.isOnline && <div className="u-dot"></div>}
                  </div>
                  <div className="u-info">
                    <div className="u-namerow">
                      <span className="u-name">{student.name}</span>
                      <span className="u-mbti">{student.mbti}</span>
                    </div>
                    <div className="u-meta">{student.major} · {student.year}-р курс</div>
                  </div>
                  <div className="u-right">
                    <div className="score-ring">
                      <div className="sr-n">{student.match}%</div>
                      <div className="sr-l">таарсан</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Discover;
