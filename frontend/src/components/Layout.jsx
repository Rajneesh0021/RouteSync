import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Car, History, Navigation, User, ChevronRight, LogOut } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

export const Layout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Home", roles: ['driver', 'passenger', 'admin'] },
    { to: "/driver", icon: Car, label: "Driver Panel", roles: ['driver', 'admin'] },
    { to: "/ride", icon: Navigation, label: "Find a Ride", roles: ['passenger', 'admin'] },
    { to: "/history", icon: History, label: "My History", roles: ['driver', 'passenger', 'admin'] },
    { to: "/profile", icon: User, label: "Profile", roles: ['driver', 'passenger', 'admin', 'employee'] },
  ].filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen bg-bg-light">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 p-6 z-20">
        <div className="flex items-center gap-2 mb-10 px-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg">
            <Navigation size={18} />
          </div>
          <span className="text-xl font-bold font-outfit text-primary tracking-tight">RouteSync</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavLink 
              key={item.label}
              to={item.to}
              className={({ isActive }) => `
                flex items-center justify-between p-4 rounded-xl transition-all duration-300
                ${isActive ? 'bg-primary/5 text-primary font-semibold shadow-sm' : 'text-text-muted hover:bg-gray-50'}
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} />
                <span>{item.label}</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase text-xs">
               {user?.profilePhoto ? (
                 <img src={user.profilePhoto} className="w-full h-full object-cover rounded-full shadow-inner border border-primary/20" alt="Avtr" />
               ) : (
                 user?.name?.[0] || <User size={20} />
               )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-sm truncate">{user?.name || "User"}</p>
              <p className="text-xs text-text-muted truncate capitalize font-medium tracking-wide">{user?.role || "Guest"}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-4 rounded-xl text-error hover:bg-error/5 transition-all font-bold"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-auto h-full scrollbar-hidden">
        {/* Mobile Nav */}
        <div className="lg:hidden absolute bottom-4 left-4 right-4 z-50 glass rounded-2xl flex items-center justify-around py-4 px-6 border border-white/20">
             {navItems.map(item => (
               <NavLink key={item.label} to={item.to} className={({ isActive }) => `p-2 rounded-xl ${isActive ? 'text-primary bg-primary/10' : 'text-text-muted'}`}>
                  <item.icon size={24}/>
               </NavLink>
             ))}
             <button onClick={handleLogout} className="p-2 rounded-xl text-error"><LogOut size={24}/></button>
        </div>
        <div className="pb-24 lg:pb-0 h-full">
           <Outlet />
        </div>
      </main>
    </div>
  );
};
