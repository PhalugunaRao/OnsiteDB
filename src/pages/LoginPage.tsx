import { useEffect, useMemo, useRef, useState } from 'react';
import type { ClipboardEvent, FormEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, CheckCircle2, Phone, RotateCcw, ShieldCheck } from 'lucide-react';

import { api } from '../api/mock';
import { useStore } from '../store';

const countries = [
  { code: 'IN', name: 'India', dialCode: '+91', pattern: /^[6-9]\d{9}$/ },
];

const formatCountdown = (seconds: number) => `00:${String(seconds).padStart(2, '0')}`;

const normalizeMobile = (value: string) => value.replace(/\D/g, '').slice(0, 10);

const getMobileError = (value: string, touched: boolean) => {
  if (!value) return touched ? 'Mobile number required' : '';
  if (value.length !== 10 || !countries[0].pattern.test(value)) return 'Enter valid mobile number';
  return '';
};

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [selectedCountryCode, setSelectedCountryCode] = useState('IN');
  const [mobileInput, setMobileInput] = useState('');
  const [verifiedMobile, setVerifiedMobile] = useState('');
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
  const [touchedMobile, setTouchedMobile] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [otpErrorNonce, setOtpErrorNonce] = useState(0);
  const mobileRef = useRef<HTMLInputElement | null>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const setAgent = useStore(state => state.setAgent);
  const setActiveCamps = useStore(state => state.setActiveCamps);
  const navigate = useNavigate();

  const selectedCountry = countries.find(country => country.code === selectedCountryCode) || countries[0];
  const mobileError = useMemo(() => getMobileError(mobileInput, touchedMobile), [mobileInput, touchedMobile]);
  const isMobileValid = selectedCountry.pattern.test(mobileInput);
  const otp = otpDigits.join('');
  const maskedMobile = verifiedMobile ? `${selectedCountry.dialCode} ${verifiedMobile.slice(0, 2)}****${verifiedMobile.slice(-4)}` : '';

  useEffect(() => {
    window.setTimeout(() => mobileRef.current?.focus(), 60);
  }, []);

  useEffect(() => {
    if (step === 'otp') window.setTimeout(() => otpRefs.current[0]?.focus(), 50);
  }, [step]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setInterval(() => {
      setResendIn(current => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  const onPhoneSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouchedMobile(true);
    setErrorMsg('');
    setInfoMsg('');
    if (!isMobileValid) return;

    try {
      setLoading(true);
      await api.validateAgent(mobileInput);
      setVerifiedMobile(mobileInput);
      setOtpDigits(Array(6).fill(''));
      setResendIn(30);
      setStep('otp');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to send OTP');
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
      setAuthSuccess(true);
      window.setTimeout(() => {
        setAgent(res.agent!);
        setActiveCamps(res.activeCamps);
        navigate('/select-camp');
      }, 350);
    } catch (err: unknown) {
      setOtpDigits(Array(6).fill(''));
      setOtpErrorNonce(nonce => nonce + 1);
      otpRefs.current[0]?.focus();
      setErrorMsg(err instanceof Error ? err.message : 'Invalid OTP');
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
    setErrorMsg('');
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) otpRefs.current[index - 1]?.focus();
    if (event.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    if (!pastedDigits.length) return;
    setOtpDigits(Array.from({ length: 6 }, (_, index) => pastedDigits[index] || ''));
    otpRefs.current[Math.min(pastedDigits.length, 6) - 1]?.focus();
  };

  const resendOtp = async () => {
    if (resendIn > 0 || loading) return;
    try {
      setLoading(true);
      setErrorMsg('');
      await api.resendOtp(verifiedMobile);
      setOtpDigits(Array(6).fill(''));
      setInfoMsg('OTP sent');
      setResendIn(30);
      otpRefs.current[0]?.focus();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const goBackToMobile = () => {
    setStep('phone');
    setErrorMsg('');
    setInfoMsg('');
    setOtpDigits(Array(6).fill(''));
    window.setTimeout(() => mobileRef.current?.focus(), 50);
  };

  return (
    <div className="ds-card elevated mx-4 overflow-hidden p-0 sm:mx-0">
      <div className="border-b border-n-100 bg-white px-5 py-7 text-center sm:px-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-lt text-brand">
          <Activity size={26} />
        </div>
        <h1 className="text-[26px] font-bold leading-tight text-n-900">Onsite Healthcare</h1>
      </div>

      <div className="p-5 sm:p-8">
        {errorMsg && (
          <div key={otpErrorNonce} className="mb-5 rounded-md border border-rose-m bg-rose-lt p-3 text-sm font-semibold text-rose animate-shake">
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="mb-5 rounded-md border border-green-m bg-green-lt p-3 text-sm font-semibold text-green">
            {infoMsg}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={onPhoneSubmit} className="space-y-5">
            <div className="ds-field">
              <label htmlFor="mobile" className="ds-label">Mobile Number</label>
              <div className="flex rounded-md border border-n-200 bg-white shadow-sm transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand-m">
                <select
                  className="min-h-12 rounded-l-md border-0 border-r border-n-200 bg-n-50 px-3 text-sm font-semibold text-n-900 outline-none"
                  value={selectedCountryCode}
                  onChange={(event) => setSelectedCountryCode(event.target.value)}
                  aria-label="Country code"
                >
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>{country.dialCode} {country.name}</option>
                  ))}
                </select>
                <div className="relative min-w-0 flex-1">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-n-400" size={18} />
                  <input
                    ref={mobileRef}
                    id="mobile"
                    className="h-12 w-full rounded-r-md border-0 bg-white pl-10 pr-3 text-base font-semibold text-n-900 outline-none placeholder:font-normal placeholder:text-n-400"
                    placeholder="9876543210"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    value={mobileInput}
                    onBlur={() => setTouchedMobile(true)}
                    onChange={(event) => {
                      setMobileInput(normalizeMobile(event.target.value));
                      setTouchedMobile(true);
                      setErrorMsg('');
                    }}
                  />
                </div>
              </div>
              {mobileError && <p className="ds-error">{mobileError}</p>}
            </div>
            <button type="submit" disabled={loading || !isMobileValid} className={`btn btn-primary btn-lg w-full ${loading ? 'btn-loading' : ''}`}>
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={onOtpSubmit} className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-lt text-brand">
                {authSuccess ? <CheckCircle2 size={23} /> : <ShieldCheck size={23} />}
              </div>
              <h2 className="text-xl font-bold text-n-900">{authSuccess ? 'Verified' : 'Verification'}</h2>
              <p className="mt-2 text-sm leading-6 text-n-600">
                Enter the 6-digit OTP sent to
                <span className="mt-1 block font-mono font-semibold text-n-900">{maskedMobile}</span>
              </p>
            </div>

            <div className="grid grid-cols-6 gap-2 sm:gap-3">
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
                  enterKeyHint="done"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => updateOtpDigit(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  onPaste={handleOtpPaste}
                />
              ))}
            </div>

            <button type="submit" disabled={loading || otp.length !== 6 || authSuccess} className={`btn btn-primary btn-lg w-full ${loading ? 'btn-loading' : ''}`}>
              Verify OTP
            </button>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={goBackToMobile} className="btn btn-secondary w-full sm:w-auto">
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={resendOtp}
                disabled={resendIn > 0 || loading}
                className="btn btn-tertiary w-full sm:w-auto"
              >
                <RotateCcw size={16} />
                {resendIn > 0 ? `Resend OTP in ${formatCountdown(resendIn)}` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
