import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navigation, User, ChevronRight, Mail, Lock, ShieldCheck, Car, Key, Smartphone, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../services/api';
import useAuthStore from '../store/useAuthStore';

export const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Password Reset State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP/New Pass
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const resp = await authService.login(formData);
      if (resp.data.success) {
        setAuth(resp.data.data, resp.data.data.token);
        if (resp.data.data.role === 'admin' || resp.data.data.role === 'employee') {
          navigate('/admin');
        } else {
          navigate(resp.data.data.role === 'driver' ? '/driver' : '/ride');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login Failed. Check Credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const resp = await authService.googleLogin(response.credential);
      if (resp.data.success) {
        setAuth(resp.data.data, resp.data.data.token);
        if (resp.data.data.role === 'admin' || resp.data.data.role === 'employee') {
          navigate('/admin');
        } else {
          navigate(resp.data.data.role === 'driver' ? '/driver' : '/ride');
        }
      }
    } catch (err) {
      setError('Google Link Failure');
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.requestOTP(resetEmail);
      setResetStep(2);
    } catch (err) {
      setError('OTP Relay Failure');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.resetPassword({ email: resetEmail, otp: resetOtp, newPassword });
      setShowResetModal(false);
      setResetStep(1);
      setError('Security Pin Updated. Proceed to Login.');
    } catch (err) {
      setError('Pin Update Failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px]"></div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass w-full max-w-xl p-8 lg:p-10 rounded-3xl border border-white/40 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl mb-6"><Navigation size={28} /></div>
          <h1 className="text-3xl font-bold font-outfit text-primary tracking-tight mb-2">Sign In</h1>
          <p className="text-text-muted font-medium text-xs">Welcome back to RouteSync</p>
        </div>

        {error && <div className={`mb-8 p-4 rounded-xl text-center text-sm font-black uppercase tracking-tighter ${error.includes('Success') || error.includes('Proceed') ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>{error}</div>}

        <div className="flex flex-col gap-6">
           <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Login Failed')} useOneTap />
           <div className="flex items-center gap-4 py-2"><div className="h-px flex-1 bg-gray-200"></div><span className="text-xs font-medium text-text-muted">Or continue with</span><div className="h-px flex-1 bg-gray-200"></div></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
             <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary"><Mail size={18} /></div>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="Email Address" className="w-full h-14 bg-white/50 border-2 border-white focus:border-primary/50 rounded-2xl pl-12 pr-6 outline-none font-medium text-sm transition-all shadow-inner" />
             </div>
             <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary"><Lock size={18} /></div>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="Password" className="w-full h-14 bg-white/50 border-2 border-white focus:border-primary/50 rounded-2xl pl-12 pr-6 outline-none font-medium text-sm transition-all shadow-inner" />
             </div>
          </div>

          <div className="flex items-center justify-between px-2">
             <label className="flex items-center gap-2 cursor-pointer group"><input type="checkbox" className="hidden" /><div className="w-5 h-5 rounded-md border-2 border-primary group-hover:bg-primary/10 transition-colors"></div><span className="text-sm font-medium text-text-muted">Remember Me</span></label>
             <button type="button" onClick={() => setShowResetModal(true)} className="text-sm font-medium text-secondary hover:underline underline-offset-4">Forgot Password?</button>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full h-14 text-base shadow-xl shadow-primary/30 hover:shadow-primary/50 group mt-4 !rounded-2xl">
             {loading ? 'Signing In...' : 'Sign In'} <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <footer className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-center gap-2">
           <span className="text-sm text-text-muted font-medium">Don't have an account?</span>
           <Link to="/register" className="text-primary font-bold text-sm hover:underline underline-offset-4 ml-1">Sign Up</Link>
        </footer>
      </motion.div>

      {/* Reset Password Modal (Simplified Internal Protocol) */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowResetModal(false)} className="absolute inset-0 bg-primary/40 backdrop-blur-3xl"></motion.div>
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="glass w-full max-w-md p-8 lg:p-10 rounded-3xl relative z-10 border border-white/60 shadow-inner">
               <button onClick={() => setShowResetModal(false)} className="absolute top-6 right-6 text-primary hover:rotate-90 transition-transform"><X size={24} /></button>
               <h3 className="text-2xl font-bold font-outfit text-primary mb-2">Reset Password</h3>
               <p className="text-xs text-text-muted font-medium mb-8">Enter your email to receive a reset link</p>
               
               {resetStep === 1 ? (
                 <form onSubmit={handleRequestOTP} className="space-y-6">
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-bold"><Mail size={18} /></div>
                      <input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="Email Address" className="w-full h-14 bg-white/40 border-2 border-white focus:border-primary/50 rounded-2xl pl-12 pr-6 outline-none font-medium text-sm" />
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary w-full h-14 text-sm font-bold !rounded-2xl shadow-lg shadow-primary/20">Send Reset Link <ArrowRight size={18} /></button>
                 </form>
               ) : (
                 <form onSubmit={handleResetPassword} className="space-y-6">
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary"><Smartphone size={18} /></div>
                      <input type="text" required value={resetOtp} onChange={(e) => setResetOtp(e.target.value)} placeholder="OTP Code" className="w-full h-14 bg-white/40 border-2 border-white focus:border-primary/50 rounded-2xl pl-12 pr-6 outline-none font-medium text-sm" />
                    </div>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary"><Key size={18} /></div>
                      <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" className="w-full h-14 bg-white/40 border-2 border-white focus:border-primary/50 rounded-2xl pl-12 pr-6 outline-none font-medium text-sm" />
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary w-full h-14 text-sm font-bold !rounded-2xl shadow-lg shadow-primary/20">Update Password</button>
                    <button type="button" onClick={() => setResetStep(1)} className="w-full text-sm font-medium text-primary hover:underline">Cancel & Retry</button>
                 </form>
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
