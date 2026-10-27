/**
 * AirSense Real-Time AQI & Weather API Client
 */

export interface RealtimeAQIResponse {
  success: boolean;
  city: string;
  state: string;
  country: string;
  coordinates: { lat: number; lng: number };
  aqi: number;
  band: 'good' | 'moderate' | 'sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';
  dominantPollutant: 'pm25' | 'pm10' | 'no2' | 'so2' | 'co' | 'o3';
  pollutants: {
    pm25: number;
    pm10: number;
    no2: number;
    so2: number;
    co: number;
    o3: number;
  };
  weather: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    windDegree: number;
    pressure: number;
    uvIndex: number;
    visibility: number;
    condition: string;
    dewPoint: number;
  };
  hourlyForecast: Array<{
    time: string;
    aqi: number;
    band: string;
    pm25: number;
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: string;
  }>;
  dailyForecast: Array<{
    day: string;
    shortDay: string;
    aqiMin: number;
    aqiMax: number;
    aqiAvg: number;
    band: string;
    pm25Avg: number;
    tempHigh: number;
    tempLow: number;
    condition: string;
    recommendation: string;
  }>;
  stationName: string;
  validationSource: string;
  lastUpdated: string;
  isRealtimeLive: boolean;
}

export interface BangaloreStation {
  id: string;
  name: string;
  agency: string;
  area: string;
  lat: number;
  lng: number;
  aqi: number;
  band: string;
  pm25: number;
  pm10: number;
  status: string;
  dominant: string;
  lastUpdate: string;
}

export const apiService = {
  // Fetch real-time AQI for a city or coordinates
  async getRealtimeAQI(city: string, lat?: number, lng?: number): Promise<RealtimeAQIResponse | null> {
    try {
      const params = new URLSearchParams();
      params.set('city', city);
      if (lat !== undefined && lng !== undefined) {
        params.set('lat', lat.toString());
        params.set('lng', lng.toString());
      }
      const res = await fetch(`/api/aqi/realtime?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[AirSense API] Live fetch error, fallback active:', err);
      return null;
    }
  },

  // Fetch comparison data for multiple cities
  async getCompareCities(cityIds: string[]): Promise<any> {
    try {
      const res = await fetch(`/api/aqi/compare?cities=${encodeURIComponent(cityIds.join(','))}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[AirSense API] Compare fetch error:', err);
      return null;
    }
  },

  // Fetch Bangalore micro-stations network
  async getBangaloreStations(): Promise<BangaloreStation[]> {
    try {
      const res = await fetch('/api/bangalore/stations');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.stations || [];
    } catch (err) {
      console.warn('[AirSense API] Bangalore stations fetch error:', err);
      return [];
    }
  },

  // Submit community report
  async submitReport(report: any) {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[AirSense API] Submit report error:', err);
      return null;
    }
  },
};
