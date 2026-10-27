import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CityData,
  ActiveTab,
  UserAccount,
  UserRole,
  CommunityReport,
  CarbonFootprintEntry,
  UserHealthProfile,
} from '../types';
import {
  CITIES_DATA,
  INITIAL_USER,
  MOCK_COMMUNITY_REPORTS,
  MOCK_CARBON_HISTORY,
} from '../data/mockData';
import { apiService, BangaloreStation } from '../services/apiService';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  colorblindMode: boolean;
  toggleColorblindMode: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  currentCity: CityData;
  setCurrentCity: (city: CityData) => void;
  selectCityById: (id: string) => void;
  allCities: CityData[];
  savedCityIds: string[];
  toggleSaveCity: (cityId: string) => void;
  isCitySaved: (cityId: string) => boolean;
  user: UserAccount;
  setUserRole: (role: UserRole) => void;
  updateHealthProfile: (profile: Partial<UserHealthProfile>) => void;
  updateAlertThreshold: (threshold: number, enabled: boolean) => void;
  comparisonCityIds: string[];
  setComparisonCityIds: (ids: string[]) => void;
  addComparisonCity: (id: string) => void;
  removeComparisonCity: (id: string) => void;
  communityReports: CommunityReport[];
  addCommunityReport: (report: Omit<CommunityReport, 'id' | 'timestamp' | 'upvotes' | 'status'>) => void;
  upvoteReport: (reportId: string) => void;
  moderateReport: (reportId: string, status: CommunityReport['status']) => void;
  carbonHistory: CarbonFootprintEntry[];
  addCarbonEntry: (entry: Omit<CarbonFootprintEntry, 'id'>) => void;
  recordQuizSuccess: (points: number) => void;
  cacheTimeRemaining: number;
  refreshCityData: () => Promise<void>;
  isLiveSyncing: boolean;
  lastSyncTime: string;
  bangaloreStations: BangaloreStation[];
  alertNotification: string | null;
  dismissNotification: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('airsense_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // fallback
    }
    return 'light';
  });

  const [colorblindMode, setColorblindMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('airsense_colorblind') === 'true';
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Set default city to Bengaluru (matching requested https://www.aqi.in/in/dashboard/india/karnataka/bangalore)
  const [currentCity, setCurrentCity] = useState<CityData>(() => {
    const blr = CITIES_DATA.find((c) => c.id === 'bengaluru');
    return blr || CITIES_DATA[0];
  });

  const [allCities, setAllCities] = useState<CityData[]>(CITIES_DATA);
  const [user, setUser] = useState<UserAccount>(INITIAL_USER);
  const [savedCityIds, setSavedCityIds] = useState<string[]>(INITIAL_USER.savedCityIds);
  
  // Valid default cities for compare: Bengaluru, Delhi, Mumbai
  const [comparisonCityIds, setComparisonCityIds] = useState<string[]>(['bengaluru', 'delhi', 'mumbai']);
  
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>(MOCK_COMMUNITY_REPORTS);
  const [carbonHistory, setCarbonHistory] = useState<CarbonFootprintEntry[]>(MOCK_CARBON_HISTORY);
  const [cacheTimeRemaining, setCacheTimeRemaining] = useState<number>(720); // 12 mins in seconds
  const [alertNotification, setAlertNotification] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [bangaloreStations, setBangaloreStations] = useState<BangaloreStation[]>([]);

  // Handle Theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    try {
      localStorage.setItem('airsense_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Handle Colorblind mode persistence
  useEffect(() => {
    try {
      localStorage.setItem('airsense_colorblind', String(colorblindMode));
    } catch {
      // ignore
    }
  }, [colorblindMode]);

  // Load Bangalore micro-stations on mount
  useEffect(() => {
    apiService.getBangaloreStations().then((stations) => {
      if (stations && stations.length > 0) {
        setBangaloreStations(stations);
      }
    });
  }, []);

  // Fetch real-time data for the current city
  const fetchLiveCityData = useCallback(async (city: CityData) => {
    setIsLiveSyncing(true);
    try {
      const liveData = await apiService.getRealtimeAQI(
        city.id,
        city.coordinates.lat,
        city.coordinates.lng
      );
      if (liveData && liveData.success) {
        setCurrentCity((prev) => ({
          ...prev,
          aqi: liveData.aqi,
          band: liveData.band as any,
          dominantPollutant: liveData.dominantPollutant as any,
          pollutants: liveData.pollutants,
          weather: {
            ...prev.weather,
            ...liveData.weather,
            condition: (liveData.weather.condition as any) || prev.weather.condition,
          },
          hourlyForecast: liveData.hourlyForecast as any,
          dailyForecast: liveData.dailyForecast as any,
          lastUpdated: 'Live CPCB/Atmospheric Feed (Just Now)',
          validationSource: liveData.validationSource,
        }));
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (e) {
      console.warn('Real-time sync error, local high-fidelity model active:', e);
    } finally {
      setIsLiveSyncing(false);
    }
  }, []);

  // Run initial real-time sync
  useEffect(() => {
    fetchLiveCityData(currentCity);
  }, [currentCity.id]);

  // Cache countdown timer (10-15m TTL)
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheTimeRemaining((prev) => {
        if (prev <= 1) {
          fetchLiveCityData(currentCity);
          return 900;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentCity, fetchLiveCityData]);

  // Alert simulation when current city crosses alert threshold
  useEffect(() => {
    if (user.alertsEnabled && currentCity.aqi >= user.alertThreshold) {
      setAlertNotification(
        `⚠️ AQI Alert for ${currentCity.name}: Current reading of ${currentCity.aqi} exceeds your safe threshold limit of ${user.alertThreshold}. Wear an N95 mask outdoors.`
      );
    }
  }, [currentCity.aqi, user.alertThreshold, user.alertsEnabled, currentCity.name]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleColorblindMode = () => {
    setColorblindMode((prev) => !prev);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const selectCityById = (id: string) => {
    const found = allCities.find((c) => c.id === id);
    if (found) {
      setCurrentCity(found);
      fetchLiveCityData(found);
    }
  };

  const toggleSaveCity = (cityId: string) => {
    if (user.role === 'guest') {
      setAlertNotification('ℹ️ Saved favorites is a personalized feature. Switch to "Registered User" in the top bar to save cities!');
      return;
    }
    setSavedCityIds((prev) => {
      const next = prev.includes(cityId) ? prev.filter((id) => id !== cityId) : [...prev, cityId];
      setUser((u) => ({ ...u, savedCityIds: next }));
      return next;
    });
  };

  const isCitySaved = (cityId: string) => savedCityIds.includes(cityId);

  const setUserRole = (role: UserRole) => {
    setUser((prev) => ({
      ...prev,
      role,
      name: role === 'guest' ? 'Guest Explorer' : role === 'admin' ? 'Sarah Jenkins (Admin)' : role === 'contributor' ? 'Dr. Priya Sharma' : 'Alex Mercer',
    }));
  };

  const updateHealthProfile = (profileUpdate: Partial<UserHealthProfile>) => {
    setUser((prev) => ({
      ...prev,
      healthProfile: {
        ...prev.healthProfile,
        ...profileUpdate,
      },
    }));
  };

  const updateAlertThreshold = (threshold: number, enabled: boolean) => {
    setUser((prev) => ({
      ...prev,
      alertThreshold: threshold,
      alertsEnabled: enabled,
    }));
  };

  // Compare Cities logic
  const addComparisonCity = (id: string) => {
    if (!comparisonCityIds.includes(id) && comparisonCityIds.length < 4) {
      setComparisonCityIds([...comparisonCityIds, id]);
    }
  };

  const removeComparisonCity = (id: string) => {
    if (comparisonCityIds.length > 1) {
      setComparisonCityIds(comparisonCityIds.filter((cityId) => cityId !== id));
    }
  };

  const addCommunityReport = (reportData: Omit<CommunityReport, 'id' | 'timestamp' | 'upvotes' | 'status'>) => {
    const newReport: CommunityReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      timestamp: 'Just now',
      upvotes: 1,
      hasUpvoted: true,
      status: user.role === 'admin' ? 'verified_by_moderator' : 'active',
    };
    setCommunityReports([newReport, ...communityReports]);
    setUser((prev) => ({ ...prev, reputationPoints: prev.reputationPoints + 15 }));
    setAlertNotification('✅ Ground-truth report submitted! Community reputation +15 points.');
    // Also send to backend
    apiService.submitReport(reportData);
  };

  const upvoteReport = (reportId: string) => {
    setCommunityReports((prev) =>
      prev.map((rep) => {
        if (rep.id === reportId) {
          const upvoted = !rep.hasUpvoted;
          return {
            ...rep,
            upvotes: upvoted ? rep.upvotes + 1 : rep.upvotes - 1,
            hasUpvoted: upvoted,
          };
        }
        return rep;
      })
    );
  };

  const moderateReport = (reportId: string, status: CommunityReport['status']) => {
    setCommunityReports((prev) =>
      prev.map((rep) => (rep.id === reportId ? { ...rep, status } : rep))
    );
  };

  const addCarbonEntry = (entry: Omit<CarbonFootprintEntry, 'id'>) => {
    const newEntry: CarbonFootprintEntry = {
      ...entry,
      id: `carb-${Date.now()}`,
    };
    setCarbonHistory([newEntry, ...carbonHistory]);
    setAlertNotification('🌱 Carbon footprint logged and progress timeline updated!');
  };

  const recordQuizSuccess = (points: number) => {
    setUser((prev) => ({
      ...prev,
      quizScore: prev.quizScore + points,
      quizStreak: prev.quizStreak + 1,
      unlockedBadges:
        prev.quizStreak >= 4 && !prev.unlockedBadges.includes('Atmospheric Grandmaster')
          ? [...prev.unlockedBadges, 'Atmospheric Grandmaster']
          : prev.unlockedBadges,
    }));
  };

  const refreshCityData = async () => {
    setCacheTimeRemaining(900);
    await fetchLiveCityData(currentCity);
    const stations = await apiService.getBangaloreStations();
    if (stations && stations.length > 0) {
      setBangaloreStations(stations);
    }
    setAlertNotification(`🔄 Station data for ${currentCity.name} freshly updated from real-time multi-sensor network.`);
  };

  const dismissNotification = () => {
    setAlertNotification(null);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        colorblindMode,
        toggleColorblindMode,
        activeTab,
        setActiveTab,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        currentCity,
        setCurrentCity,
        selectCityById,
        allCities,
        savedCityIds,
        toggleSaveCity,
        isCitySaved,
        user,
        setUserRole,
        updateHealthProfile,
        updateAlertThreshold,
        comparisonCityIds,
        setComparisonCityIds,
        addComparisonCity,
        removeComparisonCity,
        communityReports,
        addCommunityReport,
        upvoteReport,
        moderateReport,
        carbonHistory,
        addCarbonEntry,
        recordQuizSuccess,
        cacheTimeRemaining,
        refreshCityData,
        isLiveSyncing,
        lastSyncTime,
        bangaloreStations,
        alertNotification,
        dismissNotification,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
