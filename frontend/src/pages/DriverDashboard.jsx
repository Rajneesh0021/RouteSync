import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import { authService, driverService } from '../services/api';
import { Power, MapPin, Navigation, Info, Car, Users, ChevronUp, ChevronDown, User, Search, Target, CheckCircle2, XCircle, Crosshair, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

const carIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const RoutingMachine = ({ start, end }) => {
  const map = useMap();
  useEffect(() => {
    if (!start || !end) return;
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1])
      ],
      routeWhileDragging: true,
      showAlternatives: true,
      fitSelectedRoutes: true,
      lineOptions: { styles: [{ color: '#EAB308', opacity: 0.9, weight: 6 }] },
      show: false,
      addWaypoints: true,
      draggableWaypoints: true,
      createMarker: function() { return null; } // We use Custom Markers
    }).addTo(map);

    return () => {
      try {
        if (map && routingControl) map.removeControl(routingControl);
      } catch(e) { console.error('OSRM Node Cleanup failure', e); }
    };
  }, [map, start, end]);

  return null;
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
};

const MapInternal = ({ start, end, isOnline, currentPos, onMapClick }) => {
  const map = useMap();
  useEffect(() => {
    if (currentPos && map && !end) map.flyTo(currentPos, 15, { animate: true });
  }, [currentPos, end, map]);

  return (
    <>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
      <MapClickHandler onMapClick={onMapClick} />
      <Marker position={start} icon={carIcon}><Popup>Route Start</Popup></Marker>
      {end && (
        <>
          <Marker position={end} icon={destIcon}><Popup>Route End</Popup></Marker>
          <RoutingMachine start={start} end={end} />
        </>
      )}
    </>
  );
};

