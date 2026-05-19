import { useState, useEffect } from 'react';
import './discover.css';
import Navbar from '../../shared/Navbar';
import { getAvatarColor } from '../../utils/match-logic';
import { getStudents, connectStudent, passStudent } from '../../services/discoverService';

const Discover = () => {
  const [viewMode,      setViewMode]      = useState('swipe');
  const [students,      setStudents]      = useState([]);
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [showModal,     setShowModal]     = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [connectedName, setConnectedName] = useState('');

  // GET /api/discover/students
  useEffect(() => {
    getStudents().then(res => {
      if (res.success) setStudents(res.data);
      setLoading(false);
    });
  }, []);

  const currentStudent = students[currentIndex];

  // POST /api/discover/pass/:id
  const handlePass = async () => {
    if (!currentStudent) return;
    await passStudent(currentStudent.id);
    setCurrentIndex(prev => prev + 1);
  };

  // POST /api/discover/connect/:id
  const handleConnect = async () => {
    if (!currentStudent) return;
    const res = await connectStudent(currentStudent.id);
    setConnectedName(res.data?.name ?? '');
    setShowModal(true);
    setCurrentIndex(prev => prev + 1);
  };

  const handleRestart = () => {
    // Reload fresh list
    setLoading(true);
    setCurrentIndex(0);
    getStudents().then(res => {
      if (res.success) setStudents(res.data);
      setLoading(false);
    });
  };

  return (
    <>
      <Navbar />

      {/* CONNECT MODAL */}
      <div className={`modal-ov ${showModal ? 'show' : ''}`}>
        <div className="match-modal">
          <div className="mm-sparkle">🎉</div>
          <div className="mm-title">Connect!</div>
          <div className="mm-sub">{connectedName}-тай холбогдохыг хүсэж байна!</div>
          <div className="mm-avs">
            <div className="mm-av">😊</div>
            <div className="mm-heart">🤝</div>
            <div className="mm-av" style={{ background: currentStudent ? getAvatarColor(currentStudent.id) : '' }}>
              {students[currentIndex - 1]?.avatar ?? '👤'}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn btn-p btn-full" onClick={() => setShowModal(false)}>💬 Чат эхлүүлэх</button>
            <button className="btn btn-s btn-full" onClick={() => setShowModal(false)}>Дараа</button>
          </div>
        </div>
      </div>

      <div className="app-shell">
        <aside className="icon-nav">
          <div className="nav-logo-sm">N</div>
          <div className="n-ico on">💫</div>
          <div className="n-ico">💬<div className="n-badge">3</div></div>
          <div className="n-ico">🤝</div>
          <div className="n-sep"></div>
          <div className="n-ico">📅</div>
          <div className="n-ico">👑</div>
          <div className="n-ico">⚙️</div>
          <div className="nav-ava">😊</div>
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
                      <div className="sw-emo">{currentStudent.avatar}</div>
                      <div className="sw-badge-top">📅 {currentStudent.match}% таарсан</div>
                      <div className="sw-online">● {currentStudent.status === 'online' ? 'Онлайн' : 'Офлайн'}</div>
                    </div>
                    <div className="sw-info">
                      <div className="sw-name">
                        {currentStudent.name}, {currentStudent.age}
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
                  onClick={() => { setConnectedName(student.name); setShowModal(true); }}
                >
                  <div className="u-av" style={{ background: getAvatarColor(student.id) }}>
                    {student.avatar}
                    {student.status === 'online' && <div className="u-dot"></div>}
                  </div>
                  <div className="u-info">
                    <div className="u-namerow">
                      <span className="u-name">{student.name}, {student.age}</span>
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
