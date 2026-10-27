import React, { useState } from 'react';
import {
  Menu,
  Search,
  MapPin,
  RefreshCw,
  Bell,
  X,
  ShieldCheck,
  ChevronRight,
  Sliders,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAQIBandInfo } from '../utils/aqiCalculations';
import { UserRole } from '../types';

export const Header: React.FC = () => {
  const {
    toggleSidebar,
    currentCity,
    allCities,
    selectCityById,
    colorblindMode,
    user,
    setUserRole,
    refreshCityData,
    isLiveSyncing,
    lastSyncTime,
    alertNotification,
    dismissNotification,
    searchQuery,
    setSearchQuery,
    setActiveTab,
  } = useApp();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const currentBandInfo = getAQIBandInfo(currentCity.aqi, colorblindMode);

  const filteredCities = allCities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.state && c.state.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quickCities = ['bengaluru', 'delhi', 'mumbai', 'pune', 'chennai'];

  const roleLabels: Record<UserRole, { title: string; badge: string }> = {
    guest: { title: 'Guest Explorer', badge: 'Guest' },
    registered: { title: 'Alex Mercer', badge: 'User' },
    contributor: { title: 'Dr. Priya Sharma', badge: 'Contributor' },
    admin: { title: 'Sarah Jenkins', badge: 'Admin' },
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      {/* Toast Alert Notification Banner */}
      {alertNotification && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 max-w-5xl mx-auto flex-1">
            <span>{alertNotification}</span>
          </div>
          <button
            onClick={dismissNotification}
            className="p-1 hover:bg-white/20 rounded transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Sidebar Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Toggle Sidebar Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb Hierarchy (matching aqi.in structure) */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 truncate">
            <span
              onClick={() => setActiveTab('dashboard')}
              className="cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 font-medium"
            >
              India
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {currentCity.state || 'National'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-extrabold text-zinc-900 dark:text-white flex items-center gap-1">
              <MapPin className="w-3 h-3 text-sky-600" />
              {currentCity.name}
            </span>
          </div>
        </div>

        {/* Center: Quick Switcher Badges */}
        <div className="hidden md:flex items-center gap-1.5">
          {quickCities.map((id) => {
            const city = allCities.find((c) => c.id === id);
            if (!city) return null;
            const isSelected = currentCity.id === id;
            return (
              <button
                key={id}
                onClick={() => selectCityById(id)}
                className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                  isSelected
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium'
                }`}
              >
                {city.name}
              </button>
            );
          })}
        </div>

        {/* Right: Search, Real-Time Sync & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-medium transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search city...</span>
            </button>

            {/* Search Dropdown Modal */}
            {isSearchOpen && (
              <div className="absolute right-0 top-11 w-72 sm:w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                  <Search className="w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Bengaluru, Delhi, Mumbai..."
                    autoFocus
                    className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-zinc-400 hover:text-zinc-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="mt-2 max-h-56 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredCities.map((c) => {
                    const band = getAQIBandInfo(c.aqi, colorblindMode);
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          selectCityById(c.id);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full py-2 px-2.5 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60 rounded-lg transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {c.name}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {c.state}, {c.country}
                          </div>
                        </div>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-white shadow-xs"
                          style={{ backgroundColor: band.displayColor }}
                        >
                          AQI {c.aqi}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Real-time Refresh Action */}
          <button
            onClick={refreshCityData}
            disabled={isLiveSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-xs font-bold transition-all"
            title={`Real-time data synced at ${lastSyncTime}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLiveSyncing ? 'Syncing...' : 'Live Sync'}</span>
          </button>

          {/* Role & Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="hidden sm:inline">{roleLabels[user.role].title}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-700 font-bold uppercase">
                {roleLabels[user.role].badge}
              </span>
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 top-11 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-2 z-50">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-zinc-400">
                  Switch Persona / Role
                </div>
                {(['registered', 'contributor', 'admin', 'guest'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setUserRole(r);
                      setIsRoleMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium flex items-center justify-between ${
                      user.role === r
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span>{roleLabels[r].title}</span>
                    <span className="text-[10px] uppercase text-zinc-400">{r}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
