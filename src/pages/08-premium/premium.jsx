import { useState, useEffect } from 'react';
import './premium.css';
import Navbar from '../../shared/Navbar';
import { getPlans, getStatus, subscribe } from '../../services/premiumService';

const Premium = () => {
  const [plans,       setPlans]       = useState([]);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading,     setLoading]     = useState(true);
  const [subscribing, setSubscribing] = useState(null); // planId being subscribed
  const [toast,       setToast]       = useState(null);

  // GET /api/premium/plans  +  GET /api/premium/status
  useEffect(() => {
    Promise.all([getPlans(), getStatus()]).then(([plansRes, statusRes]) => {
      if (plansRes.success)  setPlans(plansRes.data);
      if (statusRes.success) setCurrentPlan(statusRes.data.currentPlan);
      setLoading(false);
    });
  }, []);

  // POST /api/premium/subscribe
  const handleSubscribe = async (planId) => {
    if (planId === currentPlan) return;
    setSubscribing(planId);
    const res = await subscribe(planId);
    setSubscribing(null);
    if (res.success) {
      setCurrentPlan(planId);
      setToast(res.message);
      setTimeout(() => setToast(null), 3000);
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

      <div className="prem-page">

        {toast && (
          <div className="api-success" style={{ textAlign: 'center', marginBottom: '20px' }}>
            {toast}
          </div>
        )}

        <div className="prem-badge">🚀 NumConnect Багцууд</div>

        <div className="prem-h">
          Илүү ихийг<br />
          <em>холбогдож</em> нээ
        </div>
        <div className="prem-sub">
          Бүлгийн суралцлага, хэн таныг харсныг мэдэх,
          Discover-д тэргүүлэх — бүгд энд.
        </div>

        {/* Plan cards — rendered from GET /api/premium/plans */}
        <div className="price-grid">
          {plans.map(plan => (
            <div key={plan.id} className={`pc${plan.highlighted ? ' best' : ''}`}>
              {plan.badge && <div className="pc-pop">{plan.badge}</div>}

              <div className="pc-plan" style={plan.highlighted ? { color: 'var(--accent)' } : {}}>
                {plan.name}
              </div>
              <div className="pc-amt" style={plan.highlighted ? { color: 'var(--accent)' } : {}}>
                {plan.priceLabel}
              </div>
              <div className="pc-per">
                {plan.period}
                {plan.periodSub && <span className="pc-coffee"> · {plan.periodSub}</span>}
              </div>

              <ul className="pc-feat">
                {plan.features.map((feat, i) => (
                  <li key={i}>
                    <span className={feat.included ? 'pf-yes' : 'pf-no'}>
                      {feat.included ? '✓' : '✗'}
                    </span>
                    {!feat.included && <span>{feat.text}</span>}
                    {feat.included && feat.text}
                  </li>
                ))}
              </ul>

              {/* Action button */}
              {plan.id === currentPlan ? (
                <button className="btn btn-s btn-full" style={{ opacity: 0.6, cursor: 'default' }} disabled>
                  Одоогийн багц
                </button>
              ) : (
                <button
                  className={`btn ${plan.highlighted ? 'btn-p' : 'btn-s'} btn-full`}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscribing === plan.id}
                >
                  {subscribing === plan.id
                    ? <><span className="spinner"></span> Боловсруулж байна...</>
                    : `${plan.name} сонгох →`}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="prem-note">
          🔒 QPay · Хэдийд ч цуцлах боломжтой · Эхний 7 хоног үнэгүй
        </div>

      </div>
    </>
  );
};

export default Premium;
