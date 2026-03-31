import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Loader2, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/api';
import useAuthStore from '../store/useAuthStore';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // We route through standard login, but the backend token generation identifies role
      const resp = await authService.login(formData);
      if (resp.data.success) {
        const userRole = resp.data.data.role;
        // Strictly prevent passenger/driver accounts from locking on this portal
        if (userRole !== 'admin' && userRole !== 'employee') {
           setError('Access Denied. Elevated privileges required.');
           return;
        }
        setAuth(resp.data.data, resp.data.data.token);
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 relative overflow-hidden font-outfit">
      {/* Dark corporate grid background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 blur-[1px]"></div>
      
      {/* Security Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#111] w-full max-w-sm p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10">
        
        <div className="flex flex-col items-center mb-8 text-center text-white">
          <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center text-red-500 shadow-xl border border-red-500/20 mb-5 relative">
            <ShieldCheck size={32} />
            <div className="absolute -right-1 -top-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">System Architecture</h1>
          <p className="text-gray-400 font-medium text-xs uppercase tracking-widest">Restricted Zone</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 text-red-400 rounded-xl text-center text-xs font-bold uppercase tracking-wider shadow-inner border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
           <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Mail size={16} /></div>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="Administrator Email" 
                className="w-full h-12 bg-black/50 border border-white/10 focus:border-red-500/50 rounded-xl pl-12 pr-4 outline-none font-medium text-sm text-gray-200 transition-colors" />
           </div>
           
           <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Lock size={16} /></div>
              <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="Access Code" 
                className="w-full h-12 bg-black/50 border border-white/10 focus:border-red-500/50 rounded-xl pl-12 pr-4 outline-none font-medium text-sm text-gray-200 transition-colors" />
           </div>

           <button type="submit" disabled={loading} 
              className="w-full h-14 bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-xl shadow-red-900/20 rounded-xl flex items-center justify-center gap-2 transition-all mt-6 uppercase tracking-wider">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Authenticate Terminal <Server size={18} /></>}
           </button>
        </form>

        <div className="mt-8 text-center">
           <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">RouteSync Security Matrix</span>
        </div>
      </motion.div>
    </div>
  );
};
