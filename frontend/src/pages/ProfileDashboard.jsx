import React, { useState, useEffect } from 'react';
import { authService } from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { User, Mail, Smartphone, Car, Settings, CheckCircle, ShieldAlert, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProfileDashboard = () => {
  const { setAuth } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '', phone: '', role: '', vehicleNumber: '', vehicleType: 'auto', vehicleModel: '', capacity: 3
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authService.getProfile();
      const pd = res.data.data;
      setProfile(pd);
      setFormData({
        name: pd.name || '',
        phone: pd.phone?.number || '',
        role: pd.role || 'passenger',
        vehicleNumber: pd.driverDetails?.vehicle?.number === 'PENDING' ? '' : (pd.driverDetails?.vehicle?.number || ''),
        vehicleType: pd.driverDetails?.vehicle?.type || 'auto',
        vehicleModel: pd.driverDetails?.vehicle?.model || '',
        capacity: pd.driverDetails?.vehicle?.capacity || 3
      });
    } catch (err) {
      setError('System integration failed to pull User Node');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    if (formData.role === 'driver' && (!formData.vehicleNumber || !formData.vehicleModel)) {
      setError('Matrix rules require full vehicle tracking metrics to operate as Driver.');
      setSaving(false);
      return;
    }

    try {
      const res = await authService.updateProfile(formData);
      setSuccess('Profile Node synchronized.');
      const tk = localStorage.getItem('token');
      // Auth data updated
      setAuth(res.data.data, tk);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Sync Exception. Terminal Offline');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center bg-bg-light"><Loader2 className="animate-spin text-primary" size={32}/></div>
  );

  return (
    <div className="min-h-screen bg-bg-light font-outfit p-4 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="glass flex items-center gap-4 p-5 rounded-3xl mb-6 shadow-sm border border-white/60">
           {profile?.profilePhoto?.url ? (
             <img src={profile.profilePhoto.url} alt="Profile" className="w-16 h-16 rounded-2xl shadow-md border-2 border-white object-cover" />
           ) : (
             <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold uppercase shadow-inner border border-white/40">
               {profile?.name?.[0] || <User size={28} />}
             </div>
           )}
           <div>
             <h1 className="text-xl font-bold text-primary tracking-tight">{profile?.name}</h1>
             <p className="text-xs font-semibold text-text-muted capitalize">Role: {profile?.role}</p>
           </div>
        </div>

        {error && <div className="mb-4 p-4 bg-error/10 text-error rounded-xl text-center text-xs font-black uppercase tracking-widest">{error}</div>}
        {success && <div className="mb-4 p-4 bg-success/10 text-success rounded-xl text-center text-xs font-black uppercase tracking-widest">{success}</div>}

        <form onSubmit={handleSubmit} className="glass p-6 md:p-8 rounded-3xl shadow-lg border border-white/60 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative group">
                <label className="text-xs font-semibold text-text-muted ml-2">Full Name</label>
                <div className="relative mt-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40"><User size={16} /></div>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full h-12 bg-white/50 border-2 border-white focus:border-primary/50 rounded-2xl pl-10 pr-4 outline-none font-medium text-sm shadow-inner transition-colors" />
                </div>
              </div>
              <div className="relative group">
                <label className="text-xs font-semibold text-text-muted ml-2">Email Address <span className="text-primary italic text-[10px] ml-1">Locked</span></label>
                <div className="relative mt-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40"><Mail size={16} /></div>
                  <input type="email" value={profile.email?.address || ''} readOnly className="w-full h-12 bg-gray-100/50 border-2 border-white rounded-2xl pl-10 pr-4 outline-none font-medium text-sm text-text-muted cursor-not-allowed shadow-inner" />
                </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative group">
                <label className="text-xs font-semibold text-text-muted ml-2">Phone Number</label>
                <div className="relative mt-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40"><Smartphone size={16} /></div>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full h-12 bg-white/50 border-2 border-white focus:border-primary/50 rounded-2xl pl-10 pr-4 outline-none font-medium text-sm shadow-inner transition-colors" placeholder="e.g. +91 999999999" />
                </div>
              </div>
              <div className="relative group">
                <label className="text-xs font-semibold text-text-muted ml-2 flex items-center justify-between">
                  <span>Role</span>
                  {profile.role === 'admin' || profile.role === 'employee' ? <span className="text-error italic text-[10px]">Immutable</span> : null}
                </label>
                <div className="relative mt-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40"><Settings size={16} /></div>
                  {profile.role === 'admin' || profile.role === 'employee' ? (
                     <input type="text" value={profile.role} readOnly className="w-full h-12 bg-gray-100/50 border-2 border-white rounded-2xl pl-10 pr-4 outline-none font-medium text-sm text-text-muted cursor-not-allowed capitalize" />
                  ) : (
                    <select name="role" value={formData.role} onChange={handleChange} className="w-full h-12 bg-white/50 border-2 border-white focus:border-primary/50 rounded-2xl pl-10 pr-4 outline-none font-medium text-sm appearance-none shadow-inner text-primary">
                      <option value="passenger">Passenger</option>
                      <option value="driver">Driver</option>
                    </select>
                  )}
                </div>
              </div>
           </div>

           {formData.role === 'driver' && (
             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 p-5 rounded-3xl bg-primary/5 border border-primary/20 space-y-4 shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Car className="text-secondary" size={20} />
                    <h2 className="font-bold text-primary text-sm">Vehicle Details</h2>
                  </div>
                  {profile.driverDetails?.verificationStatus === 'pending' && <span className="px-3 py-1 bg-warning/20 text-warning text-xs font-semibold rounded-lg">Pending Verification</span>}
                  {profile.driverDetails?.verificationStatus === 'approved' && <span className="px-3 py-1 bg-success/20 text-success text-xs font-semibold rounded-lg">Approved</span>}
                  {profile.driverDetails?.verificationStatus === 'rejected' && <span className="px-3 py-1 bg-error/20 text-error text-xs font-semibold rounded-lg">Rejected</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="text-xs font-semibold text-text-muted ml-2 mb-1 block">Vehicle Number</label>
                     <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} placeholder="Required" className="w-full h-10 bg-white border border-white focus:border-secondary/50 rounded-xl px-4 outline-none font-medium text-sm shadow-sm uppercase" />
                   </div>
                   <div>
                     <label className="text-xs font-semibold text-text-muted ml-2 mb-1 block">Vehicle Type</label>
                     <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full h-10 bg-white border border-white focus:border-secondary/50 rounded-xl px-4 outline-none font-medium text-sm shadow-sm text-text-muted">
                        <option value="auto">Auto Rickshaw</option>
                        <option value="e-rickshaw">E-Rickshaw</option>
                        <option value="van">Mini Van</option>
                     </select>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="text-xs font-semibold text-text-muted ml-2 mb-1 block">Vehicle Model</label>
                     <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="e.g. Bajaj RE" className="w-full h-10 bg-white border border-white focus:border-secondary/50 rounded-xl px-4 outline-none font-medium text-sm shadow-sm" />
                   </div>
                   <div>
                     <label className="text-xs font-semibold text-text-muted ml-2 mb-1 block">Passenger Capacity</label>
                     <input type="number" min="1" max="15" name="capacity" value={formData.capacity} onChange={handleChange} className="w-full h-10 bg-white border border-white focus:border-secondary/50 rounded-xl px-4 outline-none font-bold text-sm text-primary shadow-sm" />
                   </div>
                </div>
             </motion.div>
           )}

           <button type="submit" disabled={saving} className="btn btn-primary w-full h-14 shadow-xl shadow-primary/20 font-bold text-sm !rounded-2xl flex items-center justify-center gap-2 mt-4">
              {saving ? <Loader2 className="animate-spin" /> : <>Save Profile <Save size={18} /></>}
           </button>
        </form>
      </div>
    </div>
  );
};
