import { History, Navigation, User, Car, Star, Calendar, MapPin, Search } from 'lucide-react';

export const TripHistory = () => {
  const mockHistory = [
    { 
      id: "T-9021", 
      route: "Lucknow Central → Hazratganj", 
      date: "28 Mar 2024", 
      time: "10:30 AM", 
      driver: "Rajesh Kumar", 
      fare: "₹75", 
      status: "Completed",
      type: "Passenger" 
    },
    { 
      id: "T-8845", 
      route: "Gomti Nagar → Charbagh", 
      date: "27 Mar 2024", 
      time: "04:15 PM", 
      earnings: "₹450", 
      passengers: 5, 
      status: "Completed",
      type: "Driver" 
    },
    { 
      id: "T-8712", 
      route: "Hazratganj → IT Metro", 
      date: "26 Mar 2024", 
      time: "09:00 AM", 
      fare: "₹35", 
      status: "Cancelled", 
      type: "Passenger" 
    }
  ];

  return (
    <div className="min-h-screen bg-bg-light p-8 lg:p-12 relative">
      <div className="container mx-auto max-w-5xl">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <span className="inline-block py-1 px-4 bg-primary/10 text-primary font-black uppercase tracking-widest text-xs rounded-full mb-4">Activity Log</span>
            <h1 className="text-5xl font-black font-outfit text-primary tracking-tight">Trip History</h1>
            <p className="text-text-muted mt-2 text-lg font-medium">Tracking your communal journeys efficiently.</p>
          </div>
          
          <div className="flex gap-4">
             <div className="glass flex items-center gap-3 px-6 py-4 rounded-2xl border border-white shadow-sm">
                <Search size={20} className="text-primary" />
                <input type="text" placeholder="Search by trip, route, or date..." className="bg-transparent border-none outline-none font-bold text-sm w-48 text-primary placeholder-primary/40" />
             </div>
             <button className="btn btn-primary px-8">Export Log</button>
          </div>
        </header>

        <section className="space-y-6">
           {mockHistory.map((trip) => (
             <div key={trip.id} className="card !p-8 group hover:shadow-xl hover:translate-x-2 transition-all cursor-pointer relative overflow-hidden bg-white/60 border-white">
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${trip.status === 'Completed' ? 'bg-success' : 'bg-error'}`}></div>
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                   
                   <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-2xl min-w-[100px] border border-primary/5 group-hover:bg-primary transition-all duration-500 group-hover:text-white">
                      <Calendar size={28} className="mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Mar 2024</span>
                      <span className="text-xl font-black font-outfit leading-none">{trip.date.split(' ')[0]}</span>
                   </div>

                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${trip.type === 'Driver' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                           {trip.type} Mode
                        </span>
                        <span className="text-text-muted text-xs font-bold">ID: {trip.id}</span>
                      </div>
                      <h3 className="text-2xl font-black font-outfit text-primary mb-2 line-clamp-1 truncate group-hover:text-secondary transition-colors">{trip.route}</h3>
                      <div className="flex flex-wrap items-center gap-6 text-text-muted">
                         <div className="flex items-center gap-2 font-semibold">
                            <Navigation size={14} className="text-primary" /> Lucknow Terminal 4
                         </div>
                         <div className="flex items-center gap-2 font-semibold">
                            <User size={14} className="text-primary" /> {trip.type === 'Driver' ? `${trip.passengers} Onboard` : trip.driver}
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-col items-end gap-3 min-w-[140px]">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${trip.status === 'Completed' ? 'bg-success/15 text-success' : 'bg-error/15 text-error'}`}>
                         {trip.status}
                      </span>
                      <p className="text-4xl font-black font-outfit text-primary"> {trip.type === 'Driver' ? trip.earnings : trip.fare}</p>
                   </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                   <div className="flex -space-x-3">
                      {[1,2,3].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                           {i === 3 ? '+2' : <User size={14} />}
                        </div>
                      ))}
                   </div>
                   <button className="text-secondary font-black text-sm uppercase tracking-widest hover:underline decoration-2 underline-offset-8">Download Invoice →</button>
                </div>
             </div>
           ))}
        </section>
      </div>
    </div>
  );
};
