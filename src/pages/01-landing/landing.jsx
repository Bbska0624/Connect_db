import { useEffect, useState } from 'react';
import './landing.css';
import Navbar from '../../shared/Navbar';
import { getStats } from '../../services/statsService';

const Landing = () => {
  const [stats, setStats] = useState(null);

  // GET /api/stats — populate hero counters
  useEffect(() => {
    getStats().then(res => { if (res.success) setStats(res.data); });
  }, []);

  const fmt = (val, suffix = '') =>
    stats == null
      ? <span className="skeleton" style={{ display: 'inline-block', width: 60, height: 24 }}>&nbsp;</span>
      : `${val.toLocaleString()}${suffix}`;

  return (
    <>
      <Navbar />

      <div className="land">
        {/* Дотоод nav */}
        <nav className="land-nav">
          <div className="land-logo">
            Num<span>Connect</span>
            <span className="logo-badge">МУИС</span>
          </div>
          <div className="land-links">
            <span className="land-link">Онцлог</span>
            <span className="land-link">Хэрхэн ажилладаг</span>
            <span className="land-link">Premium</span>
            <button className="btn btn-p" style={{ padding: '10px 24px', fontSize: '13px' }}>
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
            <button className="btn btn-p">Үнэгүй эхлэх →</button>
            <button className="btn btn-s">Хэрхэн ажилладаг вэ</button>
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

        {/* Stats — data from GET /api/stats */}
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

        {/* Features */}
        <div className="feat-section">
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
              <div className="feat-p">Зөвхөн @num.edu.mn цахим шуудантай оюутнууд нэвтрэх боломжтой.</div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Landing;
