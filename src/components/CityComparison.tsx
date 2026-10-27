import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  X,
  TrendingUp,
  Flame,
  Wind,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  CheckCircle,
  BarChart3,
  Award,
  RefreshCw,
  MapPin,
  Thermometer,
  Droplets,
  Navigation,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { getAQIBandInfo, calculateSmartRecommendations } from '../utils/aqiCalculations';
import { CityData } from '../types';

export const CityComparison: React.FC = () => {
  const {
    allCities,
    comparisonCityIds,
    setComparisonCityIds,
    addComparisonCity,
    removeComparisonCity,
    colorblindMode,
    user,
    setCurrentCity,
    setActiveTab,
    refreshCityData,
    isLiveSyncing,
  } = useApp();

  const [selectedPreset, setSelectedPreset] = useState<string>('');

  // Find all valid cities corresponding to the IDs
  const selectedCities = comparisonCityIds
    .map((id) => allCities.find((c) => c.id === id))
    .filter((c): c is CityData => c !== undefined);

  // Fallback if none found
  const validSelectedCities = selectedCities.length > 0 ? selectedCities : [allCities[0], allCities[1]];

  // Colors for multi-city comparisons
  const cityColors = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6'];

  // Bar chart dataset: Pollutants side by side
  const chartData = [
    {
      pollutant: 'PM2.5',
      ...validSelectedCities.reduce((acc, c) => ({ ...acc, [c.name]: c.pollutants.pm25 }), {}),
    },
    {
      pollutant: 'PM10',
      ...validSelectedCities.reduce((acc, c) => ({ ...acc, [c.name]: c.pollutants.pm10 }), {}),
    },
    {
      pollutant: 'NO2',
      ...validSelectedCities.reduce((acc, c) => ({ ...acc, [c.name]: c.pollutants.no2 }), {}),
    },
    {
      pollutant: 'SO2',
      ...validSelectedCities.reduce((acc, c) => ({ ...acc, [c.name]: c.pollutants.so2 }), {}),
    },
    {
      pollutant: 'O3',
      ...validSelectedCities.reduce((acc, c) => ({ ...acc, [c.name]: c.pollutants.o3 }), {}),
    },
  ];

  // AQI comparison chart data
  const aqiChartData = validSelectedCities.map((c, idx) => ({
    name: c.name,
    aqi: c.aqi,
    color: cityColors[idx % cityColors.length],
  }));

  // Presets
  const presets = [
    {
      label: 'Bengaluru vs Delhi vs Mumbai',
      ids: ['bengaluru', 'delhi', 'mumbai'],
    },
    {
      label: 'South India (Bengaluru, Chennai, Hyderabad)',
      ids: ['bengaluru', 'chennai', 'hyderabad'],
    },
    {
      label: 'Gangetic Plain (Delhi, Patna, Kanpur)',
      ids: ['delhi', 'patna', 'kanpur'],
    },
    {
      label: 'Maharashtra (Mumbai vs Pune)',
      ids: ['mumbai', 'pune'],
    },
  ];

  const handleApplyPreset = (ids: string[]) => {
    setComparisonCityIds(ids);
    setSelectedPreset(ids.join('-'));
  };

  // Find cleanest and most polluted
  const sortedByAQI = [...validSelectedCities].sort((a, b) => a.aqi - b.aqi);
  const cleanestCity = sortedByAQI[0];
  const mostPollutedCity = sortedByAQI[sortedByAQI.length - 1];

  const gridColsClass =
    validSelectedCities.length === 1
      ? 'grid-cols-1'
      : validSelectedCities.length === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : validSelectedCities.length === 3
      ? 'grid-cols-1 md:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-zinc-900 dark:text-zinc-100">
                Multi-City Comparative Analytics
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Real-time side-by-side pollutant delta analysis, health risk disparity, and meteorological impact.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & City Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {validSelectedCities.length < 4 && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addComparisonCity(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer shadow-xs"
            >
              <option value="" disabled>
                + Add City to Compare (Max 4)
              </option>
              {allCities
                .filter((c) => !comparisonCityIds.includes(c.id))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}, {c.state || c.country} (AQI {c.aqi})
                  </option>
                ))}
            </select>
          )}

          <button
            onClick={refreshCityData}
            disabled={isLiveSyncing}
            className="px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-bold flex items-center gap-1.5 hover:bg-sky-100 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLiveSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {/* Quick Comparison Presets Strip */}
      <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          Quick Presets:
        </span>
        {presets.map((preset) => {
          const isCurrent =
            preset.ids.length === comparisonCityIds.length &&
            preset.ids.every((id) => comparisonCityIds.includes(id));
          return (
            <button
              key={preset.label}
              onClick={() => handleApplyPreset(preset.ids)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isCurrent
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Side-by-Side City Overview Cards Grid */}
      <div className={`grid ${gridColsClass} gap-4`}>
        {validSelectedCities.map((city, idx) => {
          const band = getAQIBandInfo(city.aqi, colorblindMode);
          const health = calculateSmartRecommendations(city.aqi, user.healthProfile);
          const color = cityColors[idx % cityColors.length];

          return (
            <div
              key={city.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm relative flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div>
                {/* Header of city card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: color }}
                    />
                    <div>
                      <h2 className="font-black text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        {city.name}
                        {city.id === cleanestCity.id && validSelectedCities.length > 1 && (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            Cleanest Air
                          </span>
                        )}
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {city.state ? `${city.state}, ` : ''}{city.country}
                      </p>
                    </div>
                  </div>

                  {validSelectedCities.length > 1 && (
                    <button
                      onClick={() => removeComparisonCity(city.id)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* AQI Metric Highlight */}
                <div className="my-3.5 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Air Quality Index</div>
                    <div className="text-3xl font-black text-zinc-900 dark:text-white">
                      {city.aqi}
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 rounded-lg text-xs font-black uppercase text-white shadow-xs"
                    style={{ backgroundColor: band.displayColor }}
                  >
                    {band.label}
                  </span>
                </div>

                {/* Pollutant Metrics & Comparison vs WHO */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500">PM2.5 (Fine)</span>
                    <div className="text-right">
                      <strong className="text-zinc-900 dark:text-zinc-100">
                        {city.pollutants.pm25} µg/m³
                      </strong>
                      <span className="text-[10px] ml-1.5 text-zinc-400">
                        ({(city.pollutants.pm25 / 15).toFixed(1)}x WHO)
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500">PM10 (Dust)</span>
                    <div className="text-right">
                      <strong className="text-zinc-900 dark:text-zinc-100">
                        {city.pollutants.pm10} µg/m³
                      </strong>
                      <span className="text-[10px] ml-1.5 text-zinc-400">
                        ({(city.pollutants.pm10 / 45).toFixed(1)}x WHO)
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500">NO2 (Vehicular)</span>
                    <strong className="text-zinc-900 dark:text-zinc-100">
                      {city.pollutants.no2} µg/m³
                    </strong>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500">Dominant Gas</span>
                    <strong className="text-zinc-900 dark:text-zinc-100 uppercase">
                      {city.dominantPollutant}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500">Weather</span>
                    <strong className="text-zinc-900 dark:text-zinc-100">
                      {city.weather.temperature}°C • {city.weather.condition}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-zinc-500">Health Risk</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        health.riskTier === 'Critical'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : health.riskTier === 'High'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {health.riskTier} ({health.riskScore}/100)
                    </span>
                  </div>
                </div>
              </div>

              {/* Set Active Button */}
              <button
                onClick={() => {
                  setCurrentCity(city);
                  setActiveTab('dashboard');
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-900 dark:text-zinc-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Full {city.name} Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Comparative Bar Chart: Pollutants Side-by-Side */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Pollutant Concentration Delta (µg/m³)
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-medium">Lower is cleaner</span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.2} />
              <XAxis dataKey="pollutant" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderColor: '#27272a',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend />
              {validSelectedCities.map((city, idx) => (
                <Bar
                  key={city.id}
                  dataKey={city.name}
                  fill={cityColors[idx % cityColors.length]}
                  radius={[6, 6, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Analytical Takeaways Disparity Box */}
      {validSelectedCities.length >= 2 && (
        <div className="bg-sky-50/70 dark:bg-sky-950/30 rounded-2xl p-6 border border-sky-200 dark:border-sky-800/80 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h3 className="font-bold text-sm text-sky-950 dark:text-sky-100">
              Comparative Analytical Summary & Health Verdict
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-700 dark:text-zinc-300">
            {/* Cleaner Air Winner Card */}
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-sky-100 dark:border-sky-900/60 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <Award className="w-4 h-4" />
                <span>Cleanest Air Quality</span>
              </div>
              <div className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                {cleanestCity.name} (AQI {cleanestCity.aqi})
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                {cleanestCity.name} currently provides the lowest respiratory risk, with PM2.5 levels of{' '}
                {cleanestCity.pollutants.pm25} µg/m³.
              </p>
            </div>

            {/* Particulate Exposure Disparity */}
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-sky-100 dark:border-sky-900/60 space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Fine Particulate Disparity</span>
              </div>
              <div className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                {(mostPollutedCity.pollutants.pm25 / Math.max(1, cleanestCity.pollutants.pm25)).toFixed(1)}x Exposure Gap
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                Residents of {mostPollutedCity.name} inhale approximately{' '}
                {(mostPollutedCity.pollutants.pm25 / Math.max(1, cleanestCity.pollutants.pm25)).toFixed(1)} times more
                fine respirable PM2.5 particles than residents of {cleanestCity.name}.
              </p>
            </div>

            {/* Dominant Source Apportionment Contrast */}
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-sky-100 dark:border-sky-900/60 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                <Flame className="w-4 h-4" />
                <span>Primary Emission Drivers</span>
              </div>
              <div className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                Source Fingerprints
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                {validSelectedCities[0].name} is driven by {validSelectedCities[0].sourceBreakdown[0]?.category} (
                {validSelectedCities[0].sourceBreakdown[0]?.percentage}%), whereas in{' '}
                {validSelectedCities[1].name} it is governed by {validSelectedCities[1].sourceBreakdown[0]?.category} (
                {validSelectedCities[1].sourceBreakdown[0]?.percentage}%).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
