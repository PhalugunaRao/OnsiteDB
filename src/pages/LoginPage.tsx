import { useEffect, useMemo, useRef, useState } from 'react';
import type { ClipboardEvent, FormEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, Phone, RotateCcw, ShieldCheck } from 'lucide-react';

import { api } from '../api/mock';
import { useStore } from '../store';

const indianMobilePattern = /^(\+91)?[6-9]\d{9}$/;

const normalizeIndianMobile = (value: string) => {
  const compact = value.replace(/[\s-]/g, '').trim();
  return compact.startsWith('+91') ? compact.slice(3) : compact;
};

const getMobileError = (value: string) => {
  const compact = value.replace(/[\s-]/g, '').trim();
  if (!compact) return 'Mobile number is required.';
  if (compact.startsWith('+') && !compact.startsWith('+91')) return 'Only Indian mobile numbers with +91 are supported.';
  if (!/^(\+91)?\d+$/.test(compact)) return 'Use digits only, with optional +91 prefix.';
  if (!indianMobilePattern.test(compact)) return 'Enter a 10-digit Indian number starting with 6, 7, 8, or 9.';
  return '';
};

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mobileInput, setMobileInput] = useState('');
  const [verifiedMobile, setVerifiedMobile] = useState('');
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
  const [touchedMobile, setTouchedMobile] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const setAgent = useStore(state => state.setAgent);
  const setActiveCamps = useStore(state => state.setActiveCamps);
  const navigate = useNavigate();

  const mobileError = useMemo(() => getMobileError(mobileInput), [mobileInput]);
  const otp = otpDigits.join('');
  const maskedMobile = verifiedMobile ? `+91 ${verifiedMobile.slice(0, 2)}****${verifiedMobile.slice(-4)}` : '';

  useEffect(() => {
    if (step === 'otp') {
      window.setTimeout(() => otpRefs.current[0]?.focus(), 40);
    }
  }, [step]);

  const onPhoneSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouchedMobile(true);
    setErrorMsg('');
    setInfoMsg('');
    if (mobileError) return;

    const normalizedMobile = normalizeIndianMobile(mobileInput);
    try {
      setLoading(true);
      await api.validateAgent(normalizedMobile);
      setVerifiedMobile(normalizedMobile);
      setStep('otp');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to validate agent.');
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (otp.length !== 6 || loading) return;

    try {
      setLoading(true);
      setErrorMsg('');
      setInfoMsg('');
      const res = await api.verifyOtp(verifiedMobile, otp);
      setAgent(res.agent!);
      setActiveCamps(res.activeCamps);
      navigate('/select-camp');
    } catch (err: unknown) {
      setOtpDigits(Array(6).fill(''));
      otpRefs.current[0]?.focus();
      setErrorMsg(err instanceof Error ? err.message : 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const updateOtpDigit = (index: number, rawValue: string) => {
    const digit = rawValue.replace(/\D/g, '').slice(-1);
    setOtpDigits(prev => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    if (!pastedDigits.length) return;
    setOtpDigits(Array.from({ length: 6 }, (_, index) => pastedDigits[index] || ''));
    otpRefs.current[Math.min(pastedDigits.length, 6) - 1]?.focus();
  };

  const goBackToMobile = () => {
    setStep('phone');
    setErrorMsg('');
    setInfoMsg('');
    setOtpDigits(Array(6).fill(''));
  };

  return (
    <div className="ds-card elevated mx-4 p-5 sm:mx-0 sm:p-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-lt text-brand">
          <Activity size={26} />
        </div>
        <h1 className="mt-3 text-[28px] font-bold leading-tight text-n-900">Onsite Healthcare</h1>
      </div>

      {errorMsg && (
        <div className="mb-5 rounded-md border border-rose-m bg-rose-lt p-3 text-sm font-medium text-rose">
          {errorMsg}
        </div>
      )}

      {infoMsg && (
        <div className="mb-5 rounded-md border border-green-m bg-green-lt p-3 text-sm font-medium text-green">
          {infoMsg}
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={onPhoneSubmit} className="space-y-5">
          <div className="ds-field">
            <label htmlFor="mobile" className="ds-label">Mobile Number</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-n-400" size={18} />
              <input
                id="mobile"
                className="ds-input pl-10 text-base"
                placeholder="Enter Indian Mobile Number"
                inputMode="tel"
                autoComplete="tel"
                value={mobileInput}
                onBlur={() => setTouchedMobile(true)}
                onChange={(event) => {
                  setMobileInput(event.target.value);
                  setErrorMsg('');
                }}
              />
            </div>
            {touchedMobile && mobileError ? (
              <p className="ds-error">{mobileError}</p>
            ) : (
              <p className="ds-helper">Use +91XXXXXXXXXX or a 10-digit Indian number.</p>
            )}
          </div>
          <button type="submit" disabled={loading || !!mobileError} className={`btn btn-primary btn-lg w-full ${loading ? 'btn-loading' : ''}`}>
            Continue
          </button>
        </form>
      ) : (
        <form onSubmit={onOtpSubmit} className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-green-lt text-green">
              <ShieldCheck size={23} />
            </div>
            <h2 className="text-xl font-bold text-n-900">Verification</h2>
            <p className="mt-2 text-sm leading-6 text-n-600">
              Enter the 6-digit OTP sent to your mobile number
              <span className="mt-1 block font-mono font-semibold text-n-900">{maskedMobile}</span>
            </p>
          </div>

          <div>
            <label className="ds-label text-center">One Time Password</label>
            <div className="mt-2 grid grid-cols-6 gap-2 sm:gap-3">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(node) => {
                    otpRefs.current[index] = node;
                  }}
                  aria-label={`OTP digit ${index + 1}`}
                  className="h-12 rounded-md border border-n-200 bg-white text-center font-mono text-xl font-bold text-n-900 shadow-sm transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-m sm:h-14"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={digit}
                  onChange={(event) => updateOtpDigit(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  onPaste={handleOtpPaste}
                />
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading || otp.length !== 6} className={`btn btn-primary btn-lg w-full ${loading ? 'btn-loading' : ''}`}>
            Verify OTP
          </button>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={goBackToMobile} className="btn btn-secondary w-full sm:w-auto">
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              onClick={() => {
                setOtpDigits(Array(6).fill(''));
                setInfoMsg('A fresh OTP has been sent.');
                otpRefs.current[0]?.focus();
              }}
              className="btn btn-tertiary w-full sm:w-auto"
            >
              <RotateCcw size={16} /> Resend OTP
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
