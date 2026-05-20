import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './otp.css';
import Navbar from '../../shared/Navbar';
import { verifyOtp } from '../../services/authService';

const OTP_LENGTH = 6;

const Otp = () => {
  const navigate = useNavigate();

  // Pre-fill first 3 digits matching the demo OTP (427831)
  const [digits, setDigits]   = useState(['4', '2', '7', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Handle individual digit input
  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // digits only
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError(null);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Allow backspace to move to previous box
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // POST /api/auth/verify-otp
  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length < OTP_LENGTH) {
      setError('6 оронтой кодоо бүтнээр оруулна уу');
      return;
    }
    setError(null);
    setLoading(true);
    const email = sessionStorage.getItem('otp_email') ?? '20B1NUM0042@stud.num.edu.mn';
    const res = await verifyOtp(email, code);
    setLoading(false);
    if (res.success) {
      const isNewUser = sessionStorage.getItem('is_new_user') === 'true';
      navigate(isNewUser ? '/setup' : '/discover');
    } else {
      setError(res.message);
    }
  };

  const handleResend = () => {
    setTimeLeft(300);
    setDigits(['', '', '', '', '', '']);
    setError(null);
    inputRefs.current[0]?.focus();
  };

  const email = sessionStorage.getItem('otp_email') ?? '20B1NUM0042@stud.num.edu.mn';

  return (
    <>
      <Navbar />

      <div className="otp-wrap">
        <div className="otp-card">

          <div className="otp-icon">📨</div>

          <div className="otp-title">Код оруулна уу</div>
          <div className="otp-sub">
            <strong>{email}</strong> руу<br />
            6 оронтой код илгээлээ
          </div>

          {error && <div className="api-error" style={{ textAlign: 'center' }}>{error}</div>}

          {/* 6 individual digit inputs */}
          <div className="otp-inputs">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => (inputRefs.current[i] = el)}
                className={`otp-inp${d ? ' filled' : ''}`}
                maxLength={1}
                value={d}
                placeholder="·"
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
              />
            ))}
          </div>

          <div className="otp-timer">
            {timeLeft > 0
              ? <>Хүчинтэй: <span>{formatTime(timeLeft)}</span></>
              : <span style={{ color: 'var(--err)' }}>Код хугацаа дууслаа</span>}
          </div>

          <button
            className="btn btn-p btn-full"
            onClick={handleVerify}
            disabled={loading || digits.join('').length < OTP_LENGTH}
          >
            {loading ? <><span className="spinner"></span> Шалгаж байна...</> : 'Баталгаажуулах →'}
          </button>

          <div className="otp-resend-row">
            Код ирсэнгүй?{' '}
            <span
              className="otp-resend"
              onClick={handleResend}
              style={{ cursor: 'pointer' }}
            >
              Дахин илгээх
            </span>
          </div>

        </div>
      </div>
    </>
  );
};

export default Otp;
