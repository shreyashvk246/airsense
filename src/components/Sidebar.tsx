import React from 'react';
import {
  Wind,
  Sliders,
  Map as MapIcon,
  BarChart3,
  Flame,
  ShieldAlert,
  Leaf,
  HelpCircle,
  Users,
  Bell,
  Info,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Eye,
  Radio,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab, UserRole } from '../types';
import { getAQIBandInfo } from '../utils/aqiCalculations';

interface NavGroup {
  title: string;
  items: {
    id: ActiveTab;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    sidebarOpen,
    toggleSidebar,
    currentCity,
    selectCityById,
    allCities,
    theme,
    toggleTheme,
    colorblindMode,
    toggleColorblindMode,
    user,
    setUserRole,
    isLiveSyncing,
    refreshCityData,
    lastSyncTime,
  } = useApp();

  const currentBand = getAQIBandInfo(currentCity.aqi, colorblindMode);

  const navGroups: NavGroup[] = [
    {
      title: 'Real-Time Monitoring',
      items: [
        {
          id: 'dashboard',
          label: 'Live Dashboard',
          description: 'Real-time AQI, pollutants & weather',
          icon: Wind,
          badge: 'Live',
        },
        {
          id: 'comparison',
          label: 'Compare Cities',
          description: 'Side-by-side multi-city matrix',
          icon: Sliders,
          badge: 'Popular',
        },
        {
          id: 'map',
          label: 'AQI Heatmap & Fires',
          description: 'Live sensor map, wind & hotspots',
          icon: MapIcon,
        },
        {
          id: 'city-detail',
          label: 'City Detail & Trends',
          description: '24h/7d forecasts & radar profiles',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'Pollution Modeling',
      items: [
        {
          id: 'source-analysis',
          label: 'Source Apportionment',
          description: 'Stubble, vehicular & industrial loads',
          icon: Flame,
        },
        {
          id: 'simulator',
          label: 'Policy Simulator',
          description: 'Simulate emissions reductions',
          icon: ShieldAlert,
        },
        {
          id: 'carbon-calculator',
          label: 'Carbon Calculator',
          description: 'Personal footprint & offset tracker',
          icon: Leaf,
        },
      ],
    },
    {
      title: 'Health & Community',
      items: [
        {
          id: 'awareness-hub',
          label: 'Awareness & Purifiers',
          description: 'EPA advice & DIY air purifier guide',
          icon: HelpCircle,
        },
        {
          id: 'community-reports',
          label: 'Citizen Science',
          description: 'Community ground-truth observations',
          icon: Users,
        },
        {
          id: 'alerts',
          label: 'Alerts & Thresholds',
          description: 'Custom notifications & health limits',
          icon: Bell,
        },
      ],
    },
    {
      title: 'Data & Governance',
      items: [
        {
          id: 'provenance',
          label: 'Data Methodology',
          description: 'Sensor provenance & CPCB/WHO rules',
          icon: Info,
        },
        ...(user.role === 'admin'
          ? [
              {
                id: 'admin-console' as ActiveTab,
                label: 'Admin & Anomaly Console',
                description: 'Network moderation & sensor spikes',
                icon: ShieldCheck,
                badge: 'Admin',
              },
            ]
          : []),
      ],
    },
  ];

  const popularCities = ['bengaluru', 'delhi', 'mumbai', 'pune', 'chennai'];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 flex flex-col justify-between ${
          sidebarOpen ? 'w-72 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        {/* Top Branding Section */}
        <div>
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Wind className="w-5 h-5" />
              </div>
              {sidebarOpen && (
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-lg tracking-tight text-zinc-900 dark:text-zinc-100">
                      AirSense
                    </span>
                    <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300">
                      Live
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium">Real-Time AQI Platform</p>
                </div>
              )}
            </div>

            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Real-time Status Banner */}
          {sidebarOpen ? (
            <div className="px-4 py-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Sensors Active</span>
              </div>
              <button
                onClick={refreshCityData}
                disabled={isLiveSyncing}
                className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline"
                title="Refresh real-time telemetry"
              >
                <RefreshCw className={`w-3 h-3 ${isLiveSyncing ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            </div>
          ) : (
            <div className="py-2 flex justify-center border-b border-zinc-200 dark:border-zinc-800">
              <span className="relative flex h-2.5 w-2.5" title="Live sensor network active">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
          )}

          {/* Quick Active City Card */}
          {sidebarOpen && (
            <div className="p-3 mx-3 my-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {currentCity.name}
                  </span>
                </div>
                <span
                  className="px-2 py-0.5 rounded text-[11px] font-black uppercase text-white shadow-xs"
                  style={{ backgroundColor: currentBand.displayColor }}
                >
                  AQI {currentCity.aqi}
                </span>
              </div>

              {/* Quick switch popular cities */}
              <div className="mt-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-700/50 flex flex-wrap gap-1">
                {popularCities.map((cId) => {
                  const city = allCities.find((c) => c.id === cId);
                  if (!city) return null;
                  const isCurrent = currentCity.id === cId;
                  return (
                    <button
                      key={cId}
                      onClick={() => selectCityById(cId)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        isCurrent
                          ? 'bg-sky-600 text-white font-bold'
                          : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {city.name.replace('New ', '')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
          {navGroups.map((group) => (
            <div key={group.title}>
              {sidebarOpen && (
                <div className="px-2 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {group.title}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all group ${
                        isActive
                          ? 'bg-sky-600 text-white font-bold shadow-sm shadow-sky-500/20'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
                      }`}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? 'text-white'
                            : 'text-zinc-500 dark:text-zinc-400 group-hover:text-sky-600 dark:group-hover:text-sky-400'
                        }`}
                      />
                      {sidebarOpen && (
                        <div className="flex-1 min-w-0 flex items-center justify-between">
                          <div className="truncate">
                            <span className="text-xs block leading-tight">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={`ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase shrink-0 ${
                                isActive
                                  ? 'bg-white text-sky-800'
                                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Utility Controls */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          {/* Quick Comparison Callout */}
          {sidebarOpen && (
            <button
              onClick={() => setActiveTab('comparison')}
              className="w-full py-2 px-2.5 rounded-xl bg-linear-to-r from-sky-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-between shadow-xs hover:opacity-95 transition-all"
            >
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Compare Cities</span>
              </div>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">3 Active</span>
            </button>
          )}


          {/* Theme & Colorblind controls */}
          <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} gap-2`}>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            <button
              onClick={toggleColorblindMode}
              className={`p-2 rounded-xl transition-colors ${
                colorblindMode
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title={`Colorblind mode: ${colorblindMode ? 'ON' : 'OFF'}`}
            >
              <Eye className="w-4 h-4" />
            </button>

            {sidebarOpen && (
              <div className="text-[10px] text-zinc-400 font-medium">
                v2.4 • CPCB Live
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
