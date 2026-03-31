import { Link } from 'react-router-dom';
import { Car, User, Navigation, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';

export const Home = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-bg-light overflow-hidden relative">
      {/* Dynamic background accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl"></div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <Navigation size={24} />
          </div>
          <span className="text-2xl font-bold font-outfit tracking-tight text-primary">RouteSync</span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-text-muted font-bold tracking-tight px-4 py-2 bg-white/50 rounded-xl border border-white">Welcome, {user?.name}</span>
              <Link to={user?.role === 'driver' ? '/driver' : '/ride'} className="btn btn-primary px-8">Dashboard</Link>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-text-muted font-medium hover:text-primary transition-colors">Login</Link>
              <Link to="/register" className="btn btn-primary px-8">Join Now</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-20 pb-10 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block py-1 px-4 bg-primary/10 text-primary font-semibold text-sm rounded-full mb-6 italic tracking-tight">Real-Time Shared Mobility Platform</span>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] max-w-4xl tracking-tight">
            Seamless <span className="text-primary italic">Movement</span> for Everyone.
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mb-12 leading-relaxed">
            Connecting shared vehicle drivers and passengers in real-time. Optimize your route, reduce costs, and travel smarter with RouteSync.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 mb-20">
            <Link to="/driver" className="btn btn-primary text-xl px-10 py-5 group !rounded-[2rem]">
              <Car className="group-hover:translate-x-1 transition-transform" /> I’m a Driver
            </Link>
            <Link to="/discover" className="btn bg-white text-primary text-xl px-10 py-5 border-2 border-primary/20 hover:border-primary/50 group shadow-md !rounded-[2rem]">
              <User className="group-hover:translate-y-[-2px] transition-transform" /> I'm a Passenger
            </Link>
          </div>
        </motion.div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mt-12">
          {[
            { icon: Navigation, title: "Smart Matching", desc: "Route-based filtering ensures you only find rides exactly on your path." },
            { icon: ShieldCheck, title: "Verified Safety", desc: "Real-time tracking and emergency SOS for secure communal travel." },
            { icon: Car, title: "Optimized Fleet", desc: "Digital management for auto-rickshaws, e-rickshaws, and shared vans." }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 * idx, duration: 0.5 }}
              className="card group hover:translate-y-[-10px] transition-all duration-300 !rounded-[2.5rem]"
            >
              <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <feature.icon size={32} />
              </div>
              <h3 className="text-2xl mb-4 font-outfit">{feature.title}</h3>
              <p className="text-text-muted leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="mt-20 py-10 border-t border-gray-200">
        <div className="container mx-auto px-6 text-center text-text-muted font-medium">
          &copy; 2026 RouteSync. Commute smarter and safer.
        </div>
      </footer>
    </div>
  );
};
