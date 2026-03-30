import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navigation, User, ChevronRight, Mail, Lock, ShieldCheck, Car, Key, Smartphone as Phone, ArrowRight, X, Loader2, Gauge, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../services/api';
import useAuthStore from '../store/useAuthStore';

export const Register = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', password: '', role: 'passenger',
    vehicleNumber: '', vehicleType: 'auto', vehicleModel: '', capacity: 3,
    otp: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const setRole = (role) => setFormData({ ...formData, role });

  const handleStepOneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate driver requirements
    if (formData.role === 'driver') {
      if (!formData.vehicleNumber) {
        setError("Vehicle Plate Number highly required for fleet operations.");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await authService.sendRegistrationOTP({ email: formData.email });
      if (res.data.success) {
        setInfo(res.data.message);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Mail Relay Failure');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const resp = await authService.register(formData);
      if (resp.data.success) {
        setAuth(resp.data.data, resp.data.data.token);
        navigate(resp.data.data.role === 'driver' ? '/driver' : '/ride');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration Unsuccessful. Check Node Constraints');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const resp = await authService.googleLogin(response.credential);
      if (resp.data.success) {
        setAuth(resp.data.data, resp.data.data.token);
        navigate(resp.data.data.role === 'driver' ? '/driver' : '/ride');
      }
    } catch (err) {
      setError('Google Link Failure');
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-6 relative overflow-hidden font-outfit">
      <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px]"></div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass w-full max-w-lg p-6 lg:p-8 rounded-3xl border border-white/40 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto scrollbar-hidden">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl mb-4"><Navigation size={28} /></div>
          <h1 className="text-2xl font-bold text-primary tracking-tight mb-1">Sign Up</h1>
          <p className="text-text-muted font-medium text-xs">Create a new account</p>
        </div>

        {error && <div className="mb-6 p-4 bg-error/10 text-error rounded-xl text-center text-xs font-black uppercase tracking-tighter shadow-inner border border-error/20 flex flex-col items-center justify-center line-clamp-2">{error}</div>}
        {info && step === 2 && !error && <div className="mb-6 p-4 bg-success/10 text-success rounded-xl text-center text-xs font-black uppercase tracking-tighter shadow-inner border border-success/20">{info}</div>}

        <AnimatePresence mode="wait">
          {step === 1 ? (
             <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                 <div className="flex flex-col gap-5 mb-6">
                   <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Login Failed')} useOneTap />
                   <div className="flex items-center gap-4 py-2"><div className="h-px flex-1 bg-gray-200"></div><span className="text-xs font-medium text-text-muted">Or continue with email</span><div className="h-px flex-1 bg-gray-200"></div></div>
                </div>

                 <div className="grid grid-cols-2 gap-4 mb-6">
                   <button type="button" onClick={() => setRole('passenger')} className={`flex items-center justify-center gap-2 p-3 border-2 rounded-2xl transition-all ${formData.role === 'passenger' ? 'border-primary bg-primary/5 text-primary shadow-[inset_0_0_15px_rgba(99,102,241,0.1)]' : 'border-white bg-white/50 text-text-muted hover:border-gray-200'}`}>
                      <User size={16} className={formData.role === 'passenger' ? 'text-primary' : 'text-gray-400'} /><span className="text-sm font-bold">Passenger</span>
                   </button>
                   <button type="button" onClick={() => setRole('driver')} className={`flex items-center justify-center gap-2 p-3 border-2 rounded-2xl transition-all ${formData.role === 'driver' ? 'border-primary bg-primary/5 text-primary shadow-[inset_0_0_15px_rgba(99,102,241,0.1)]' : 'border-white bg-white/50 text-text-muted hover:border-gray-200'}`}>
                      <Car size={16} className={formData.role === 'driver' ? 'text-primary' : 'text-gray-400'} /><span className="text-sm font-bold">Driver</span>
                   </button>
                </div>

                <form onSubmit={handleStepOneSubmit} className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="relative group">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40"><User size={16} /></div>
                         <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Full Name" className="w-full h-12 bg-white/40 border-2 border-white focus:border-primary/50 rounded-2xl pl-12 pr-4 outline-none font-medium text-sm transition-colors" />
                      </div>
                      <div className="relative group">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40"><Mail size={16} /></div>
                         <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="Email Address" className="w-full h-12 bg-white/40 border-2 border-white focus:border-primary/50 rounded-2xl pl-12 pr-4 outline-none font-medium text-sm transition-colors" />
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="relative group">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40"><Phone size={16} /></div>
                         <input type="text" name="phone" required value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="w-full h-12 bg-white/40 border-2 border-white focus:border-primary/50 rounded-2xl pl-12 pr-4 outline-none font-medium text-sm transition-colors" />
                      </div>
                      <div className="relative group">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40"><Lock size={16} /></div>
                         <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="Password" className="w-full h-12 bg-white/40 border-2 border-white focus:border-primary/50 rounded-2xl pl-12 pr-4 outline-none font-medium text-sm transition-colors" />
                      </div>
                   </div>

                   {/* Driver Profiling Fields */}
                   <AnimatePresence>
                     {formData.role === 'driver' && (
                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="mt-4 p-5 rounded-3xl bg-primary/5 border border-primary/20 space-y-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Car size={16} className="text-secondary" />
                                <h3 className="text-xs font-bold text-primary">Vehicle Details</h3>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-3">
                                <input type="text" name="vehicleNumber" required value={formData.vehicleNumber} onChange={handleChange} placeholder="Vehicle Plate (e.g. DL1C-1234)" className="w-full h-12 bg-white/60 border border-white focus:border-secondary/50 rounded-xl px-4 outline-none font-medium text-sm transition-colors uppercase" />
                                <div className="flex gap-2">
                                  <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="h-12 flex-1 bg-white/60 border border-white focus:border-secondary/50 rounded-xl px-4 outline-none font-medium text-sm text-text-muted appearance-none cursor-pointer transition-colors">
                                     <option value="auto">Auto Rickshaw</option>
                                     <option value="e-rickshaw">E-Rickshaw</option>
                                     <option value="van">Mini Van</option>
                                  </select>
                                  <div className="relative group w-24">
                                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/60"><Users size={14} /></div>
                                     <input type="number" min="1" max="15" name="capacity" value={formData.capacity} onChange={handleChange} title="Seats" className="w-full h-12 bg-white/60 border border-white focus:border-secondary/50 rounded-xl pl-9 pr-2 outline-none font-bold text-sm text-primary transition-colors" />
                                  </div>
                                </div>
                                <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="Vehicle Model (e.g. Bajaj RE)" className="w-full h-12 bg-white/60 border border-white focus:border-secondary/50 rounded-xl px-4 outline-none font-medium text-sm transition-colors" />
                              </div>
                          </div>
                       </motion.div>
                     )}
                   </AnimatePresence>

                   <button type="submit" disabled={loading} className="btn btn-primary w-full h-14 text-sm font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 group mt-6 !rounded-2xl flex items-center justify-center gap-2 transition-all">
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <>Sign Up <ArrowRight size={18} /></>}
                   </button>
                </form>
             </motion.div>
          ) : (
             <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col items-center">
                 <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary mb-6"><Key size={28} /></div>
                 <h2 className="text-2xl font-bold text-primary mb-2 tracking-tight">Verify Email</h2>
                 <p className="text-sm text-text-muted font-medium text-center mb-6">A 6-digit OTP has been sent to <br/> <span className="text-primary font-bold">{formData.email}</span></p>
                 
                 <form onSubmit={handleFinalSubmit} className="w-full space-y-6">
                    <input type="text" name="otp" required value={formData.otp} onChange={handleChange} placeholder="• • • • • •" className="w-full h-16 bg-white/60 border-2 border-white focus:border-primary/50 rounded-2xl text-center outline-none font-black text-2xl tracking-[0.5em] transition-colors" maxLength={6} />
                    
                    <button type="submit" disabled={loading} className="btn btn-primary w-full h-14 shadow-xl shadow-primary/20 font-bold text-sm !rounded-2xl flex items-center justify-center gap-2 transition-all">
                       {loading ? <Loader2 className="animate-spin" size={18} /> : <>Verify & Register <CheckCircle2 size={18} /></>}
                    </button>
                    
                    <button type="button" onClick={() => setStep(1)} className="w-full text-xs font-semibold text-text-muted hover:text-primary transition-colors text-center">
                       Edit Details
                    </button>
                 </form>
             </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-8 pt-6 border-t border-gray-100/50 flex items-center justify-center gap-2">
           <span className="text-sm text-text-muted font-medium">Already have an account?</span>
           <Link to="/login" className="text-primary font-bold text-sm hover:underline underline-offset-4 ml-1">Sign In</Link>
        </footer>
      </motion.div>
    </div>
  );
};
