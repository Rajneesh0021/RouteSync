import React from 'react';
import { AlertTriangle, Power, CornerDownLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const GlobalError = ({ code = 500, message, type = "System Outage" }) => {
  const location = useLocation();
  const errorCode = code === '404' || location.pathname ? '404' : code;
  const errorMsg = message || (errorCode === '404' ? 'The requested terminal node could not be located on the primary lattice.' : 'A critical framework logic failure occurred while rendering the DOM.');
  const errorType = type || (errorCode === '404' ? 'Endpoint Not Found' : 'Fatal Exception');

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center p-6 relative overflow-hidden font-outfit">
      <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-error/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]"></div>

      <div className="glass w-full max-w-xl p-10 lg:p-14 rounded-[3.5rem] border border-white/40 shadow-2xl relative z-10 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-error/10 rounded-[2.5rem] flex items-center justify-center text-error shadow-inner mb-6 relative">
          <div className="absolute inset-0 border-4 border-error/20 rounded-[2.5rem] animate-ping opacity-50"></div>
          {errorCode === '404' ? <Power size={48} /> : <AlertTriangle size={48} />}
        </div>
        
        <h1 className="text-5xl font-black text-primary tracking-tighter mb-2 uppercase italic">{errorCode}</h1>
        <h2 className="text-sm font-black text-error uppercase tracking-[0.3em] mb-6">{errorType}</h2>
        
        <div className="bg-white/50 border border-white p-5 rounded-2xl w-full mb-8 shadow-inner text-left">
          <p className="text-xs font-bold text-text-muted leading-relaxed uppercase tracking-wider">
            {errorMsg}
          </p>
        </div>

        <Link to="/" className="btn btn-primary h-16 w-full text-sm uppercase tracking-widest font-black !rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center gap-3 group">
          <CornerDownLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Reinitialize Protocol
        </Link>
      </div>
    </div>
  );
};
