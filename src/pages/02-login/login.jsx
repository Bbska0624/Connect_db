import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import Navbar from '../../shared/Navbar';
import { requestOtp } from '../../services/authService';

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail]     = useState('20B1NUM0042@stud.num.edu.mn');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // POST /api/auth/request-otp
  const handleOtpRequest = async () => {
    setError(null);
    setLoading(true);
    const res = await requestOtp(email);
    setLoading(false);
    if (res.success) {
      navigate('/otp');
    } else {
      setError(res.message);
    }
  };

  return (
    <>
      <Navbar />

      <div className="login-wrap">
        <div className="login-card">

          <div className="login-top">
            <div className="login-logo">Num<span>Connect</span></div>
            <div className="login-tag">МУИС оюутнуудын платформ</div>
          </div>

          <div className="login-body">
            <div className="login-title">Нэвтрэх</div>
            <div className="login-sub">Outlook цахим шуудангаараа нэвтэрнэ үү</div>

            {/* Error banner */}
            {error && <div className="api-error">{error}</div>}

            {/* Email */}
            <div className="fg">
              <label className="lbl">Цахим шуудан</label>
              <input
                className="inp"
                type="email"
                placeholder="20B1NUM0042@stud.num.edu.mn"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null); }}
                onKeyDown={e => e.key === 'Enter' && handleOtpRequest()}
              />
              <div className="inp-hint">@stud.num.edu.mn хаяг шаардлагатай</div>
            </div>

            {/* Primary action */}
            <button
              className="btn btn-p btn-full"
              onClick={handleOtpRequest}
              disabled={loading}
            >
              {loading ? <><span className="spinner"></span> Илгээж байна...</> : 'OTP код авах →'}
            </button>

            <div className="or-row">эсвэл</div>

            <button className="btn btn-s btn-full">🏫 Outlook OAuth-аар нэвтрэх</button>
          </div>

          <div className="login-footer">
            Анх удаа уу? Профайл автоматаар үүснэ.
            <br />
            <span className="login-terms">Үйлчилгээний нөхцөл</span>
          </div>

        </div>
      </div>
    </>
  );
};

export default Login;
