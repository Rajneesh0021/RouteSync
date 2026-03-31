import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Navigation, Car, Users, TrendingUp, Star, ChevronLeft, Info, Loader2, Target, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import { passengerService, mapService } from '../services/api';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const dropIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  iconSize: [20, 32], iconAnchor: [10, 32],
});

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
};

const MapInternal = ({ pickup, drop, step, drivers, manualCenter, onMapClick }) => {
  const map = useMap();
  useEffect(() => {
    if (manualCenter) {
      map.flyTo(manualCenter, 15, { animate: true });
    } else {
      const coords = drop ? drop : pickup;
      if (coords) map.flyTo(coords, 14, { animate: true });
    }
  }, [step, pickup, drop, map, manualCenter]);

  return (
    <>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
      <MapClickHandler onMapClick={onMapClick} />
      <Marker position={pickup} icon={pickupIcon}><Popup>Pickup Pin</Popup></Marker>
      {step >= 2 && drop && <Marker position={drop} icon={dropIcon}><Popup>Destination Pin</Popup></Marker>}
      {step >= 2 && drop && <Polyline positions={[pickup, drop]} pathOptions={{ color: '#6366F1', weight: 4, dashArray: '5, 10' }} />}
      {drivers.map(d => (
        <Marker key={d._id} position={[d.currentLocation.coordinates[1], d.currentLocation.coordinates[0]]} icon={driverIcon}>
           <Popup>{d.vehicle?.model || 'Shared Ride'}</Popup>
        </Marker>
      ))}
    </>
  );
};

