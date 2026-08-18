import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Compass, 
  MapPin, 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Globe2, 
  Search, 
  Navigation, 
  Play, 
  Square, 
  Calendar, 
  Printer, 
  Share2, 
  Check, 
  Sparkles, 
  Sun, 
  Moon, 
  Sunrise, 
  Sunset, 
  HelpCircle,
  Radio,
  Sliders,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { 
  PrayerTimes, 
  PrayerKey, 
  LocationInfo, 
  AdzanSettings 
} from '../types';
import { 
  INDONESIA_PROVINCES, 
  WORLD_COUNTRIES, 
  searchIndonesianLocation,
  KEDUNGBANTENG_VILLAGES
} from '../data/indonesiaRegions';
import { 
  calculatePrayerTimes, 
  calculateQiblaDirection, 
  generateMonthlyPrayerTimes, 
  getNextPrayer, 
  getHijriDate, 
  CALCULATION_METHODS,
  fetchPrayerTimesOnline
} from '../utils/prayerCalculator';
import { 
  playAdzan, 
  stopAdzan, 
  isAdzanPlaying, 
  setAdzanStateChangeListener, 
  ADZAN_TRACKS, 
  AdzanVoiceType,
  requestNotificationPermission,
  showPrayerNotification
} from '../utils/adzanAudio';

const STORAGE_KEYS = {
  LOCATION: 'arisan_p3n_prayer_location_v1',
  ADZAN_SETTINGS: 'arisan_p3n_adzan_settings_v1',
};

// Default Paguyuban Location: KUA Kedungbanteng Banyumas
const DEFAULT_LOCATION: LocationInfo = {
  country: 'Indonesia',
  province: 'Jawa Tengah',
  city: 'Banyumas',
  district: 'Kedungbanteng',
  village: 'Keniten',
  latitude: -7.3686,
  longitude: 109.2135,
  timezone: 'Asia/Jakarta',
  calculationMethod: 'KEMENAG',
};

const DEFAULT_ADZAN_SETTINGS: AdzanSettings = {
  enabled: true,
  voiceType: 'makkah',
  volume: 0.85,
  reminders: {
    imsak: false,
    subuh: true,
    dhuha: false,
    dzuhur: true,
    ashar: true,
    maghrib: true,
    isya: true,
  },
  alarmBeforeMinutes: 0,
};

