import { useState } from 'react';

import { api } from '../api/mock';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const phoneSchema = z.object({
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits')
});
const otpSchema = z.object({
  otp: z.string().length(4, 'OTP must be 4 digits')
});

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mobile, setMobile] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const setAgent = useStore(state => state.setAgent);
  const setActiveCamps = useStore(state => state.setActiveCamps);
  const navigate = useNavigate();

  const phoneForm = useRHForm({ resolver: zodResolver(phoneSchema) });
  const otpForm = useRHForm({ resolver: zodResolver(otpSchema) });

  const onPhoneSubmit = async (data: any) => {
    try {
      setLoading(true);
      setErrorMsg('');
      await api.validateAgent(data.mobile);
      setMobile(data.mobile);
      setStep('otp');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to validate agent');
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async (data: any) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.verifyOtp(mobile, data.otp);
      setAgent(res.agent!);
      setActiveCamps(res.activeCamps);
      navigate('/select-camp');
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ds-card elevated p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-n-900 mb-2">Onsite Dashboard</h1>
        <p className="text-sm text-n-600">Agent Authentication</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 bg-rose-lt border border-rose text-rose rounded-md text-sm">
          {errorMsg}
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
          <div>
            <label className="ds-label">Mobile Number</label>
            <input 
              {...phoneForm.register('mobile')} 
              className="ds-input" 
              placeholder="Enter mobile number" 
            />
            {phoneForm.formState.errors.mobile && (
              <p className="text-xs text-rose mt-1">{phoneForm.formState.errors.mobile.message as string}</p>
            )}
          </div>
          <button type="submit" disabled={loading} className={`btn btn-brand w-full ${loading ? 'btn-loading' : ''}`}>
            {loading ? 'Continuing...' : 'Continue'}
          </button>
        </form>
      ) : (
        <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
          <div>
            <label className="ds-label">OTP</label>
            <input 
              {...otpForm.register('otp')} 
              className="ds-input" 
              placeholder="Enter 4-digit OTP" 
              maxLength={4}
            />
            {otpForm.formState.errors.otp && (
              <p className="text-xs text-rose mt-1">{otpForm.formState.errors.otp.message as string}</p>
            )}
          </div>
          <button type="submit" disabled={loading} className={`btn btn-brand w-full ${loading ? 'btn-loading' : ''}`}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button type="button" onClick={() => setStep('phone')} className="btn btn-tertiary w-full mt-2">
            Back
          </button>
        </form>
      )}
    </div>
  );
}