export const PassengerApp = ({ isPublic = false }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(2);
  const [pickup, setPickup] = useState(null); 
  const [drop, setDrop] = useState(null);
  const [address, setAddress] = useState({ pickup: '', drop: '' });
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [manualCenter, setManualCenter] = useState(null);

  const debounceTimer = useRef(null);

  const handleSearchAddress = (query, type) => {
    setAddress({ ...address, [type]: query });
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const data = await mapService.searchAddress(query);
        setSuggestions(data.map(item => ({ label: item.display_name, lat: parseFloat(item.lat), lon: parseFloat(item.lon), type })));
      } catch (e) {
        console.error("Discovery Node Error:", e);
      }
    }, 400); // 400ms debounce
  };

  const getExactLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
       setPickup([26.8467, 80.9462]);
       return setIsLocating(false);
    }
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setPickup([latitude, longitude]);
      setManualCenter([latitude, longitude]);
      
      try {
        const data = await mapService.reverseGeocode(latitude, longitude);
        setAddress(prev => ({ ...prev, pickup: data.display_name || "Current Node Position" }));
      } catch (e) {
        setAddress(prev => ({ ...prev, pickup: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
      }
      setIsLocating(false);
    }, (err) => {
       console.error("GPS Init Error", err);
       setPickup([26.8467, 80.9462]);
       let errorMsg = "GPS Failed. Using Fallback Node.";
       if (err.code === 1) errorMsg = "GPS Access Denied by Device";
       if (err.code === 2) errorMsg = "GPS Signal Unavailable";
       if (err.code === 3) errorMsg = "GPS Request Timed Out";
       setAddress(prev => ({ ...prev, pickup: errorMsg }));
       setIsLocating(false);
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
  };

  // Auto-init location on terminal link
  useEffect(() => {
    getExactLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectSuggestion = (s) => {
    if (s.type === 'pickup') {
      setPickup([s.lat, s.lon]);
      setAddress({ ...address, pickup: s.label });
    } else {
      setDrop([s.lat, s.lon]);
      setAddress({ ...address, drop: s.label });
    }
    setSuggestions([]);
    setManualCenter([s.lat, s.lon]);
  };

  const handleMapClick = async (coords) => {
    if (step !== 2) return;
    setDrop(coords);
    setAddress(prev => ({ ...prev, drop: "Acquiring Coordinates..." }));
    try {
      const data = await mapService.reverseGeocode(coords[0], coords[1]);
      setAddress(prev => ({ ...prev, drop: data.display_name || `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}` }));
    } catch (e) {
      setAddress(prev => ({ ...prev, drop: `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}` }));
    }
  };

  const findDrivers = async () => {
    setIsSearching(true);
    try {
      const resp = await passengerService.search([pickup[1], pickup[0]], [drop[1], drop[0]]);
      setDrivers(resp.data.data);
      setStep(3);
    } catch (e) {
      console.error("Fleet Relay Failure:", e);
    } finally {
      setIsSearching(false);
    }
  };

  // Autonomous Background Fleet Synchronization (Live Location Sync)
  useEffect(() => {
    let interval = null;
    if (step === 3 && pickup && drop) {
       interval = setInterval(async () => {
         try {
           const resp = await passengerService.search([pickup[1], pickup[0]], [drop[1], drop[0]]);
           setDrivers(resp.data.data);
         } catch(e) { /* silent fail for background workers */ }
       }, 5500);
    }
    return () => clearInterval(interval);
  }, [step, pickup, drop]);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden flex flex-col bg-bg-light font-outfit">
      <div className="flex-1 z-0 relative">
        {pickup ? (
          <MapContainer center={pickup} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <MapInternal pickup={pickup} drop={drop} step={step} drivers={drivers} manualCenter={manualCenter} onMapClick={handleMapClick} />
          </MapContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
             <Loader2 className="animate-spin text-primary mb-2" size={32} />
             <p className="text-sm font-bold text-text-muted">Locating...</p>
          </div>
        )}

        <div className="absolute top-4 left-4 right-4 z-10 flex flex-col gap-2 pointer-events-none">
          <div className="glass px-5 py-3 rounded-2xl flex items-center gap-3 shadow-xl border border-white/40 pointer-events-auto">
            <button onClick={() => {
              if (step > 2) setStep(step - 1);
              else if (step === 2 && isPublic) navigate('/');
            }} className="text-primary hover:scale-110 p-1">
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1 truncate">
               <h1 className="text-sm font-bold text-primary tracking-tight">RouteSync</h1>
               <p className="text-xs text-text-muted font-medium mt-1">Passenger Online</p>
            </div>
          </div>
        </div>

        {/* Locate Floating Action Button */}
        {step < 3 && (
          <button 
            onClick={getExactLocation}
            className="absolute bottom-1/2 translate-y-[100px] right-4 z-10 w-12 h-12 glass shadow-xl shadow-primary/10 rounded-2xl flex items-center justify-center text-primary hover:bg-white transition-all active:scale-90 border border-white/60"
          >
             {isLocating ? <Loader2 className="animate-spin" size={20} /> : <Crosshair size={22} />}
          </button>
        )}
      </div>

      <motion.div layout className="glass absolute bottom-0 left-0 right-0 z-20 border-t border-white/30 flex flex-col p-6 rounded-t-[2.5rem] shadow-[0_-15px_50px_rgba(0,0,0,0.1)] max-h-[75vh]">
        <AnimatePresence mode="wait">
          {step === 2 && (
            <motion.div key="drop" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-bold text-primary tracking-tight">Set Your Destination</h2>
                 <span className="text-xs font-semibold flex items-center gap-1.5 text-success">
                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span></span> GPS Active
                 </span>
              </div>

              <div className="space-y-3">
                 <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-50"><MapPin size={16} /></div>
                    <div className="w-full h-12 bg-white/30 border border-white/50 rounded-xl pl-12 pr-4 flex items-center shadow-inner overflow-hidden relative">
                       <div className="truncate w-full text-sm font-medium text-primary/80">
                          {isLocating ? "Locating..." : (address.pickup || "Current Location")}
                       </div>
                    </div>
                 </div>

                 <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary opacity-50"><Navigation size={18} /></div>
                    <input type="text" value={address.drop} onChange={(e) => handleSearchAddress(e.target.value, 'drop')} placeholder="Destination..." className="w-full h-14 bg-white/50 border border-white focus:border-secondary/50 rounded-xl pl-12 pr-6 outline-none font-bold text-sm shadow-inner transition-all" />
                    {address.drop && <button onClick={() => setAddress({...address, drop: ''})} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40 hover:opacity-100">×</button>}
                 </div>
                 {suggestions.length > 0 && suggestions[0].type === 'drop' && (
                   <div className="mt-1 glass rounded-2xl border border-white overflow-hidden shadow-2xl absolute w-full z-50">
                     {suggestions.map((s, i) => (
                       <button key={i} onClick={() => selectSuggestion(s)} className="w-full text-left px-5 py-3 text-xs font-medium border-b border-white hover:bg-secondary/5 last:border-0 truncate flex items-center gap-2">
                          <Navigation size={12} className="opacity-40" /> {s.label}
                       </button>
                     ))}
                   </div>
                 )}
              </div>
              <button onClick={findDrivers} disabled={isSearching || !drop} className={`btn btn-primary w-full h-14 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl ${(!drop) && 'opacity-50 cursor-not-allowed'}`}>
                {isSearching ? <Loader2 className="animate-spin" /> : <>Find Rides <Search size={18} /></>}
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="drivers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 flex flex-col overflow-hidden max-h-[50vh]">
              <div className="flex items-center justify-between px-1 mb-2">
                 <h2 className="text-base font-bold text-primary tracking-tight">Available Rides</h2>
                 <span className="text-xs font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full">{drivers.length} Drivers Online</span>
              </div>
              <div className="flex-1 overflow-auto space-y-3 pr-1 -mr-1 scrollbar-hidden">
                {drivers.map((d) => (
                  <div key={d._id} className="card !p-4 group hover:bg-primary/5 transition-all cursor-pointer relative overflow-hidden rounded-2xl border border-white shadow-sm active:scale-98">
                    <div className="absolute top-0 right-0 p-2.5 bg-secondary/5 rounded-bl-2xl text-xs font-bold text-secondary">
                       {d.availableSeats || 0} Seats
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 bg-primary/10 rounded-[1rem] flex items-center justify-center text-primary shrink-0 transition-all group-hover:bg-primary group-hover:text-white shadow-inner"><Car size={22} /></div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="font-bold text-primary text-sm tracking-tight truncate mr-2">{d.user?.name || 'Driver'}</h4>
                          <span className="text-secondary font-bold text-xs shrink-0">ETA: 3m</span>
                        </div>
                        <p className="text-xs text-text-muted font-medium truncate opacity-70">{d.vehicle?.model || 'Auto Rickshaw'}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                       <button onClick={() => isPublic ? navigate('/login') : console.log("Init Protocol")} className={`flex-1 btn ${isPublic ? 'bg-secondary' : 'btn-primary'} h-10 !min-h-0 text-xs !rounded-xl text-white font-bold shadow-md tracking-wide`}>
                         {isPublic ? 'Sign In to Book' : 'Book Ride'}
                       </button>
                       <button className="px-4 border border-white bg-white/40 rounded-xl hover:bg-white transition-all"><Info size={16} className="text-text-muted" /></button>
                    </div>
                  </div>
                ))}
                {drivers.length === 0 && <div className="p-12 text-center text-sm text-text-muted font-medium bg-white/40 border border-white rounded-3xl opacity-60">No drivers found near you</div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Shorthand icon for Arrow (not defined on line 186)
const ArrowRight = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
);