export const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [isSettingRoute, setIsSettingRoute] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [startLoc, setStartLoc] = useState(null); 
  const [endLoc, setEndLoc] = useState(null);
  const [address, setAddress] = useState({ start: '', end: '' });
  const [suggestions, setSuggestions] = useState([]);
  const [seats, setSeats] = useState(3);
  const [isLocating, setIsLocating] = useState(false);
  const [profileError, setProfileError] = useState(false);
  
  const debounceTimer = useRef(null);

  // Initialization check
  useEffect(() => {
    const checkDriverStatus = async () => {
      try {
        const res = await authService.getProfile();
        const dr = res.data.data;
        if (dr.role === 'driver') {
          if (!dr.driverDetails || dr.driverDetails.vehicle?.number === 'PENDING') {
            setProfileError(true);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkDriverStatus();
  }, []);

  const getExactLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
       setStartLoc([26.8467, 80.9462]);
       return setIsLocating(false);
    }
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setStartLoc([latitude, longitude]);
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        setAddress(prev => ({ ...prev, start: data.display_name || "Current Node Position" }));
      } catch (e) {
        setAddress(prev => ({ ...prev, start: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
      }
      setIsLocating(false);
    }, (err) => {
       console.error("GPS Init Error", err);
       setStartLoc([26.8467, 80.9462]);
       let errorMsg = "GPS Failed. Using Fallback.";
       if (err.code === 1) errorMsg = "GPS Access Denied by Device";
       if (err.code === 2) errorMsg = "GPS Signal Unavailable";
       if (err.code === 3) errorMsg = "GPS Request Timed Out";
       setAddress(prev => ({ ...prev, start: errorMsg }));
       setIsLocating(false);
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
  };

  // Auto-init location on mount
  useEffect(() => {
    getExactLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Broadcast Live GPS Coordinates every 4.5 seconds strictly!
  useEffect(() => {
    let intervalId = null;
    if (isOnline && navigator.geolocation) {
       intervalId = setInterval(() => {
         navigator.geolocation.getCurrentPosition(
           async (pos) => {
             const { latitude, longitude, heading, speed } = pos.coords;
             setStartLoc([latitude, longitude]); // Strictly keep visual marker jumping to latest GPS point
             try {
               await driverService.updateLocation({
                  coordinates: [latitude, longitude],
                  heading: heading || 0,
                  speed: speed || 0
               });
             } catch(e) { console.error("Telemetry Sync Error"); }
           },
           (err) => console.log("GPS Lock Lost"),
           { enableHighAccuracy: true, maximumAge: 0, timeout: 4000 }
         );
       }, 4500);
    }
    
    return () => {
       if (intervalId) clearInterval(intervalId);
    };
  }, [isOnline]);

  const handleSearchAddress = (query, type) => {
    setAddress({ ...address, [type]: query });
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (query.length < 3) return setSuggestions([]);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&countrycodes=in`);
        const data = await res.json();
        setSuggestions(data.map(item => ({ label: item.display_name, lat: parseFloat(item.lat), lon: parseFloat(item.lon), type })));
      } catch (e) {
        console.error("Discovery Node Error:", e);
      }
    }, 400);
  };

  const selectSuggestion = (s) => {
    if (s.type === 'start') {
      setStartLoc([s.lat, s.lon]);
      setAddress({ ...address, start: s.label });
    } else {
      setEndLoc([s.lat, s.lon]);
      setAddress({ ...address, end: s.label });
    }
    setSuggestions([]);
  };

  const handleMapClick = async (coords) => {
    if (!isSettingRoute) return; 
    setEndLoc(coords);
    setAddress(prev => ({ ...prev, end: "Acquiring Coordinates..." }));
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`);
      const data = await res.json();
      setAddress(prev => ({ ...prev, end: data.display_name || `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}` }));
    } catch (e) {
      setAddress(prev => ({ ...prev, end: `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}` }));
    }
  };

  const handleToggleOnline = async () => {
    try {
      if (!isOnline) {
        setIsSettingRoute(false);
        setIsOnline(true);
        await driverService.goOnline({
          availableSeats: seats,
          liveRoute: { start: startLoc, end: endLoc }
        });
      } else {
        setIsOnline(false);
        setIsSettingRoute(true);
        // Implement driverService.goOffline() later
      }
    } catch (error) {
       console.error("Transmission Error:", error);
    }
  };

  if (profileError) {
    return (
      <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-6 font-outfit text-center">
         <div className="w-20 h-20 bg-error/10 rounded-2xl flex items-center justify-center text-error mb-6 shadow-inner"><Car size={40} /></div>
         <h1 className="text-2xl font-bold text-primary mb-2">Driver Profile Incomplete</h1>
         <p className="text-sm font-medium text-text-muted mb-8 max-w-md">Please complete your vehicle details in your profile to go online.</p>
         <Link to="/profile" className="btn btn-primary h-14 w-full max-w-sm text-sm font-bold !rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center">
            Complete Profile
         </Link>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col bg-bg-light font-outfit">
      <style>{`.leaflet-routing-container { display: none !important; }`}</style>
      <div className="flex-1 z-0 relative">
        {startLoc ? (
          <MapContainer center={startLoc} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <MapInternal start={startLoc} end={endLoc} isOnline={isOnline} currentPos={startLoc} onMapClick={handleMapClick} />
          </MapContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
             <Loader2 className="animate-spin text-primary mb-2" size={32} />
             <p className="text-sm font-bold text-text-muted">Locating...</p>
          </div>
        )}

        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
          <div className="glass px-4 py-3 rounded-2xl flex items-center gap-3 shadow-xl border border-white/40 pointer-events-auto">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-warning'}`}></div>
            <div className="flex-1 truncate">
               <h1 className="text-sm font-bold text-primary tracking-tight">Driver Status</h1>
               <p className="text-xs text-text-muted font-semibold leading-none mt-1">
                 {isOnline ? 'Online' : 'Offline'}
               </p>
            </div>
          </div>
          {isOnline && (
            <button onClick={() => setIsOnline(false)} className="glass p-3 rounded-2xl shadow-xl text-error pointer-events-auto border border-white/40">
               <XCircle size={20} />
            </button>
          )}
        </div>
        
        {/* Locate Floating Action Button */}
        {isSettingRoute && (
          <button 
            onClick={getExactLocation}
            className="absolute bottom-1/2 translate-y-[100px] right-4 z-10 w-12 h-12 glass shadow-xl shadow-primary/10 rounded-2xl flex items-center justify-center text-primary hover:bg-white transition-all active:scale-90 border border-white/60"
          >
             {isLocating ? <Loader2 className="animate-spin" size={20} /> : <Crosshair size={22} />}
          </button>
        )}
      </div>

      <motion.div initial={false} animate={{ height: isExpanded ? '75%' : (isSettingRoute ? '320px' : '200px') }} className="glass absolute bottom-0 left-0 right-0 z-20 border-t border-white/30 flex flex-col p-6 rounded-t-[2.5rem] shadow-[0_-15px_50px_rgba(0,0,0,0.1)] max-h-[90vh]">
        <button onClick={() => setIsExpanded(!isExpanded)} className="w-12 h-1 bg-primary/10 rounded-full mx-auto mb-6 hover:bg-primary/20 transition-colors cursor-pointer"></button>

        <AnimatePresence mode="wait">
          {isSettingRoute ? (
            <motion.div key="setup" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
               <div>
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-lg font-bold text-primary tracking-tight">Set Route</h2>
                     <span className="text-xs font-semibold flex items-center gap-1.5 text-success">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span></span> GPS Active
                     </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-50"><MapPin size={16} /></div>
                      <div className="w-full h-12 bg-white/30 border border-white/50 rounded-xl pl-12 pr-4 flex items-center shadow-inner overflow-hidden relative">
                         <div className="truncate w-full text-sm font-medium text-primary/80">
                            {isLocating ? "Locating..." : (address.start || "Current Location")}
                         </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary opacity-50"><Navigation size={16} /></div>
                      <input type="text" value={address.end} onChange={(e) => handleSearchAddress(e.target.value, 'end')} placeholder="Destination..." className="w-full h-12 bg-white/50 border border-white focus:border-secondary/50 rounded-xl pl-12 pr-10 outline-none font-medium text-sm" />
                      {address.end && <button onClick={() => setAddress({...address, end: ''})} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted opacity-40 hover:opacity-100"><XCircle size={14}/></button>}
                      {suggestions.length > 0 && suggestions[0].type === 'end' && (
                        <div className="mt-1 glass rounded-xl border border-white overflow-hidden shadow-2xl absolute w-full z-50">
                          {suggestions.map((s, i) => (
                            <button key={i} onClick={() => selectSuggestion(s)} className="w-full text-left px-4 py-3 text-xs font-medium border-b border-white hover:bg-secondary/5 last:border-0 truncate">{s.label}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
               </div>

               <div className="flex gap-4">
                  <div className="flex-1 bg-primary/5 p-3 rounded-2xl flex items-center justify-between px-4 border border-white/40">
                    <span className="text-xs font-semibold text-primary">Available Seats</span>
                    <div className="flex items-center gap-3">
                       <button onClick={() => setSeats(Math.max(1, seats-1))} className="text-primary font-bold text-xl">-</button>
                       <span className="text-base font-bold">{seats}</span>
                       <button onClick={() => setSeats(Math.min(6, seats+1))} className="text-primary font-bold text-xl">+</button>
                    </div>
                  </div>
                  <button onClick={handleToggleOnline} className="btn btn-primary px-8 h-14 !rounded-2xl font-bold text-sm shadow-xl flex-1">Go Online</button>
               </div>
            </motion.div>
          ) : (
            <motion.div key="online" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
               <div className="flex items-center justify-between gap-4">
                 <div className="flex flex-col flex-1 overflow-hidden">
                    <h2 className="text-base font-bold text-primary truncate tracking-tight">Heading to: {address.end.split(',')[0]}</h2>
                    <p className="text-text-muted flex items-center gap-1 font-medium text-xs mt-1">
                       <Users size={12} className="text-secondary" /> {seats} Seats Available
                    </p>
                 </div>
                 <button onClick={handleToggleOnline} className="btn bg-error h-12 w-12 !p-0 !rounded-2xl shadow-lg shrink-0 active:scale-95">
                    <Power size={20} className="animate-pulse" />
                 </button>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="card !bg-primary/5 !border-none !p-4 flex items-center gap-4 rounded-xl">
                     <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner"><Users size={18} /></div>
                     <div>
                        <p className="text-xs text-text-muted font-semibold mb-0.5">Reserved</p>
                        <p className="font-bold text-sm">2 / {seats}</p>
                     </div>
                  </div>
                  <div className="card !bg-secondary/5 !border-none !p-4 flex items-center gap-4 rounded-xl">
                     <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary shadow-inner"><Target size={18} /></div>
                     <div>
                        <p className="text-xs text-text-muted font-semibold mb-0.5">Progress</p>
                        <p className="font-bold text-sm text-secondary">3.4 KM Left</p>
                     </div>
                  </div>
               </div>

               <AnimatePresence>
                 {isExpanded && (
                   <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="mt-4 flex-1 overflow-auto space-y-3">
                      <div className="flex items-center justify-between px-1">
                         <h3 className="text-xs font-bold font-outfit text-primary">Passenger Requests</h3>
                         <button onClick={() => setIsSettingRoute(true)} className="text-xs font-semibold text-secondary hover:underline">Edit Route</button>
                      </div>
                      {[
                        { name: "Rahul S.", pickup: "Hazratganj", status: "Waiting" },
                        { name: "Anjali K.", pickup: "Charbagh", status: "Picked" }
                      ].map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white/40 p-4 rounded-2xl border border-white shadow-sm">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase shadow-inner">{p.name[0]}</div>
                              <div>
                                 <p className="font-bold text-primary text-sm tracking-tight">{p.name}</p>
                                 <p className="text-xs text-text-muted font-medium mt-0.5">{p.pickup}</p>
                              </div>
                           </div>
                           <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide ${p.status === 'Picked' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning animate-pulse'}`}>{p.status}</span>
                        </div>
                      ))}
                   </motion.div>
                 )}
               </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
