import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  User, Car, History, MessageCircle, Home, MapPin, Calendar, Users, ArrowRight, Search, X, Clock
} from "lucide-react";
import heroImage from "@/assets/rideshare-hero.jpg";

const RideHistory = ({ rides, onBack }: { rides: any[], onBack: () => void }) => (
  <div className="animate-slide-up bg-gradient-card p-8 rounded-2xl shadow-floating border border-border/50">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">My Ride History</h3>
      <button
        onClick={onBack}
        className="p-2 rounded-full bg-muted hover:bg-accent transition-colors duration-300"
      >
        <X size={20} />
      </button>
    </div>
    {rides.length ? (
      <div className="space-y-4">
        {rides.map((r, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-border/30 hover:shadow-card transition-all duration-300 hover:-translate-y-1">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={16} className="text-primary" />
                  <span className="font-medium">{r.from} → {r.to}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock size={14} />
                  <span>{r.date}</span>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {r.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-12">
        <Car size={48} className="mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">You have not published any rides yet.</p>
      </div>
    )}
  </div>
);

const BookingHistory = ({ bookings, onBack }: { bookings: any[], onBack: () => void }) => (
  <RideHistory rides={bookings} onBack={onBack} />
);

const SearchForm = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [message, setMessage] = useState("");
  const [active, setActive] = useState("search");
  const [showBooking, setShowBooking] = useState(false);
  const [showRide, setShowRide] = useState(false);
  
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  const getSuggestions = async (val: string, set: (suggestions: string[]) => void) => {
    if (val.length < 3) return set([]);
    try {
      const { data } = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: val, format: "json", addressdetails: 1, limit: 5, countrycodes: "in" },
        headers: { "Accept-Language": "en", "User-Agent": "rideshare-app-demo" }
      });
      set(data.filter((i: any) => ["city", "town", "village"].includes(i.type)).map((p: any) => p.display_name));
    } catch {
      set([]);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => getSuggestions(from, setFromSuggestions), 300);
    return () => clearTimeout(timeout);
  }, [from]);

  useEffect(() => {
    const timeout = setTimeout(() => getSuggestions(to, setToSuggestions), 300);
    return () => clearTimeout(timeout);
  }, [to]);

  const handleSelect = (value: string, setValue: (val: string) => void, setSuggestions: (sug: string[]) => void) => {
    setValue(value);
    setSuggestions([]);
  };

  const handleBlur = (ref: React.RefObject<HTMLDivElement>, setSuggestions: (sug: string[]) => void) => {
    setTimeout(() => {
      if (!ref.current?.contains(document.activeElement)) {
        setSuggestions([]);
      }
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) {
      setMessage("Please enter both pickup and destination cities.");
    } else {
      setMessage(`🚗 Searching for rides from ${from} to ${to} on ${date || "today"} for ${passengers} passenger(s). We'll find the best options for you!`);
    }
  };

  const closeMessage = () => setMessage("");

  const navItems = [
    { id: "search", icon: Home, label: "Search" },
    { id: "profile", icon: User, label: "Profile" },
    { id: "publish", icon: Car, label: "Publish" },
    { id: "history", icon: History, label: "History" },
    { id: "chat", icon: MessageCircle, label: "Chat" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Navigation */}
      <nav className="relative bg-white/90 backdrop-blur-xl border-b border-border/50 shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                RideShare
              </div>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-1">
                {navItems.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setActive(id)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                      active === id
                        ? "bg-gradient-primary text-white shadow-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-border/50 shadow-floating z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300 ${
                active === id
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="relative max-w-md mx-auto px-4 py-8 pb-24 md:pb-8">
        {active === "search" && (
          <div className="animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                Find Your Perfect Ride
              </h1>
              <p className="text-muted-foreground">
                Safe, affordable, and convenient travel
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSubmit} className="bg-gradient-card rounded-2xl shadow-floating border border-border/50 p-6 space-y-6">
              {/* From Field */}
              <div ref={fromRef} className="relative">
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Pickup Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary" size={20} />
                  <input
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    onBlur={() => handleBlur(fromRef, setFromSuggestions)}
                    placeholder="Where are you leaving from?"
                    className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm rounded-xl border border-border/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 outline-none"
                    autoComplete="off"
                  />
                </div>
                {fromSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-floating border border-border/50 overflow-hidden animate-scale-in">
                    {fromSuggestions.map((city, i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseDown={() => handleSelect(city, setFrom, setFromSuggestions)}
                        className="w-full text-left px-4 py-3 hover:bg-muted transition-colors duration-200 border-b border-border/20 last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-muted-foreground" />
                          <span className="text-sm">{city}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* To Field */}
              <div ref={toRef} className="relative">
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Destination
                </label>
                <div className="relative">
                  <ArrowRight className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary" size={20} />
                  <input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    onBlur={() => handleBlur(toRef, setToSuggestions)}
                    placeholder="Where are you going?"
                    className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm rounded-xl border border-border/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 outline-none"
                    autoComplete="off"
                  />
                </div>
                {toSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-floating border border-border/50 overflow-hidden animate-scale-in">
                    {toSuggestions.map((city, i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseDown={() => handleSelect(city, setTo, setToSuggestions)}
                        className="w-full text-left px-4 py-3 hover:bg-muted transition-colors duration-200 border-b border-border/20 last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowRight size={16} className="text-muted-foreground" />
                          <span className="text-sm">{city}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date and Passengers Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary" size={20} />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm rounded-xl border border-border/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Passengers
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary" size={20} />
                    <input
                      type="number"
                      min="1"
                      value={passengers}
                      onChange={(e) => setPassengers(Number(e.target.value))}
                      className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm rounded-xl border border-border/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 outline-none"
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="w-full bg-gradient-primary text-white font-semibold py-4 rounded-xl shadow-primary hover:shadow-floating transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Search size={20} />
                Find Rides
              </button>
            </form>
          </div>
        )}

        {/* History Menu */}
        {active === "history" && !showBooking && !showRide && (
          <div className="animate-fade-in bg-gradient-card rounded-2xl shadow-floating border border-border/50 p-8">
            <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-primary bg-clip-text text-transparent">
              Your History
            </h3>
            <div className="space-y-4">
              <button
                onClick={() => { setShowBooking(true); setShowRide(false); }}
                className="w-full p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-border/30 hover:shadow-card transition-all duration-300 hover:-translate-y-1 flex items-center gap-3"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Car className="text-primary" size={24} />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Booking History</div>
                  <div className="text-sm text-muted-foreground">View your ride bookings</div>
                </div>
              </button>
              <button
                onClick={() => { setShowRide(true); setShowBooking(false); }}
                className="w-full p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-border/30 hover:shadow-card transition-all duration-300 hover:-translate-y-1 flex items-center gap-3"
              >
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <History className="text-secondary" size={24} />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Ride History</div>
                  <div className="text-sm text-muted-foreground">View your published rides</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* History Components */}
        {active === "history" && showBooking && (
          <BookingHistory bookings={[]} onBack={() => { setShowBooking(false); setShowRide(false); }} />
        )}
        {active === "history" && showRide && (
          <RideHistory rides={[]} onBack={() => { setShowRide(false); setShowBooking(false); }} />
        )}

        {/* Other sections placeholder */}
        {(active === "profile" || active === "publish" || active === "chat") && (
          <div className="animate-fade-in bg-gradient-card rounded-2xl shadow-floating border border-border/50 p-8 text-center">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              {active.charAt(0).toUpperCase() + active.slice(1)}
            </h3>
            <p className="text-muted-foreground">This section is coming soon!</p>
          </div>
        )}
      </main>

      {/* Success Message Modal */}
      {message && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-floating border border-border/50 p-6 max-w-sm w-full animate-bounce-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Search Started!</h3>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">{message}</p>
              <button
                onClick={closeMessage}
                className="w-full bg-gradient-primary text-white font-semibold py-3 rounded-xl shadow-primary hover:shadow-floating transition-all duration-300"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchForm;
