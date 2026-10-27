import React, { useState } from 'react';
import {
  Wind,
  Shield,
  ShieldAlert,
  Activity,
  Thermometer,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Flame,
  Home,
  CheckCircle2,
  Droplets,
  Eye,
  Zap,
  MapPin,
  Clock,
  Radio,
  Sliders,
  Calendar,
  Compass,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { getAQIBandInfo, calculateSmartRecommendations } from '../utils/aqiCalculations';
import { PollutantValues } from '../types';

export const Dashboard: React.FC = () => {
  const {
    currentCity,
    allCities,
    selectCityById,
    toggleSaveCity,
    isCitySaved,
    colorblindMode,
    user,
    setActiveTab,
    bangaloreStations,
    isLiveSyncing,
    refreshCityData,
    lastSyncTime,
    setComparisonCityIds,
  } = useApp();

  const [forecastTab, setForecastTab] = useState<'hourly' | 'daily'>('hourly');

  const bandInfo = getAQIBandInfo(currentCity.aqi, colorblindMode);
  const healthRecs = calculateSmartRecommendations(currentCity.aqi, user.healthProfile);
  const isSaved = isCitySaved(currentCity.id);

  // Sort cities for rankings
  const mostPolluted = [...allCities].sort((a, b) => b.aqi - a.aqi).slice(0, 5);
  const cleanestCities = [...allCities].sort((a, b) => a.aqi - b.aqi).slice(0, 5);

  const pollutantMeta: Record<
    keyof PollutantValues,
    { name: string; short: string; unit: string; whoLimit: number; impact: string }
  > = {
    pm25: {
      name: 'Fine Particles (PM2.5)',
      short: 'PM2.5',
      unit: 'µg/m³',
      whoLimit: 15,
      impact: 'Deep pulmonary and bloodstream penetration',
    },
    pm10: {
      name: 'Respirable Dust (PM10)',
      short: 'PM10',
      unit: 'µg/m³',
      whoLimit: 45,
      impact: 'Airway, bronchial and throat irritation',
    },
    no2: {
      name: 'Nitrogen Dioxide (NO2)',
      short: 'NO2',
      unit: 'µg/m³',
      whoLimit: 25,
      impact: 'Vehicle traffic & diesel combustion byproduct',
    },
    so2: {
      name: 'Sulfur Dioxide (SO2)',
      short: 'SO2',
      unit: 'µg/m³',
      whoLimit: 40,
      impact: 'Coal thermal plants and heavy industrial emissions',
    },
    co: {
      name: 'Carbon Monoxide (CO)',
      short: 'CO',
      unit: 'mg/m³',
      whoLimit: 4,
      impact: 'Incomplete fuel combustion reduces oxygen uptake',
    },
    o3: {
      name: 'Ground Ozone (O3)',
      short: 'O3',
      unit: 'µg/m³',
      whoLimit: 100,
      impact: 'Photochemical smog triggered by intense sunlight',
    },
  };

  const getPollutantStatus = (key: keyof PollutantValues, value: number) => {
    const limit = pollutantMeta[key].whoLimit;
    const ratio = value / limit;
    if (ratio <= 1.0)
      return {
        label: 'Safe (WHO)',
        color:
          'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
      };
    if (ratio <= 2.5)
      return {
        label: `${ratio.toFixed(1)}x WHO`,
        color:
          'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
      };
    return {
      label: `${ratio.toFixed(1)}x WHO`,
      color:
        'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
    };
  };

  const handleQuickCompare = (targetCityId: string) => {
    setComparisonCityIds([currentCity.id, targetCityId]);
    setActiveTab('comparison');
  };

  // Hourly chart dataset
  const hourlyChartData = (currentCity.hourlyForecast || []).map((h) => ({
    time: h.time,
    aqi: h.aqi,
    pm25: h.pm25,
    temp: h.temperature,
  }));

  const isBangalore = currentCity.id === 'bengaluru' || currentCity.name.toLowerCase().includes('bengaluru') || currentCity.name.toLowerCase().includes('bangalore');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* aqi.in Style Breadcrumb & Header Location Strip */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1">
            <span>Home</span>
            <span>/</span>
            <span>India</span>
            <span>/</span>
            <span>{currentCity.state || 'State'}</span>
            <span>/</span>
            <span className="text-zinc-800 dark:text-zinc-200 font-bold">{currentCity.name} AQI</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              {currentCity.name} Air Quality Index (AQI)
            </h1>
            <span className="relative flex h-2.5 w-2.5" title="Real-time live sensor connected">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time Continuous Ambient Air Quality Monitoring Station • Updated: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{lastSyncTime}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleQuickCompare(currentCity.id === 'bengaluru' ? 'delhi' : 'bengaluru')}
            className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-600" />
            <span>Compare City</span>
          </button>

          <button
            onClick={refreshCityData}
            disabled={isLiveSyncing}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveSyncing ? 'animate-spin' : ''}`} />
            <span>{isLiveSyncing ? 'Updating...' : 'Live Refresh'}</span>
          </button>

          <button
            onClick={() => toggleSaveCity(currentCity.id)}
            className={`p-2 rounded-xl border transition-all ${
              isSaved
                ? 'bg-sky-100 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
            title={isSaved ? 'Saved in favorites' : 'Save city'}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Hero Grid: AQI Gauge Card + Smart Health & Activity Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Prominent AQI Gauge (aqi.in style) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: bandInfo.displayColor }}
          />

          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  Current Air Quality Observation
                </span>
                <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-500" />
                  <span>{currentCity.stationName}</span>
                </div>
              </div>
            </div>

            {/* Giant AQI Gauge Block */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 my-6 p-5 rounded-2xl bg-zinc-50/90 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/80">
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg font-black shrink-0"
                style={{ backgroundColor: bandInfo.displayColor }}
              >
                <span className="text-4xl sm:text-5xl leading-none font-mono font-black">{currentCity.aqi}</span>
                <span className="text-[11px] uppercase font-bold tracking-widest mt-1 opacity-90">AQI</span>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="px-3 py-1 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wide text-white shadow-xs"
                    style={{ backgroundColor: bandInfo.displayColor }}
                  >
                    {bandInfo.label}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                    Dominant: <strong className="text-zinc-900 dark:text-zinc-100 uppercase">{currentCity.dominantPollutant}</strong>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                  {bandInfo.generalDescription}
                </p>

                <div className="text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                  WHO PM2.5 Annual Guideline: 15 µg/m³ • Current: <strong className="text-zinc-800 dark:text-zinc-200">{currentCity.pollutants.pm25} µg/m³</strong> ({((currentCity.pollutants.pm25 / 15)).toFixed(1)}x WHO guideline)
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-400 text-[10px] uppercase font-bold">Main Pollutant</span>
              <div className="font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
                {currentCity.dominantPollutant.toUpperCase()} ({currentCity.pollutants[currentCity.dominantPollutant]} µg/m³)
              </div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-400 text-[10px] uppercase font-bold">National Ranking</span>
              <div className="font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">
                #{currentCity.rankingGlobal} in India
              </div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
              <span className="text-zinc-400 text-[10px] uppercase font-bold">Inversion Trapping</span>
              <div className={`font-extrabold mt-0.5 ${
                currentCity.inversionRisk === 'Severe' ? 'text-rose-600 dark:text-rose-400' :
                currentCity.inversionRisk === 'High' ? 'text-amber-600 dark:text-amber-400' :
                'text-emerald-600 dark:text-emerald-400'
              }`}>
                {currentCity.inversionRisk} Risk
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Health Advisory & Activity Guidance (aqi.in style) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <h2 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                  Health & Activity Advisories
                </h2>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                  healthRecs.riskTier === 'Critical'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : healthRecs.riskTier === 'High'
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                    : healthRecs.riskTier === 'Elevated'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {healthRecs.riskTier} Risk ({healthRecs.riskScore}/100)
              </span>
            </div>

            {/* Actionable Health Guidance Tiles */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 flex items-start gap-3">
                <Shield className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Mask Recommendation</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">{healthRecs.maskRecommendation}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 flex items-start gap-3">
                <Home className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Windows & Ventilation</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">{healthRecs.windowVentilationAdvice}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60 flex items-start gap-3">
                <Activity className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Outdoor Sports & Jogging</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">{healthRecs.outdoorExerciseAdvice}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
            <button
              onClick={() => setActiveTab('awareness-hub')}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>DIY Purifiers & EPA Guidelines</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className="px-3 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors flex items-center gap-1 shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Atmospheric Weather Metrics Strip (aqi.in style) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-amber-500" />
            <h2 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
              Live Weather & Atmospheric Conditions
            </h2>
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Condition: <strong className="text-zinc-800 dark:text-zinc-200">{currentCity.weather.condition}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-center">
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Temperature</div>
            <div className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">{currentCity.weather.temperature}°C</div>
            <div className="text-[10px] text-zinc-400">Feels {currentCity.weather.feelsLike}°C</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-center">
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Humidity</div>
            <div className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">{currentCity.weather.humidity}%</div>
            <div className="text-[10px] text-zinc-400">Dew {currentCity.weather.dewPoint}°C</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-center">
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Wind Vector</div>
            <div className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">{currentCity.weather.windSpeed} <span className="text-[10px] font-normal">km/h</span></div>
            <div className="text-[10px] text-zinc-400 flex items-center justify-center gap-1">
              <Compass className="w-3 h-3 text-sky-500" />
              <span>{currentCity.weather.windDirection} ({currentCity.weather.windDegree}°)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-center">
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Pressure</div>
            <div className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">{currentCity.weather.pressure} <span className="text-[10px] font-normal">hPa</span></div>
            <div className="text-[10px] text-zinc-400">Atmospheric</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-center">
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">UV Index</div>
            <div className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">{currentCity.weather.uvIndex} <span className="text-[10px] font-normal">/ 12</span></div>
            <div className="text-[10px] text-zinc-400">{currentCity.weather.uvIndex > 7 ? 'Very High' : 'Moderate'}</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-center">
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Visibility</div>
            <div className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">{currentCity.weather.visibility} <span className="text-[10px] font-normal">km</span></div>
            <div className="text-[10px] text-zinc-400">{currentCity.weather.visibility < 3 ? 'Smog Veil' : 'Clear Sight'}</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-center col-span-2 sm:col-span-4 lg:col-span-1">
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Dispersion</div>
            <div className="text-lg font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
              {currentCity.weather.windSpeed < 8 ? 'Stagnant' : 'Active'}
            </div>
            <div className="text-[10px] text-zinc-400">Ablation Layer</div>
          </div>
        </div>
      </div>

      {/* Pollutant Breakdown Matrix (6 Cards) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
              Pollutant Breakdown & WHO Standards
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Continuous CAAQMS readings compared to WHO safe exposure thresholds.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('city-detail')}
            className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 hover:underline shrink-0"
          >
            <span>Detailed Analysis</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(Object.keys(pollutantMeta) as (keyof PollutantValues)[]).map((key) => {
            const meta = pollutantMeta[key];
            const value = currentCity.pollutants[key];
            const status = getPollutantStatus(key, value);
            const isDominant = currentCity.dominantPollutant === key;

            return (
              <div
                key={key}
                className={`p-4 rounded-xl border transition-all ${
                  isDominant
                    ? 'bg-sky-50/40 dark:bg-sky-950/20 border-sky-300 dark:border-sky-800 shadow-xs'
                    : 'bg-zinc-50/80 dark:bg-zinc-800/40 border-zinc-200/70 dark:border-zinc-700/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {meta.name}
                      </span>
                      {isDominant && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-sky-600 text-white uppercase">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="text-xl font-black text-zinc-900 dark:text-white mt-1">
                      {value}{' '}
                      <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                        {meta.unit}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Progress Bar vs WHO Limit */}
                <div className="mt-2.5">
                  <div className="flex justify-between text-[10px] text-zinc-400 font-medium mb-1">
                    <span>WHO Limit: {meta.whoLimit} {meta.unit}</span>
                    <span>{((value / meta.whoLimit) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        value > meta.whoLimit * 2.5
                          ? 'bg-rose-500'
                          : value > meta.whoLimit
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (value / (meta.whoLimit * 3)) * 100)}%` }}
                    />
                  </div>
                </div>

                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-2">
                  {meta.impact}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bengaluru Micro-Stations Network (Matching aqi.in/in/dashboard/india/karnataka/bangalore) */}
      {isBangalore && bangaloreStations && bangaloreStations.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-600" />
                <h2 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                  Bengaluru Real-Time Monitoring Stations (KSPCB Network)
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Live sensor readouts across major junctions, IT tech parks, and residential sectors.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {bangaloreStations.length} Active Stations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {bangaloreStations.map((station) => {
              const sBand = getAQIBandInfo(station.aqi, colorblindMode);
              return (
                <div
                  key={station.id}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-black text-sm text-zinc-900 dark:text-zinc-100">
                        {station.name}
                      </h3>
                      <p className="text-[10px] text-zinc-400">{station.agency} • {station.area}</p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-black uppercase text-white shadow-xs shrink-0"
                      style={{ backgroundColor: sBand.displayColor }}
                    >
                      AQI {station.aqi}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-200/50 dark:border-zinc-700/50">
                    <div>
                      <span className="text-zinc-400 text-[10px]">PM2.5:</span>{' '}
                      <strong className="text-zinc-800 dark:text-zinc-200">{station.pm25} µg/m³</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-[10px]">PM10:</span>{' '}
                      <strong className="text-zinc-800 dark:text-zinc-200">{station.pm10} µg/m³</strong>
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-400 flex items-center justify-between">
                    <span>Main: {station.dominant}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{station.lastUpdate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 24-Hour & 7-Day Forecast Center */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <h2 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                Air Quality Forecast & Projections
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Atmospheric modeling and meteorology assimilation.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs">
            <button
              onClick={() => setForecastTab('hourly')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                forecastTab === 'hourly'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              24-Hour Trend
            </button>
            <button
              onClick={() => setForecastTab('daily')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                forecastTab === 'daily'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              7-Day Daily Outlook
            </button>
          </div>
        </div>

        {forecastTab === 'hourly' ? (
          <div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.15} />
                  <XAxis dataKey="time" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="aqi"
                    name="AQI Score"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#aqiGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center text-xs text-zinc-400">
              Hourly trajectory showing diurnal boundary layer fluctuations
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {(currentCity.dailyForecast || []).slice(0, 7).map((d) => {
              const dBand = getAQIBandInfo(d.aqiAvg, colorblindMode);
              return (
                <div
                  key={d.day}
                  className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 text-center space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-black text-zinc-900 dark:text-zinc-100">{d.shortDay}</div>
                    <div className="text-[10px] text-zinc-400">{d.day.split(',')[1]}</div>
                  </div>

                  <div className="py-1">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-black uppercase text-white shadow-xs inline-block"
                      style={{ backgroundColor: dBand.displayColor }}
                    >
                      AQI {d.aqiAvg}
                    </span>
                    <div className="text-[10px] text-zinc-500 mt-1 font-semibold">{dBand.shortLabel}</div>
                  </div>

                  <div className="text-[10px] text-zinc-400 border-t border-zinc-200/50 dark:border-zinc-700/50 pt-1.5">
                    {d.tempHigh}° / {d.tempLow}°C
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rankings Side-by-Side: Most Polluted vs Cleanest */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-rose-500" />
            <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              National Rankings: Most Polluted Monitored Cities
            </h2>
          </div>
          <div className="space-y-1.5">
            {mostPolluted.map((city, idx) => {
              const band = getAQIBandInfo(city.aqi, colorblindMode);
              const isSelected = city.id === currentCity.id;
              return (
                <button
                  key={city.id}
                  onClick={() => selectCityById(city.id)}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 font-bold'
                      : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200/60 dark:border-zinc-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <span className="w-4 text-xs font-extrabold text-zinc-400">{idx + 1}.</span>
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {city.name}, <span className="text-zinc-500 font-normal">{city.state}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Primary: {city.dominantPollutant.toUpperCase()} ({city.pollutants[city.dominantPollutant]} µg/m³)
                      </div>
                    </div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-black text-white"
                    style={{ backgroundColor: band.displayColor }}
                  >
                    {city.aqi} AQI
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              National Rankings: Cleanest Monitored Cities
            </h2>
          </div>
          <div className="space-y-1.5">
            {cleanestCities.map((city, idx) => {
              const band = getAQIBandInfo(city.aqi, colorblindMode);
              const isSelected = city.id === currentCity.id;
              return (
                <button
                  key={city.id}
                  onClick={() => selectCityById(city.id)}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 font-bold'
                      : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200/60 dark:border-zinc-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <span className="w-4 text-xs font-extrabold text-zinc-400">{idx + 1}.</span>
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {city.name}, <span className="text-zinc-500 font-normal">{city.state}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Coastal / Mountain Clean Airflow
                      </div>
                    </div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-black text-white"
                    style={{ backgroundColor: band.displayColor }}
                  >
                    {city.aqi} AQI
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