export const PrayerTimesView: React.FC = () => {
  // Live clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Location State
  const [location, setLocation] = useState<LocationInfo>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOCATION);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_LOCATION;
  });

  // Adzan & Reminder Settings
  const [adzanSettings, setAdzanSettings] = useState<AdzanSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADZAN_SETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_ADZAN_SETTINGS;
  });

  // UI States
  const [activeTab, setActiveTab] = useState<'indonesia' | 'world' | 'manual'>('indonesia');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchIndonesianLocation>>([]);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeAdzanModal, setActiveAdzanModal] = useState<{ prayerName: string; time: string } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(false);

  // Selected Date for prayer view
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthlyViewMonth, setMonthlyViewMonth] = useState<number>(new Date().getMonth() + 1);
  const [monthlyViewYear, setMonthlyViewYear] = useState<number>(new Date().getFullYear());
  const [showMonthlyTable, setShowMonthlyTable] = useState<boolean>(false);

  // Indonesia Cascading Dropdown States
  const [selectedProvId, setSelectedProvId] = useState<string>('JT');
  const [selectedRegId, setSelectedRegId] = useState<string>('BMS');
  const [selectedDistId, setSelectedDistId] = useState<string>('KDB');
  const [selectedVillageName, setSelectedVillageName] = useState<string>('Keniten');

  // World selector states
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('SA');
  const [selectedCityName, setSelectedCityName] = useState<string>('Makkah Al-Mukarramah (Masjidil Haram)');

  // Last triggered prayer time to prevent duplicate alarms within same minute
  const lastTriggeredPrayerRef = useRef<string>('');

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADZAN_SETTINGS, JSON.stringify(adzanSettings));
  }, [adzanSettings]);

  // Sync Audio Play state listener
  useEffect(() => {
    setAdzanStateChangeListener((playing) => {
      setIsPlayingAudio(playing);
    });
    return () => {
      stopAdzan();
    };
  }, []);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationPermissionGranted(true);
    }
  }, []);

  // Real-time Clock Ticker & Prayer Trigger Checker
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Compute prayer times for current day
      const todayTimes = calculatePrayerTimes(
        now,
        location.latitude,
        location.longitude,
        undefined,
        location.calculationMethod
      );

      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds();
      const currentMinuteStr = `${hours}:${minutes}`;

      // Check if alarm should trigger (at 0-5 seconds of the target minute)
      if (seconds <= 2 && adzanSettings.enabled) {
        const prayersToCheck: Array<{ key: keyof typeof adzanSettings.reminders; name: string; time: string }> = [
          { key: 'subuh', name: 'Subuh', time: todayTimes.subuh },
          { key: 'dzuhur', name: 'Dzuhur', time: todayTimes.dzuhur },
          { key: 'ashar', name: 'Ashar', time: todayTimes.ashar },
          { key: 'maghrib', name: 'Maghrib', time: todayTimes.maghrib },
          { key: 'isya', name: 'Isya', time: todayTimes.isya },
          { key: 'imsak', name: 'Imsak', time: todayTimes.imsak },
          { key: 'dhuha', name: 'Dhuha', time: todayTimes.dhuha },
        ];

        for (const prayer of prayersToCheck) {
          if (adzanSettings.reminders[prayer.key] && prayer.time === currentMinuteStr) {
            const triggerKey = `${String(prayer.key)}-${now.toDateString()}-${currentMinuteStr}`;
            if (lastTriggeredPrayerRef.current !== triggerKey) {
              lastTriggeredPrayerRef.current = triggerKey;
              
              // Trigger Adzan Audio
              const voice = prayer.key === 'subuh' ? 'subuh' : adzanSettings.voiceType;
              playAdzan(voice, adzanSettings.volume);

              // Show In-App Modal & System Notification
              setActiveAdzanModal({ prayerName: prayer.name, time: prayer.time });
              showPrayerNotification(
                prayer.name,
                `${location.district || location.city}, ${location.province || location.country}`
              );
              break;
            }
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [location, adzanSettings]);

  // Compute Current Day's Prayer Times
  const prayerTimes: PrayerTimes = calculatePrayerTimes(
    selectedDate,
    location.latitude,
    location.longitude,
    undefined,
    location.calculationMethod
  );

  // Compute Next Prayer and Remaining Time
  const nextPrayerInfo = getNextPrayer(prayerTimes);

  // Compute Qibla
  const qiblaInfo = calculateQiblaDirection(location.latitude, location.longitude);

  // Search handler for Indonesian locations
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.length >= 2) {
      const results = searchIndonesianLocation(val);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const selectSearchResult = (item: ReturnType<typeof searchIndonesianLocation>[0]) => {
    setLocation({
      country: 'Indonesia',
      province: item.province,
      city: item.regency,
      district: item.district,
      village: item.village || '',
      latitude: item.lat,
      longitude: item.lng,
      timezone: 'Asia/Jakarta',
      calculationMethod: 'KEMENAG',
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  // Automatic Geolocation Detection
  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Perangkat atau peramban tidak mendukung GPS/Geolokasi.');
      return;
    }

    setIsDetectingLocation(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let detectedCity = 'Lokasi Terdeteksi';
        let detectedDistrict = '';
        let detectedProvince = 'Indonesia';
        let detectedCountry = 'Indonesia';
        let detectedVillage = '';

        try {
          // Reverse geocoding via OpenStreetMap Nominatim with timeout
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=id`,
            { signal: AbortSignal.timeout(3500) }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            detectedVillage = addr.village || addr.suburb || addr.hamlet || '';
            detectedDistrict = addr.town || addr.city_district || addr.municipality || '';
            detectedCity = addr.city || addr.county || addr.regency || 'Kota';
            detectedProvince = addr.state || addr.province || '';
            detectedCountry = addr.country || 'Indonesia';
          }
        } catch (e) {
          // Fallback to coordinates
        }

        setLocation({
          country: detectedCountry,
          province: detectedProvince,
          city: detectedCity,
          district: detectedDistrict,
          village: detectedVillage,
          latitude,
          longitude,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta',
          calculationMethod: detectedCountry.toLowerCase().includes('indonesia') ? 'KEMENAG' : 'MWL',
        });

        setIsDetectingLocation(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGeoError('Gagal mendeteksi lokasi GPS. Menggunakan lokasi standar KUA Kedungbanteng.');
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  // Set Location to KUA Kedungbanteng Banyumas
  const setKedungbantengDefault = () => {
    setLocation(DEFAULT_LOCATION);
    setSelectedProvId('JT');
    setSelectedRegId('BMS');
    setSelectedDistId('KDB');
    setSelectedVillageName('Keniten');
  };

  // Cascading Selection Handlers
  const currentProv = INDONESIA_PROVINCES.find((p) => p.id === selectedProvId) || INDONESIA_PROVINCES[0];
  const currentReg = currentProv.regencies.find((r) => r.id === selectedRegId) || currentProv.regencies[0];
  const currentDist = currentReg?.districts.find((d) => d.id === selectedDistId) || currentReg?.districts[0];

  const handleApplyIndonesiaSelection = () => {
    if (!currentReg || !currentDist) return;

    setLocation({
      country: 'Indonesia',
      province: currentProv.name,
      city: `${currentReg.type} ${currentReg.name}`,
      district: currentDist.name,
      village: selectedVillageName,
      latitude: currentDist.lat || currentReg.lat,
      longitude: currentDist.lng || currentReg.lng,
      timezone: 'Asia/Jakarta',
      calculationMethod: 'KEMENAG',
    });
  };

  // World Country Handler
  const currentCountry = WORLD_COUNTRIES.find((c) => c.code === selectedCountryCode) || WORLD_COUNTRIES[0];
  const handleApplyWorldSelection = (cityObj?: { name: string; lat: number; lng: number }) => {
    const targetCity = cityObj || currentCountry.popularCities[0];
    setLocation({
      country: currentCountry.name,
      province: currentCountry.capital,
      city: targetCity.name,
      district: '',
      village: '',
      latitude: targetCity.lat,
      longitude: targetCity.lng,
      timezone: currentCountry.timezone,
      calculationMethod: currentCountry.method,
    });
  };

  // Sound Test Handler
  const handleTogglePlayAudio = () => {
    if (isPlayingAudio) {
      stopAdzan();
      setIsPlayingAudio(false);
    } else {
      playAdzan(adzanSettings.voiceType, adzanSettings.volume, () => {
        setIsPlayingAudio(false);
      });
      setIsPlayingAudio(true);
    }
  };

  // Notification Enable
  const handleRequestNotification = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermissionGranted(granted);
  };

  // Copy Prayer Schedule for WhatsApp / Share
  const handleCopySchedule = () => {
    const text = `🕌 *JADWAL WAKTU SHOLAT HARI INI*
📍 *Wilayah:* ${location.district ? `Kec. ${location.district}, ` : ''}${location.city}, ${location.province || location.country}
📅 *Tanggal:* ${selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
🌙 *Hijriyah:* ${prayerTimes.hijriDate || getHijriDate(selectedDate)}
🧭 *Arah Kiblat:* ${qiblaInfo.degree}° (${qiblaInfo.compassBearing})

• *Imsak:* ${prayerTimes.imsak} WIB
• *Subuh:* ${prayerTimes.subuh} WIB
• *Terbit:* ${prayerTimes.terbit} WIB
• *Dhuha:* ${prayerTimes.dhuha} WIB
• *Dzuhur:* ${prayerTimes.dzuhur} WIB
• *Ashar:* ${prayerTimes.ashar} WIB
• *Maghrib:* ${prayerTimes.maghrib} WIB
• *Isya:* ${prayerTimes.isya} WIB

_Sumber Perhitungan: ${CALCULATION_METHODS[location.calculationMethod]?.name || 'Kemenag RI'}_
_Paguyuban Bani P3N - KUA Kec. Kedungbanteng_`;

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  // Monthly Table Data
  const monthlyData = generateMonthlyPrayerTimes(
    monthlyViewYear,
    monthlyViewMonth,
    location.latitude,
    location.longitude,
    location.calculationMethod
  );

  // Prayer Cards Definitions
  const PRAYER_CARDS: Array<{
    key: PrayerKey;
    label: string;
    arabic: string;
    time: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
    accentBg: string;
    hasAlarm: boolean;
    alarmKey?: keyof typeof adzanSettings.reminders;
  }> = [
    {
      key: 'imsak',
      label: 'Imsak',
      arabic: 'الإمساك',
      time: prayerTimes.imsak,
      icon: Moon,
      colorClass: 'text-indigo-600 dark:text-indigo-400',
      accentBg: 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200/80 dark:border-indigo-800/50',
      hasAlarm: true,
      alarmKey: 'imsak',
    },
    {
      key: 'subuh',
      label: 'Subuh',
      arabic: 'الفجر',
      time: prayerTimes.subuh,
      icon: Sunrise,
      colorClass: 'text-blue-600 dark:text-blue-400',
      accentBg: 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-800/50',
      hasAlarm: true,
      alarmKey: 'subuh',
    },
    {
      key: 'terbit',
      label: 'Terbit / Syuruq',
      arabic: 'الشروق',
      time: prayerTimes.terbit,
      icon: Sun,
      colorClass: 'text-amber-600 dark:text-amber-400',
      accentBg: 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/50',
      hasAlarm: false,
    },
    {
      key: 'dhuha',
      label: 'Dhuha',
      arabic: 'الضحى',
      time: prayerTimes.dhuha,
      icon: Sparkles,
      colorClass: 'text-yellow-600 dark:text-yellow-400',
      accentBg: 'bg-yellow-50/70 dark:bg-yellow-950/30 border-yellow-200/80 dark:border-yellow-800/50',
      hasAlarm: true,
      alarmKey: 'dhuha',
    },
    {
      key: 'dzuhur',
      label: 'Dzuhur',
      arabic: 'الظهر',
      time: prayerTimes.dzuhur,
      icon: Sun,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      accentBg: 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/50',
      hasAlarm: true,
      alarmKey: 'dzuhur',
    },
    {
      key: 'ashar',
      label: 'Ashar',
      arabic: 'العصر',
      time: prayerTimes.ashar,
      icon: Sun,
      colorClass: 'text-teal-600 dark:text-teal-400',
      accentBg: 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-200/80 dark:border-teal-800/50',
      hasAlarm: true,
      alarmKey: 'ashar',
    },
    {
      key: 'maghrib',
      label: 'Maghrib',
      arabic: 'المغرب',
      time: prayerTimes.maghrib,
      icon: Sunset,
      colorClass: 'text-orange-600 dark:text-orange-400',
      accentBg: 'bg-orange-50/70 dark:bg-orange-950/30 border-orange-200/80 dark:border-orange-800/50',
      hasAlarm: true,
      alarmKey: 'maghrib',
    },
    {
      key: 'isya',
      label: 'Isya',
      arabic: 'العشاء',
      time: prayerTimes.isya,
      icon: Moon,
      colorClass: 'text-purple-600 dark:text-purple-400',
      accentBg: 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-200/80 dark:border-purple-800/50',
      hasAlarm: true,
      alarmKey: 'isya',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-emerald-950/10">
        {/* Background Islamic Geometric pattern subtle overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.4)_1px,_transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Jadwal Waktu Sholat & Kumandang Adzan Seluruh Dunia</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Waktu Sholat Akurat & Pengingat Adzan
            </h1>
            
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              Cakupan lengkap penelusuran Desa, Kecamatan, Kabupaten/Kota, Provinsi di Indonesia serta Seluruh Negara di Dunia dengan deteksi wilayah otomatis dan lantunan kumandang suara adzan merdu.
            </p>

            {/* Current Active Location Badge */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {location.village ? `Desa ${location.village}, ` : ''}
                  {location.district ? `Kec. ${location.district}, ` : ''}
                  {location.city}, {location.province || location.country}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-700/50 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-200">
                <Compass className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Kiblat: {qiblaInfo.degree}° ({qiblaInfo.compassBearing}) • {qiblaInfo.distanceKm.toLocaleString('id-ID')} km</span>
              </div>
            </div>
          </div>

          {/* Right Live Clock & Next Prayer Highlight Card */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[280px]">
            {/* Live Clock Card */}
            <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center">
              <div className="text-xs uppercase font-bold tracking-wider text-emerald-300">
                Waktu Saat Ini
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-white font-mono my-0.5">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-xs text-emerald-100 font-medium">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div className="mt-1 text-[11px] text-amber-300 font-semibold">
                🌙 {prayerTimes.hijriDate || getHijriDate(currentTime)}
              </div>
            </div>

            {/* Next Prayer Countdown Card */}
            <div className="rounded-xl bg-emerald-500/25 backdrop-blur-md border border-emerald-400/40 p-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
                  Menuju Sholat
                </div>
                <div className="text-lg font-bold text-white">
                  {nextPrayerInfo.nextName}
                </div>
                <div className="text-xs text-emerald-200">
                  Pukul <span className="font-bold text-white">{nextPrayerInfo.nextTime}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-emerald-300 font-medium">
                  Sisa Waktu:
                </div>
                <div className="text-sm font-bold text-amber-300 font-mono bg-black/40 px-2.5 py-1 rounded-lg border border-amber-300/30">
                  {nextPrayerInfo.formattedRemaining}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Bar: Auto GPS, KUA Default, Share, Print */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Auto GPS Detect */}
          <button
            id="btn-detect-gps"
            type="button"
            onClick={handleAutoDetectLocation}
            disabled={isDetectingLocation}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            <span>{isDetectingLocation ? 'Mendeteksi Koordinat...' : 'Deteksi Wilayah Otomatis (GPS)'}</span>
          </button>

          {/* Quick Default: KUA Kedungbanteng */}
          <button
            id="btn-default-kua"
            type="button"
            onClick={setKedungbantengDefault}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>KUA Kedungbanteng (Default)</span>
          </button>

          {/* Monthly Schedule Toggle */}
          <button
            id="btn-toggle-monthly"
            type="button"
            onClick={() => setShowMonthlyTable(!showMonthlyTable)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              showMonthlyTable
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{showMonthlyTable ? 'Tutup Jadwal Bulanan' : 'Jadwal 1 Bulan Penuh'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Schedule */}
          <button
            id="btn-copy-schedule"
            type="button"
            onClick={handleCopySchedule}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
            title="Salin Jadwal Sholat Format WhatsApp"
          >
            {copySuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Salin WA</span>
              </>
            )}
          </button>

          {/* Notification Permission Button */}
          {!notificationPermissionGranted && (
            <button
              id="btn-enable-push"
              type="button"
              onClick={handleRequestNotification}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 text-xs font-medium hover:bg-amber-100"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Aktifkan Notifikasi Pop-up</span>
            </button>
          )}
        </div>
      </div>

      {geoError && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex items-center justify-between">
          <span>⚠️ {geoError}</span>
          <button type="button" onClick={() => setGeoError(null)} className="font-bold underline ml-2">Tutup</button>
        </div>
      )}

      {/* Location Search & Selection Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Pencarian & Penelusuran Wilayah Sholat
            </h2>
          </div>

          {/* Segmented Tab Controls */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('indonesia')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'indonesia'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🇮🇩 Seluruh Wilayah Indonesia (Hirarki)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('world')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'world'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🌍 Internasional / Dunia
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'manual'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ⚙️ Parameter & Koordinat
            </button>
          </div>
        </div>

        {/* Universal Search Autocomplete Box */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="input-prayer-search"
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Ketik nama Desa, Kecamatan, Kabupaten/Kota, atau Provinsi (misal: Keniten, Kedungbanteng, Banyumas, Solo, Makkah)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute z-30 top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectSearchResult(item)}
                  className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-slate-700/60 flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">{item.label}</span>
                      {item.village && (
                        <span className="ml-1.5 text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded-sm font-medium">
                          Desa
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab 1: Indonesia Cascading Hierarchical Selector */}
        {activeTab === 'indonesia' && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Pilih Provinsi */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  1. Pilih Provinsi
                </label>
                <select
                  id="select-province"
                  value={selectedProvId}
                  onChange={(e) => {
                    const newProvId = e.target.value;
                    setSelectedProvId(newProvId);
                    const prov = INDONESIA_PROVINCES.find((p) => p.id === newProvId);
                    if (prov && prov.regencies.length > 0) {
                      const firstReg = prov.regencies[0];
                      setSelectedRegId(firstReg.id);
                      if (firstReg.districts.length > 0) {
                        const firstDist = firstReg.districts[0];
                        setSelectedDistId(firstDist.id);
                        setSelectedVillageName(firstDist.villages[0] || '');
                      }
                    }
                  }}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {INDONESIA_PROVINCES.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Pilih Kabupaten / Kota */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  2. Pilih Kabupaten / Kota
                </label>
                <select
                  id="select-regency"
                  value={selectedRegId}
                  onChange={(e) => {
                    const newRegId = e.target.value;
                    setSelectedRegId(newRegId);
                    const reg = currentProv.regencies.find((r) => r.id === newRegId);
                    if (reg && reg.districts.length > 0) {
                      const firstDist = reg.districts[0];
                      setSelectedDistId(firstDist.id);
                      setSelectedVillageName(firstDist.villages[0] || '');
                    }
                  }}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {currentProv.regencies.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      {reg.type} {reg.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Pilih Kecamatan */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  3. Pilih Kecamatan
                </label>
                <select
                  id="select-district"
                  value={selectedDistId}
                  onChange={(e) => {
                    const newDistId = e.target.value;
                    setSelectedDistId(newDistId);
                    const dist = currentReg?.districts.find((d) => d.id === newDistId);
                    if (dist) {
                      setSelectedVillageName(dist.villages[0] || '');
                    }
                  }}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {currentReg?.districts.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      Kec. {dist.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Pilih Desa / Kelurahan */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  4. Pilih Desa / Kelurahan
                </label>
                <select
                  id="select-village"
                  value={selectedVillageName}
                  onChange={(e) => setSelectedVillageName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {currentDist?.villages.map((vil) => (
                    <option key={vil} value={vil}>
                      Desa/Kel. {vil}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                id="btn-apply-indonesia"
                type="button"
                onClick={handleApplyIndonesiaSelection}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Terapkan Wilayah Terpilih</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: World Country Selector */}
        {activeTab === 'world' && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Country Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Pilih Negara di Dunia
                </label>
                <select
                  id="select-world-country"
                  value={selectedCountryCode}
                  onChange={(e) => {
                    const newCode = e.target.value;
                    setSelectedCountryCode(newCode);
                    const c = WORLD_COUNTRIES.find((x) => x.code === newCode);
                    if (c && c.popularCities.length > 0) {
                      setSelectedCityName(c.popularCities[0].name);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {WORLD_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.capital})
                    </option>
                  ))}
                </select>
              </div>

              {/* City Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Pilih Kota Populer / Masjid Utama
                </label>
                <select
                  id="select-world-city"
                  value={selectedCityName}
                  onChange={(e) => {
                    setSelectedCityName(e.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {currentCountry.popularCities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Calculation Method Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Metode Standar Hisab
                </label>
                <select
                  id="select-calculation-method"
                  value={location.calculationMethod}
                  onChange={(e) => {
                    setLocation((prev) => ({
                      ...prev,
                      calculationMethod: e.target.value,
                    }));
                  }}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {Object.entries(CALCULATION_METHODS).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                id="btn-apply-world"
                type="button"
                onClick={() => {
                  const cityObj = currentCountry.popularCities.find((c) => c.name === selectedCityName);
                  handleApplyWorldSelection(cityObj);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Terapkan Kota & Negara Terpilih</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Custom Coordinates Manual Input */}
        {activeTab === 'manual' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Garis Lintang (Latitude)
              </label>
              <input
                type="number"
                step="0.0001"
                value={location.latitude}
                onChange={(e) => setLocation({ ...location, latitude: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Garis Bujur (Longitude)
              </label>
              <input
                type="number"
                step="0.0001"
                value={location.longitude}
                onChange={(e) => setLocation({ ...location, longitude: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Metode Hisab
              </label>
              <select
                value={location.calculationMethod}
                onChange={(e) => setLocation({ ...location, calculationMethod: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
              >
                {Object.entries(CALCULATION_METHODS).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 8 Prayer Time Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Waktu Sholat Hari Ini</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                ({selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })})
              </span>
            </h3>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Ihtiyat: <span className="font-semibold text-emerald-600 dark:text-emerald-400">+2 menit</span> (Standar Kemenag)
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {PRAYER_CARDS.map((item) => {
            const Icon = item.icon;
            const isNext = nextPrayerInfo.nextKey === item.key;
            const isAlarmOn = item.alarmKey ? adzanSettings.reminders[item.alarmKey] : false;

            return (
              <div
                key={item.key}
                id={`prayer-card-${item.key}`}
                className={`relative flex flex-col justify-between rounded-2xl p-4 transition-all duration-200 border ${
                  isNext
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900 scale-102 z-10'
                    : `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-700 shadow-xs`
                }`}
              >
                {/* Next Badge */}
                {isNext && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-slate-900 uppercase shadow-xs">
                    Berikutnya
                  </span>
                )}

                {/* Top header */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold ${isNext ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {item.label}
                    </span>
                    <span className={`text-[11px] font-medium font-serif ${isNext ? 'text-emerald-200' : 'text-slate-400 dark:text-slate-500'}`}>
                      {item.arabic}
                    </span>
                  </div>

                  <div className={`p-1.5 rounded-xl ${isNext ? 'bg-white/20 text-white' : item.accentBg}`}>
                    <Icon className={`w-4 h-4 ${isNext ? 'text-white' : item.colorClass}`} />
                  </div>
                </div>

                {/* Main Time */}
                <div className="my-3 text-center">
                  <div className={`text-2xl font-extrabold tracking-tight font-mono ${isNext ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {item.time}
                  </div>
                  <span className={`text-[10px] font-semibold ${isNext ? 'text-emerald-200' : 'text-slate-400'}`}>
                    WIB / Lokal
                  </span>
                </div>

                {/* Alarm Toggle Button */}
                {item.hasAlarm && item.alarmKey && (
                  <button
                    type="button"
                    title={isAlarmOn ? 'Pengingat Adzan Aktif' : 'Pengingat Adzan Nonaktif'}
                    onClick={() => {
                      if (!item.alarmKey) return;
                      const key = item.alarmKey;
                      setAdzanSettings((prev) => ({
                        ...prev,
                        reminders: {
                          ...prev.reminders,
                          [key]: !prev.reminders[key],
                        },
                      }));
                    }}
                    className={`mt-1 flex items-center justify-center gap-1 w-full py-1 rounded-lg text-[10px] font-bold transition-colors ${
                      isNext
                        ? isAlarmOn
                          ? 'bg-white/25 text-white hover:bg-white/35'
                          : 'bg-black/20 text-white/60 hover:text-white'
                        : isAlarmOn
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {isAlarmOn ? (
                      <>
                        <Bell className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>Adzan On</span>
                      </>
                    ) : (
                      <>
                        <BellOff className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>Mute</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sound & Adzan Controller Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl text-white p-5 shadow-lg border border-slate-700/60">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Left info & switch */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setAdzanSettings({ ...adzanSettings, enabled: !adzanSettings.enabled })}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                adzanSettings.enabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  adzanSettings.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Pengingat Kumandang Adzan Otomatis:
                </span>
                <span
                  className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                    adzanSettings.enabled
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {adzanSettings.enabled ? 'AKTIF' : 'NONAKTIF'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Memutar kumandang adzan bersuara merdu saat waktu sholat tiba secara otomatis.
              </p>
            </div>
          </div>

          {/* Controls: Voice Choice, Volume Slider, Test Audio Button */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Voice Choice */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-medium whitespace-nowrap">Muadzin:</span>
              <select
                id="select-adzan-voice"
                value={adzanSettings.voiceType}
                onChange={(e) => setAdzanSettings({ ...adzanSettings, voiceType: e.target.value as AdzanVoiceType })}
                className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {Object.values(ADZAN_TRACKS).map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              {adzanSettings.volume === 0 ? (
                <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <input
                id="range-adzan-volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={adzanSettings.volume}
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  setAdzanSettings({ ...adzanSettings, volume: vol });
                }}
                className="w-20 accent-emerald-500 h-1.5 bg-slate-600 rounded-lg cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-300 w-7 text-right">
                {Math.round(adzanSettings.volume * 100)}%
              </span>
            </div>

            {/* Test Play Audio Button with Live Visualizer */}
            <button
              id="btn-test-adzan-sound"
              type="button"
              onClick={handleTogglePlayAudio}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
                isPlayingAudio
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Hentikan Adzan</span>
                  {/* Equalizer animation */}
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-full bg-white animate-bounce" style={{ animationDuration: '400ms' }} />
                    <span className="w-0.5 h-3/4 bg-white animate-bounce" style={{ animationDuration: '600ms' }} />
                    <span className="w-0.5 h-full bg-white animate-bounce" style={{ animationDuration: '300ms' }} />
                  </div>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Uji Kumandang Adzan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Prayer Times Table View (Collapsible) */}
      {showMonthlyTable && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Jadwal Waktu Sholat Bulanan (1 Bulan Penuh)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {location.district ? `Kec. ${location.district}, ` : ''}{location.city}, {location.province || location.country}
              </p>
            </div>

            {/* Month & Year Selector */}
            <div className="flex items-center gap-2">
              <select
                value={monthlyViewMonth}
                onChange={(e) => setMonthlyViewMonth(parseInt(e.target.value))}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {[
                  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                ].map((mName, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {mName}
                  </option>
                ))}
              </select>

              <select
                value={monthlyViewYear}
                onChange={(e) => setMonthlyViewYear(parseInt(e.target.value))}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {[2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-3">Tgl</th>
                  <th className="py-2.5 px-3">Hijriyah</th>
                  <th className="py-2.5 px-3 text-center">Imsak</th>
                  <th className="py-2.5 px-3 text-center text-blue-700 dark:text-blue-400">Subuh</th>
                  <th className="py-2.5 px-3 text-center">Terbit</th>
                  <th className="py-2.5 px-3 text-center">Dhuha</th>
                  <th className="py-2.5 px-3 text-center text-emerald-700 dark:text-emerald-400">Dzuhur</th>
                  <th className="py-2.5 px-3 text-center text-teal-700 dark:text-teal-400">Ashar</th>
                  <th className="py-2.5 px-3 text-center text-orange-700 dark:text-orange-400">Maghrib</th>
                  <th className="py-2.5 px-3 text-center text-purple-700 dark:text-purple-400">Isya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {monthlyData.map((row, idx) => {
                  const dayNum = idx + 1;
                  const rowDate = new Date(monthlyViewYear, monthlyViewMonth - 1, dayNum);
                  const isTodayRow =
                    rowDate.getDate() === currentTime.getDate() &&
                    rowDate.getMonth() === currentTime.getMonth() &&
                    rowDate.getFullYear() === currentTime.getFullYear();

                  return (
                    <tr
                      key={dayNum}
                      className={`font-mono transition-colors ${
                        isTodayRow
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 font-bold text-emerald-900 dark:text-emerald-200'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <td className="py-2 px-3 font-sans font-medium whitespace-nowrap">
                        {dayNum} {rowDate.toLocaleDateString('id-ID', { weekday: 'short' })}
                        {isTodayRow && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded-sm bg-emerald-600 text-white text-[9px] font-sans">
                            Hari ini
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-sans text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {row.hijriDate}
                      </td>
                      <td className="py-2 px-3 text-center">{row.imsak}</td>
                      <td className="py-2 px-3 text-center font-semibold text-blue-600 dark:text-blue-400">{row.subuh}</td>
                      <td className="py-2 px-3 text-center text-slate-500 dark:text-slate-400">{row.terbit}</td>
                      <td className="py-2 px-3 text-center text-slate-500 dark:text-slate-400">{row.dhuha}</td>
                      <td className="py-2 px-3 text-center font-semibold text-emerald-600 dark:text-emerald-400">{row.dzuhur}</td>
                      <td className="py-2 px-3 text-center font-semibold text-teal-600 dark:text-teal-400">{row.ashar}</td>
                      <td className="py-2 px-3 text-center font-semibold text-orange-600 dark:text-orange-400">{row.maghrib}</td>
                      <td className="py-2 px-3 text-center font-semibold text-purple-600 dark:text-purple-400">{row.isya}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Doa Setelah Adzan & Panduan Khusyuk Card */}
      <div className="bg-emerald-50/70 dark:bg-slate-800/80 rounded-2xl border border-emerald-200 dark:border-slate-700 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
            Doa Setelah Mendengar Kumandang Adzan
          </h4>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-100 dark:border-slate-700/80 space-y-3">
          <p className="text-right text-base sm:text-lg font-serif leading-loose text-slate-900 dark:text-white" dir="rtl">
            اللّٰهُمَّ رَبَّ هٰذِهِ الدَّعْوَةِ التَّآمَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ سَيِّدَنَا مُحَمَّدًا الْوَسِيْلَةَ وَالْفَضِيْلَةَ، وَالدَّرَجَةَ الرَّافِعَةَ، وَابْعَثْهُ مَقَامًا مَحْمُوْدًا الَّذِيْ وَعَدْتَهُ، إِنَّكَ لَا تُخْلِفُ الْمِيْعَادَ
          </p>

          <p className="text-xs italic text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
            "Allâhumma rabba hâdzihid da'watit tâmmah, wash-shalâtil qâ'imah, âti sayyidanâ Muhammadanil washîlata wal fadhîlah, wad-darajatar râfi'ah, wab'atshu maqâmam mahmûdanil ladzî wa'adtah, innaka lâ tukhliful mî'âd."
          </p>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800">
            <strong>Artinya:</strong> "Ya Allah, Tuhan Pemilik panggilan yang sempurna ini dan sholat yang senantiasa didirikan. Berilah junjungan kami Nabi Muhammad wasilah (derajat tinggi di surga) dan keutamaan, serta tempatkanlah beliau pada kedudukan terpuji yang telah Engkau janjikan. Sesungguhnya Engkau tidak pernah mengingkari janji." (HR. Bukhari)
          </p>
        </div>
      </div>

      {/* Active Adzan Alert Modal when Prayer Time Matches Current Time */}
      {activeAdzanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-500/30 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 animate-pulse">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Waktu Sholat Telah Tiba
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Adzan Sholat {activeAdzanModal.prayerName}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Pukul <strong className="text-emerald-600 dark:text-emerald-400">{activeAdzanModal.time}</strong> WIB untuk wilayah{' '}
                <strong>{location.district ? `Kec. ${location.district}, ` : ''}{location.city}</strong>
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 italic">
              "Mari bersiap mengambil air wudhu dan melaksanakan ibadah sholat tepat pada waktunya."
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  stopAdzan();
                  setActiveAdzanModal(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
              >
                Hentikan Suara Adzan
              </button>
              <button
                type="button"
                onClick={() => setActiveAdzanModal(null)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
              >
                Tutup Pengingat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
