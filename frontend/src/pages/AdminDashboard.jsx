import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { Shield, ShieldAlert, CheckCircle, XCircle, Users, Car, UserPlus, Loader2, RefreshCw } from 'lucide-react';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('drivers');
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Employee Form State
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empMsg, setEmpMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersRes = await adminService.getUsers();
      setUsers(usersRes.data.data);
      
      const driversRes = await adminService.getDrivers();
      setDrivers(driversRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async (driverId, status) => {
    try {
      await adminService.verifyDriver(driverId, status);
      const up = drivers.map(d => d._id === driverId ? { ...d, verificationStatus: status } : d);
      setDrivers(up);
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const createEmployee = async (e) => {
    e.preventDefault();
    setEmpMsg('Processing...');
    try {
      await adminService.createEmployee({ name: empName, email: empEmail, password: empPassword });
      setEmpMsg('Employee account provisioned securely.');
      setEmpName(''); setEmpEmail(''); setEmpPassword('');
      fetchData(); // Refresh user list to show new employee
    } catch (error) {
      setEmpMsg(error.response?.data?.message || 'Error provisioning account');
    }
  };

  return (
    <div className="min-h-screen bg-bg-light font-outfit p-4 lg:p-8 flex flex-col">
      <div className="glass flex items-center justify-between p-4 px-6 rounded-2xl mb-8 shadow-sm">
        <div className="flex items-center gap-3">
          <Shield className="text-secondary" size={24} />
          <div>
            <h1 className="text-xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-xs font-semibold text-text-muted">Manage Users & Fleet</p>
          </div>
        </div>
        <button onClick={fetchData} className="p-2 hover:bg-white/40 rounded-full transition-all text-primary active:scale-95">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab('drivers')} className={`flex-1 py-3 font-bold text-sm rounded-xl transition-all shadow-sm ${activeTab === 'drivers' ? 'bg-primary text-white' : 'glass text-text-muted hover:text-primary hover:bg-white'}`}>
          Drivers
        </button>
        <button onClick={() => setActiveTab('users')} className={`flex-1 py-3 font-bold text-sm rounded-xl transition-all shadow-sm ${activeTab === 'users' ? 'bg-primary text-white' : 'glass text-text-muted hover:text-primary hover:bg-white'}`}>
          Users
        </button>
        <button onClick={() => setActiveTab('employees')} className={`flex-1 py-3 font-bold text-sm rounded-xl transition-all shadow-sm ${activeTab === 'employees' ? 'bg-secondary text-white' : 'glass text-text-muted hover:text-secondary hover:bg-white'}`}>
          Add Employee
        </button>
      </div>

      <div className="flex-1 glass p-6 rounded-3xl shadow-lg border border-white/60 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <p className="text-sm font-bold text-text-muted">Loading data...</p>
          </div>
        ) : (
          <div className="overflow-auto scrollbar-hidden">
            {activeTab === 'drivers' && (
               <div className="space-y-4">
                 <h2 className="text-base font-bold text-primary mb-4">Driver Verification Queue</h2>
                 {drivers.map(d => (
                   <div key={d._id} className="bg-white/40 border border-white p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Car /></div>
                       <div>
                         <h3 className="font-bold text-primary text-sm">{d.userId?.name || 'Unknown Driver'}</h3>
                         <p className="text-xs text-text-muted font-semibold mt-0.5">Plate: {d.vehicle.number} | {d.vehicle.capacity} Seats</p>
                         <p className="text-xs text-text-muted font-semibold mt-0.5">Email: {d.userId?.email?.address}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wide capitalize ${
                         d.verificationStatus === 'pending' ? 'bg-warning/20 text-warning' : 
                         d.verificationStatus === 'approved' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                       }`}>
                         {d.verificationStatus}
                       </span>
                       {d.verificationStatus === 'pending' && (
                         <div className="flex gap-2 ml-auto md:ml-4">
                           <button onClick={() => handleVerify(d._id, 'approved')} className="bg-success text-white p-2 rounded-xl hover:scale-105 transition-transform"><CheckCircle size={16} /></button>
                           <button onClick={() => handleVerify(d._id, 'rejected')} className="bg-error text-white p-2 rounded-xl hover:scale-105 transition-transform"><XCircle size={16} /></button>
                         </div>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
            )}

            {activeTab === 'users' && (
               <div className="space-y-4">
                 <h2 className="text-base font-bold text-primary mb-4">All Registered Users</h2>
                 {users.map(u => (
                   <div key={u._id} className="bg-white/40 border border-white p-4 rounded-2xl flex items-center justify-between">
                     <div>
                       <h3 className="font-bold text-primary text-sm">{u.name}</h3>
                       <p className="text-xs text-text-muted font-semibold mt-0.5">{u.email.address}</p>
                     </div>
                     <span className={`px-3 py-1 rounded-lg text-xs font-bold capitalize ${u.role === 'admin' ? 'bg-secondary/20 text-secondary' : u.role === 'driver' ? 'bg-primary/20 text-primary' : 'bg-gray-200 text-gray-600'}`}>
                       {u.role}
                     </span>
                   </div>
                 ))}
               </div>
            )}

            {activeTab === 'employees' && (
              <form onSubmit={createEmployee} className="max-w-md mx-auto space-y-5 bg-white/40 p-6 border border-white rounded-3xl mt-4 shadow-sm">
                <div className="flex flex-col items-center justify-center mb-6">
                   <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center text-secondary shadow-inner mb-3"><UserPlus size={28} /></div>
                   <h2 className="text-xl font-bold text-primary text-center">Add New Employee</h2>
                   <p className="text-xs text-text-muted font-medium text-center mt-1">Employees can verify and manage driver applications</p>
                </div>
                
                <div className="space-y-4">
                  <input type="text" value={empName} onChange={e => setEmpName(e.target.value)} required placeholder="Employee Name" className="w-full h-12 bg-white/60 border border-white focus:border-secondary/50 rounded-xl px-4 outline-none font-medium text-sm shadow-inner" />
                  <input type="email" value={empEmail} onChange={e => setEmpEmail(e.target.value)} required placeholder="Email Address" className="w-full h-12 bg-white/60 border border-white focus:border-secondary/50 rounded-xl px-4 outline-none font-medium text-sm shadow-inner" />
                  <input type="password" value={empPassword} onChange={e => setEmpPassword(e.target.value)} required placeholder="Temporary Password" className="w-full h-12 bg-white/60 border border-white focus:border-secondary/50 rounded-xl px-4 outline-none font-medium text-sm shadow-inner" />
                </div>
                
                {empMsg && <p className="text-xs text-center font-bold text-secondary">{empMsg}</p>}
                
                <button type="submit" className="w-full h-14 bg-secondary text-white rounded-xl font-bold text-sm tracking-wide hover:bg-secondary-dark transition-colors shadow-lg shadow-secondary/20">
                  Create Employee
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
