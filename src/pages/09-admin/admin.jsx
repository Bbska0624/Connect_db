import { useState, useEffect, useCallback } from 'react';
import './admin.css';
import Navbar from '../../shared/Navbar';
import { getDashboard, getUsers, blockUser, getReports } from '../../services/adminService';

const PLAN_LABELS = { premium: '👑 Premium', pro: '⚡ Pro', free: 'Free' };
const PLAN_CLASSES = { premium: 'bg-prem', pro: 'bg-prem', free: 'bg-free' };
const STATUS_LABELS = { active: 'Идэвхтэй', reported: 'Тайлагдсан', blocked: 'Блоклогдсон' };
const STATUS_CLASSES = { active: 'bg-ok', reported: 'bg-bad', blocked: 'bg-bad' };

const Admin = () => {
  const [kpis,     setKpis]     = useState(null);
  const [dau,      setDau]      = useState([]);
  const [metrics,  setMetrics]  = useState(null);
  const [users,    setUsers]    = useState([]);
  const [reports,  setReports]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('Бүгд');
  const [blocking, setBlocking] = useState(null); // id being blocked

  // GET /api/admin/dashboard  +  GET /api/admin/users  +  GET /api/admin/reports
  useEffect(() => {
    Promise.all([getDashboard(), getUsers(), getReports()]).then(([dash, usersRes, repsRes]) => {
      if (dash.success)     { setKpis(dash.data.kpis); setDau(dash.data.dau); setMetrics(dash.data.metrics); }
      if (usersRes.success) setUsers(usersRes.data);
      if (repsRes.success)  setReports(repsRes.data);
      setLoading(false);
    });
  }, []);

  // GET /api/admin/users?search=&filter= — re-fetch on search/filter change
  const fetchUsers = useCallback(async (q, f) => {
    const res = await getUsers(q, f);
    if (res.success) setUsers(res.data);
  }, []);

  useEffect(() => {
    if (!loading) fetchUsers(search, filter);
  }, [search, filter]);

  // PUT /api/admin/users/:id/block
  const handleBlock = async (id) => {
    setBlocking(id);
    const res = await blockUser(id);
    if (res.success) setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'blocked' } : u));
    setBlocking(null);
  };

  const maxDau = dau.length ? Math.max(...dau.map(d => d.value)) : 1;

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

      <div className="admin-pg">

        {/* Header */}
        <div className="adm-hd">
          <div>
            <div className="adm-label">⚙️ Admin Panel</div>
            <div className="adm-title">Dashboard</div>
            <div className="adm-sub">NumConnect системийн тойм</div>
          </div>
          <div className="adm-date">📅 2025-06-01 · Лхагва</div>
        </div>

        {/* KPI cards — from GET /api/admin/dashboard */}
        <div className="kpi-row">
          <div className="kpi">
            <div className="kpi-ico ki-a">👥</div>
            <div className="kpi-l">Нийт хэрэглэгч</div>
            <div className="kpi-n kn-a">{kpis?.totalUsers?.toLocaleString()}</div>
            <div className="kpi-ch">↑ +{kpis?.totalUsersChange}% энэ долоо хоног</div>
          </div>
          <div className="kpi">
            <div className="kpi-ico ki-b">💬</div>
            <div className="kpi-l">Өдрийн идэвхтэй</div>
            <div className="kpi-n kn-b">{kpis?.dailyActive}</div>
            <div className="kpi-ch">↑ +{kpis?.dailyActiveChange}% өчигдөртэй харьцуулахад</div>
          </div>
          <div className="kpi">
            <div className="kpi-ico ki-w">🤝</div>
            <div className="kpi-l">Нийт холболт</div>
            <div className="kpi-n kn-w">{kpis?.totalConnections?.toLocaleString()}</div>
            <div className="kpi-ch">↑ +{kpis?.totalConnectionsChange}% энэ сар</div>
          </div>
          <div className="kpi">
            <div className="kpi-ico ki-g">👑</div>
            <div className="kpi-l">Premium хэрэглэгч</div>
            <div className="kpi-n kn-g">{kpis?.premiumUsers}</div>
            <div className="kpi-ch">↑ +{kpis?.conversionRate}% конверс</div>
          </div>
        </div>

        {/* Main grid */}
        <div className="adm-grid">

          {/* ── Left column ── */}
          <div>

            {/* DAU chart — from GET /api/admin/dashboard */}
            <div className="adm-card" style={{ marginBottom: '18px' }}>
              <div className="adm-ch">
                <div className="adm-ct">📈 DAU — 7 хоног</div>
                <div className="adm-ch-sub">Энэ долоо хоног</div>
              </div>
              <div className="chart-area">
                {dau.map((entry, i) => (
                  <div
                    key={i}
                    className="cb2"
                    style={{ height: `${Math.round((entry.value / maxDau) * 100)}%` }}
                  >
                    <div className="cb2-val">{entry.value}</div>
                  </div>
                ))}
              </div>
              <div className="chart-days">
                {dau.map((entry, i) => (
                  <div key={i} className="cd">{entry.day}</div>
                ))}
              </div>
            </div>

            {/* Users table — from GET /api/admin/users */}
            <div className="adm-card">
              <div className="adm-ch">
                <div className="adm-ct">👥 Хэрэглэгчид</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    className="adm-inp"
                    placeholder="🔍 Хайх..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <select
                    className="adm-inp"
                    style={{ cursor: 'pointer' }}
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                  >
                    <option>Бүгд</option>
                    <option>Premium</option>
                    <option>Free</option>
                  </select>
                </div>
              </div>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th className="adm-th">Хэрэглэгч</th>
                    <th className="adm-th">Мэргэжил</th>
                    <th className="adm-th">Курс</th>
                    <th className="adm-th">Төрөл</th>
                    <th className="adm-th">Статус</th>
                    <th className="adm-th">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td className="adm-td" colSpan={6} style={{ textAlign: 'center', color: 'var(--sub)' }}>Хэрэглэгч олдсонгүй</td></tr>
                  ) : users.map(user => (
                    <tr key={user.id} className="adm-tr">
                      <td className="adm-td">
                        <div className="uc">
                          <div className="ua">{user.avatar}</div>
                          <div>
                            <div className="un">{user.name}</div>
                            <div className="ue">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="adm-td">{user.major}</td>
                      <td className="adm-td">{user.year}</td>
                      <td className="adm-td">
                        <span className={`badge ${PLAN_CLASSES[user.plan] ?? 'bg-free'}`}>
                          {PLAN_LABELS[user.plan] ?? user.plan}
                        </span>
                      </td>
                      <td className="adm-td">
                        <span className={`badge ${STATUS_CLASSES[user.status] ?? 'bg-ok'}`}>
                          {STATUS_LABELS[user.status] ?? user.status}
                        </span>
                      </td>
                      <td className="adm-td">
                        <button className="adm-act aa-view">Харах</button>
                        <button
                          className="adm-act aa-block"
                          onClick={() => handleBlock(user.id)}
                          disabled={blocking === user.id || user.status === 'blocked'}
                        >
                          {blocking === user.id
                            ? <span className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }}></span>
                            : user.status === 'blocked' ? 'Блоклогдсон' : 'Блок'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* ── Right column ── */}
          <div>

            {/* Reports — from GET /api/admin/reports */}
            <div className="adm-card" style={{ marginBottom: '18px' }}>
              <div className="adm-ch">
                <div className="adm-ct">🚨 Гомдлууд</div>
                <span className="badge bg-bad">
                  {reports.filter(r => r.status === 'open').length} нээлттэй
                </span>
              </div>
              <div className="rep-list">
                {reports.map(rep => (
                  <div key={rep.id} className="rep-item">
                    <div className="rep-ico">{rep.icon}</div>
                    <div>
                      <div className="rep-t">{rep.title}</div>
                      <div className="rep-s">{rep.description}</div>
                    </div>
                    <div className="rep-st">
                      <span className={`badge ${rep.status === 'open' ? 'bg-bad' : 'bg-ok'}`}>
                        {rep.status === 'open' ? 'Нээлттэй' : 'Шийдвэрлэсэн'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics — from GET /api/admin/dashboard */}
            <div className="adm-card">
              <div className="adm-ch">
                <div className="adm-ct">📊 Үзүүлэлтүүд</div>
              </div>
              <div className="qs-list">
                <div className="qs-row">
                  <div className="qs-l">Match score</div>
                  <div className="qs-n qs-a">{metrics?.matchScore}%</div>
                </div>
                <div className="qs-row">
                  <div className="qs-l">Чат хариу</div>
                  <div className="qs-n qs-b">{metrics?.chatResponseRate}%</div>
                </div>
                <div className="qs-row">
                  <div className="qs-l">Premium conv.</div>
                  <div className="qs-n qs-c">{metrics?.premiumConversion}%</div>
                </div>
                <div className="qs-row">
                  <div className="qs-l">Үнэлгээ</div>
                  <div className="qs-n qs-d">{metrics?.rating} ★</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
