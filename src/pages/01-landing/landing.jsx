import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './landing.css';
import Navbar from '../../shared/Navbar';
import { getStats } from '../../services/statsService';

const Landing = () => {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  const featuresRef   = useRef(null);
  const howItWorksRef = useRef(null);

  useEffect(() => {
    getStats().then(res => { if (res.success) setStats(res.data); });
  }, []);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth' });

  const fmt = (val, suffix = '') =>
    stats == null
      ? <span className="skeleton" style={{ display: 'inline-block', width: 60, height: 24 }}>&nbsp;</span>
      : `${val.toLocaleString()}${suffix}`;

  return (
    <>
      <Navbar />

      <div className="land">
        {/* Inner nav */}
        <nav className="land-nav">
          <div className="land-logo">
            Num<span>Connect</span>
            <span className="logo-badge">МУИС</span>
          </div>
          <div className="land-links">
            <span className="land-link" onClick={() => scrollTo(featuresRef)}>Онцлог</span>
            <span className="land-link" onClick={() => scrollTo(howItWorksRef)}>Хэрхэн ажилладаг</span>
            <span className="land-link" onClick={() => navigate('/premium')}>Premium</span>
            <button
              className="btn btn-p"
              style={{ padding: '10px 24px', fontSize: '13px' }}
              onClick={() => navigate('/login')}
            >
              Нэвтрэх →
            </button>
          </div>
        </nav>

        {/* Hero */}
        <div className="land-hero">
          <div className="land-eyebrow">
            <span className="eyebrow-dot"></span>
            МУИС оюутнуудад зориулсан
          </div>
          <h1 className="land-h1">
            Хуваарьдаа<br />
            <em>таарсан</em><br />
            найзаа ол
          </h1>
          <p className="land-p">
            Outlook цахим шуудангаараа нэвтэрч,
            хичээлийн хуваарьдаа тохирсон оюутнуудтай холбогд.
          </p>
          <div className="land-btns">
            <button className="btn btn-p" onClick={() => navigate('/login')}>Үнэгүй эхлэх →</button>
            <button className="btn btn-s" onClick={() => scrollTo(howItWorksRef)}>Хэрхэн ажилладаг вэ</button>
          </div>

          {/* Phone mockups */}
          <div className="phone-wrap">
            <div className="phone phone1">
              <div className="ph-notch"></div>
              <div className="ph-card ph-c3">
                <div className="ph-emo">🧑‍🔬</div>
                <div className="ph-name">Батмөнх</div>
                <div className="ph-sub">Эдийн засаг · 2-р курс</div>
                <div className="ph-tag">📅 72% таарсан</div>
              </div>
            </div>
            <div className="phone phone2">
              <div className="ph-notch"></div>
              <div className="ph-card ph-c1">
                <div className="ph-emo">👩‍💻</div>
                <div className="ph-name">Номинчимэг</div>
                <div className="ph-sub">Программ хангамж · 3-р курс</div>
                <div className="ph-tag">🤝 87% таарсан</div>
              </div>
            </div>
            <div className="phone phone3">
              <div className="ph-notch"></div>
              <div className="ph-card ph-c2">
                <div className="ph-emo">👩‍🎨</div>
                <div className="ph-name">Энхтуяа</div>
                <div className="ph-sub">Дизайн · 1-р курс</div>
                <div className="ph-tag">⭐ 79% таарсан</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-n">{fmt(stats?.activeUsers)}</span>
            <span className="stat-l">Идэвхтэй оюутан</span>
          </div>
          <div className="stat-item">
            <span className="stat-n">{fmt(stats?.matchRate, '%')}</span>
            <span className="stat-l">Хуваарийн таарц</span>
          </div>
          <div className="stat-item">
            <span className="stat-n">{fmt(stats?.totalConnections)}</span>
            <span className="stat-l">Холболт хийгдсэн</span>
          </div>
          <div className="stat-item">
            <span className="stat-n">{stats == null ? <span className="skeleton" style={{ display: 'inline-block', width: 48, height: 24 }}>&nbsp;</span> : `${stats.rating}★`}</span>
            <span className="stat-l">Үнэлгээ</span>
          </div>
        </div>

        {/* How it works */}
        <div ref={howItWorksRef} id="how-it-works" className="hiw-section">
          <div className="feat-hd">Хэрхэн ажилладаг вэ?</div>
          <div className="feat-sub">3 энгийн алхамаар эхлээрэй</div>
          <div className="hiw-steps">
            <div className="hiw-step">
              <div className="hiw-num">1</div>
              <div className="hiw-ico">📧</div>
              <div className="hiw-title">Outlook-аар нэвтрэх</div>
              <div className="hiw-p">@stud.num.edu.mn хаягаараа нэвтэрч, профайлаа үүсгэ. Зөвхөн МУИС оюутнуудад нэвтрэх боломжтой.</div>
            </div>
            <div className="hiw-step">
              <div className="hiw-num">2</div>
              <div className="hiw-ico">📅</div>
              <div className="hiw-title">Хуваарь тохируулах</div>
              <div className="hiw-p">Долоо хоногийн чөлөөт болон хичээлтэй цагаа хялбархан тэмдэглэ. Систем автоматаар таарцыг тооцооллоно.</div>
            </div>
            <div className="hiw-step">
              <div className="hiw-num">3</div>
              <div className="hiw-ico">🤝</div>
              <div className="hiw-title">Оюутнуудтай холбогдох</div>
              <div className="hiw-p">Хуваарьтай таарсан оюутнуудыг олж, дотноо чатлаж, хамт суралцаарай.</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button className="btn btn-p" style={{ fontSize: '15px', padding: '14px 36px' }} onClick={() => navigate('/login')}>
              Одоо эхлэх →
            </button>
          </div>
        </div>

        {/* Features */}
        <div ref={featuresRef} id="features" className="feat-section">
          <div className="feat-hd">Яагаад NumConnect вэ?</div>
          <div className="feat-sub">Зүгээр л танилцах биш — зорилготой хамтрагч ол</div>
          <div className="feat-grid">
            <div className="feat-card">
              <div className="feat-ico ico-a">📅</div>
              <div className="feat-t">Хуваарь таарсан</div>
              <div className="feat-p">Outlook хуваарьтай таарсан оюутнуудыг автоматаар санал болгоно.</div>
            </div>
            <div className="feat-card">
              <div className="feat-ico ico-g">🎯</div>
              <div className="feat-t">Зорилготой холболт</div>
              <div className="feat-p">Хамт суралцах, проект хийх, судалгаа хийх зорилгоор холбогдоно.</div>
            </div>
            <div className="feat-card">
              <div className="feat-ico ico-b">🔒</div>
              <div className="feat-t">МУИС verified</div>
              <div className="feat-p">Зөвхөн @stud.num.edu.mn цахим шуудантай оюутнууд нэвтрэх боломжтой.</div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Landing;
