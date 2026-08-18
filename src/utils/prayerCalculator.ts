import { PrayerTimes, PrayerKey } from '../types';

export interface CalculationParameters {
  fajrAngle: number;
  ishaAngle: number;
  ishaInterval?: number; // minutes after Maghrib (e.g. Umm al-Qura)
  maghribAngle?: number;
  imsakMinutesBeforeFajr: number; // 10 mins for Kemenag
  dhuhaMinutesAfterSunrise: number; // ~20-25 mins
  ihtiyatMinutes: number; // +2 mins for safety margin in Indonesia
}

export const CALCULATION_METHODS: Record<string, CalculationParameters & { name: string; description: string }> = {
  KEMENAG: {
    name: 'Kementerian Agama Republik Indonesia (Kemenag RI)',
    description: 'Standar resmi Indonesia: Subuh 20°, Isya 18°, Imsak -10 menit, Ihtiyat +2 menit',
    fajrAngle: 20.0,
    ishaAngle: 18.0,
    imsakMinutesBeforeFajr: 10,
    dhuhaMinutesAfterSunrise: 20,
    ihtiyatMinutes: 2,
  },
  UMM_AL_QURA: {
    name: 'Umm Al-Qura University, Makkah',
    description: 'Arab Saudi: Subuh 18.5°, Isya 90 menit setelah Maghrib',
    fajrAngle: 18.5,
    ishaAngle: 0,
    ishaInterval: 90,
    imsakMinutesBeforeFajr: 10,
    dhuhaMinutesAfterSunrise: 20,
    ihtiyatMinutes: 0,
  },
  MWL: {
    name: 'Muslim World League (MWL)',
    description: 'Eropa & Internasional: Subuh 18°, Isya 17°',
    fajrAngle: 18.0,
    ishaAngle: 17.0,
    imsakMinutesBeforeFajr: 10,
    dhuhaMinutesAfterSunrise: 20,
    ihtiyatMinutes: 0,
  },
  EGYPT: {
    name: 'Egyptian General Authority of Survey',
    description: 'Afrika & Timur Tengah: Subuh 19.5°, Isya 17.5°',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
    imsakMinutesBeforeFajr: 10,
    dhuhaMinutesAfterSunrise: 20,
    ihtiyatMinutes: 0,
  },
  ISNA: {
    name: 'Islamic Society of North America (ISNA)',
    description: 'Amerika Utara & Kanada: Subuh 15°, Isya 15°',
    fajrAngle: 15.0,
    ishaAngle: 15.0,
    imsakMinutesBeforeFajr: 10,
    dhuhaMinutesAfterSunrise: 20,
    ihtiyatMinutes: 0,
  },
  KARACHI: {
    name: 'University of Islamic Sciences, Karachi',
    description: 'Asia Selatan / Pakistan / India: Subuh 18°, Isya 18°',
    fajrAngle: 18.0,
    ishaAngle: 18.0,
    imsakMinutesBeforeFajr: 10,
    dhuhaMinutesAfterSunrise: 20,
    ihtiyatMinutes: 0,
  },
  DIYANET: {
    name: 'Diyanet İşleri Başkanlığı (Turki)',
    description: 'Turki & Kawasan Balkan: Subuh 18°, Isya 17°',
    fajrAngle: 18.0,
    ishaAngle: 17.0,
    imsakMinutesBeforeFajr: 10,
    dhuhaMinutesAfterSunrise: 20,
    ihtiyatMinutes: 0,
  },
  JAKIM: {
    name: 'Jabatan Kemajuan Islam Malaysia (JAKIM)',
    description: 'Malaysia: Subuh 20°, Isya 18°, Ihtiyat +2 menit',
    fajrAngle: 20.0,
    ishaAngle: 18.0,
    imsakMinutesBeforeFajr: 10,
    dhuhaMinutesAfterSunrise: 20,
    ihtiyatMinutes: 2,
  },
  MUIS: {
    name: 'Majlis Ugama Islam Singapura (MUIS)',
    description: 'Singapura: Subuh 20°, Isya 18°',
    fajrAngle: 20.0,
    ishaAngle: 18.0,
    imsakMinutesBeforeFajr: 10,
    dhuhaMinutesAfterSunrise: 20,
    ihtiyatMinutes: 2,
  }
};

// Degrees / Radians conversions
const d2r = (d: number) => (d * Math.PI) / 180.0;
const r2d = (r: number) => (r * 180.0) / Math.PI;

const sin = (d: number) => Math.sin(d2r(d));
const cos = (d: number) => Math.cos(d2r(d));
const tan = (d: number) => Math.tan(d2r(d));
const asin = (x: number) => r2d(Math.asin(x));
const acos = (x: number) => r2d(Math.acos(x));
const atan = (x: number) => r2d(Math.atan(x));

// Fix hour to 0-24
const fixHour = (h: number): number => {
  let res = h - 24.0 * Math.floor(h / 24.0);
  return res < 0 ? res + 24.0 : res;
};

// Convert Julian Day to Date
function getJulianDay(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

// Calculate Sun position (declination and equation of time)
function getSunPosition(jd: number): { declination: number; equationOfTime: number } {
  const D = jd - 2451545.0;
  const g = 357.529 + 0.98560028 * D;
  const q = 280.459 + 0.98564736 * D;
  const L = q + 1.915 * sin(g) + 0.020 * sin(2 * g);

  const e = 23.439 - 0.00000036 * D;
  const RA = atan(cos(e) * sin(L) / cos(L)) / 15.0;
  
  // Quadrant adjustment
  let raAdjusted = RA;
  const lQuadrant = Math.floor(L / 90) * 90;
  const raQuadrant = Math.floor(RA * 15 / 90) * 90;
  raAdjusted = raAdjusted + (lQuadrant - raQuadrant) / 15.0;

  const declination = asin(sin(e) * sin(L));
  const equationOfTime = q / 15.0 - raAdjusted;

  return { declination, equationOfTime };
}

// Calculate prayer times mathematically for any location on Earth
export function calculatePrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  timeZoneOffset?: number, // in hours from UTC, e.g. +7 for WIB
  methodKey: string = 'KEMENAG'
): PrayerTimes {
  const method = CALCULATION_METHODS[methodKey] || CALCULATION_METHODS.KEMENAG;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Automatic timezone offset fallback
  const tz = timeZoneOffset !== undefined ? timeZoneOffset : -date.getTimezoneOffset() / 60;

  const jd = getJulianDay(year, month, day);
  const { declination: dec, equationOfTime: eqt } = getSunPosition(jd);

  // Solar noon in local hours
  const noon = fixHour(12 + tz - lng / 15 - eqt);

  // Sun depression angle for sunrise/sunset (0.833° for refraction and sun diameter)
  const sunRadiusAngle = 0.833;

  // Hour angle helper for a given altitude angle
  const getHourAngle = (angle: number): number => {
    const cosHA = (sin(angle) - sin(lat) * sin(dec)) / (cos(lat) * cos(dec));
    if (cosHA > 1) return 0; // sun never rises to this angle
    if (cosHA < -1) return 12; // sun never sets below this angle
    return acos(cosHA) / 15.0;
  };

  // Sunrise & Sunset (Maghrib)
  const sunriseSunsetHA = getHourAngle(-sunRadiusAngle);
  const sunrise = noon - sunriseSunsetHA;
  const sunset = noon + sunriseSunsetHA;

  // Fajr (Subuh)
  const fajrHA = getHourAngle(-method.fajrAngle);
  const fajr = noon - fajrHA;

  // Asr (Shafi'i: shadow length factor = 1)
  const asrAltitude = -r2d(Math.atan(1 + Math.tan(d2r(Math.abs(lat - dec)))));
  const asrHA = getHourAngle(-asrAltitude);
  const asr = noon + asrHA;

  // Isha
  let isha: number;
  if (method.ishaInterval) {
    isha = sunset + method.ishaInterval / 60.0;
  } else {
    const ishaHA = getHourAngle(-method.ishaAngle);
    isha = noon + ishaHA;
  }

  // Dhuhr / Dzuhur (+1 minute for safety)
  const dhuhr = noon + (1 / 60);

  // Imsak & Dhuha
  const imsak = fajr - (method.imsakMinutesBeforeFajr / 60.0);
  const dhuha = sunrise + (method.dhuhaMinutesAfterSunrise / 60.0);

  // Apply Ihtiyat (safety margin)
  const ihtiyat = (method.ihtiyatMinutes || 0) / 60.0;

  const formatHours = (hours: number): string => {
    const h = fixHour(hours);
    const totalMinutes = Math.round(h * 60);
    const hh = Math.floor(totalMinutes / 60) % 24;
    const mm = totalMinutes % 60;
    return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
  };

  const isoDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  const hijri = getHijriDate(date);

  return {
    imsak: formatHours(imsak + ihtiyat),
    subuh: formatHours(fajr + ihtiyat),
    terbit: formatHours(sunrise),
    dhuha: formatHours(dhuha),
    dzuhur: formatHours(dhuhr + ihtiyat),
    ashar: formatHours(asr + ihtiyat),
    maghrib: formatHours(sunset + ihtiyat),
    isya: formatHours(isha + ihtiyat),
    date: isoDate,
    hijriDate: hijri,
  };
}

// Calculate Hijri Date accurately
export function getHijriDate(gregorianDate: Date): string {
  const gYear = gregorianDate.getFullYear();
  const gMonth = gregorianDate.getMonth();
  const gDay = gregorianDate.getDate();

  // Umm al-Qura approximation
  let jd = getJulianDay(gYear, gMonth + 1, gDay);
  let l = jd - 1948440 + 10632;
  let n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  let j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
  l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  let hMonth = Math.floor((24 * l) / 709);
  let hDay = l - Math.floor((709 * hMonth) / 24);
  let hYear = 30 * n + j - 30;

  const islamicMonths = [
    'Muharram', 'Safar', 'Rabi\'ul Awwal', 'Rabi\'ul Akhir',
    'Jumadil Awwal', 'Jumadil Akhir', 'Rajab', 'Sya\'ban',
    'Ramadhan', 'Syawwal', 'Dzulqa\'dah', 'Dzulhijjah'
  ];

  const monthName = islamicMonths[hMonth - 1] || 'Safar';
  return `${hDay} ${monthName} ${hYear} H`;
}

// Calculate Qibla Direction (Bearing from true North to Kaaba)
export function calculateQiblaDirection(lat: number, lng: number): {
  degree: number;
  distanceKm: number;
  compassBearing: string;
} {
  // Kaaba Coordinates in Makkah
  const kaabaLat = 21.422487;
  const kaabaLng = 39.826206;

  const φ1 = d2r(lat);
  const φ2 = d2r(kaabaLat);
  const Δλ = d2r(kaabaLng - lng);

  // Qibla Bearing formula
  const y = Math.sin(Δλ);
  const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
  let qibla = r2d(Math.atan2(y, x));
  qibla = (qibla + 360) % 360;

  // Great-circle distance
  const R = 6371; // Earth radius in km
  const dLat = φ2 - φ1;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  // Cardinal direction approximation
  const directions = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'];
  const index = Math.round(qibla / 45) % 8;
  const compassBearing = directions[index];

  return {
    degree: Math.round(qibla * 10) / 10,
    distanceKm,
    compassBearing,
  };
}

// Fetch Prayer Times from Online API with Offline Fallback
export async function fetchPrayerTimesOnline(
  date: Date,
  lat: number,
  lng: number,
  methodKey: string = 'KEMENAG'
): Promise<PrayerTimes> {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const formattedDate = `${day}-${month}-${year}`;

  const methodId = methodKey === 'KEMENAG' ? 11 : methodKey === 'MWL' ? 3 : methodKey === 'ISNA' ? 2 : methodKey === 'UMM_AL_QURA' ? 4 : 11;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const url = `https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${lat}&longitude=${lng}&method=${methodId}`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.data && data.data.timings) {
        const t = data.data.timings;
        const hijri = data.data.date?.hijri;
        const hijriStr = hijri ? `${hijri.day} ${hijri.month?.en || ''} ${hijri.year} H` : getHijriDate(date);

        // Sanitize string time format HH:mm
        const clean = (val: string) => (val ? val.substring(0, 5) : '00:00');

        return {
          imsak: clean(t.Imsak),
          subuh: clean(t.Fajr),
          terbit: clean(t.Sunrise),
          dhuha: clean(t.Firstthird || t.Sunrise), // fallback calculation
          dzuhur: clean(t.Dhuhr),
          ashar: clean(t.Asr),
          maghrib: clean(t.Maghrib),
          isya: clean(t.Isha),
          date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
          hijriDate: hijriStr,
        };
      }
    }
  } catch (err) {
    // Offline or network error -> use local mathematical calculation
  }

  // Fallback to high-precision local astronomical formula
  return calculatePrayerTimes(date, lat, lng, undefined, methodKey);
}

// Generate Monthly Prayer Times Table
export function generateMonthlyPrayerTimes(
  year: number,
  month: number, // 1-12
  lat: number,
  lng: number,
  methodKey: string = 'KEMENAG'
): PrayerTimes[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const list: PrayerTimes[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const targetDate = new Date(year, month - 1, d);
    const times = calculatePrayerTimes(targetDate, lat, lng, undefined, methodKey);
    list.push(times);
  }

  return list;
}

// Determine next prayer and time remaining
export function getNextPrayer(times: PrayerTimes): {
  nextKey: PrayerKey;
  nextName: string;
  nextTime: string;
  isToday: boolean;
  minutesRemaining: number;
  formattedRemaining: string;
} {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  const prayerSchedule: Array<{ key: PrayerKey; name: string; time: string; minutes: number }> = [
    { key: 'imsak', name: 'Imsak', time: times.imsak, minutes: timeStrToMinutes(times.imsak) },
    { key: 'subuh', name: 'Subuh', time: times.subuh, minutes: timeStrToMinutes(times.subuh) },
    { key: 'terbit', name: 'Terbit / Syuruq', time: times.terbit, minutes: timeStrToMinutes(times.terbit) },
    { key: 'dhuha', name: 'Dhuha', time: times.dhuha, minutes: timeStrToMinutes(times.dhuha) },
    { key: 'dzuhur', name: 'Dzuhur', time: times.dzuhur, minutes: timeStrToMinutes(times.dzuhur) },
    { key: 'ashar', name: 'Ashar', time: times.ashar, minutes: timeStrToMinutes(times.ashar) },
    { key: 'maghrib', name: 'Maghrib', time: times.maghrib, minutes: timeStrToMinutes(times.maghrib) },
    { key: 'isya', name: 'Isya', time: times.isya, minutes: timeStrToMinutes(times.isya) },
  ];

  // Find first prayer that is later than current time
  for (const prayer of prayerSchedule) {
    if (prayer.minutes > currentMinutes) {
      const diff = prayer.minutes - currentMinutes;
      return {
        nextKey: prayer.key,
        nextName: prayer.name,
        nextTime: prayer.time,
        isToday: true,
        minutesRemaining: Math.floor(diff),
        formattedRemaining: formatDiffTime(diff),
      };
    }
  }

  // If past Isya, next prayer is Imsak / Subuh tomorrow
  const diffTomorrow = (24 * 60 - currentMinutes) + prayerSchedule[0].minutes;
  return {
    nextKey: 'imsak',
    nextName: 'Imsak (Besok)',
    nextTime: times.imsak,
    isToday: false,
    minutesRemaining: Math.floor(diffTomorrow),
    formattedRemaining: formatDiffTime(diffTomorrow),
  };
}

function timeStrToMinutes(str: string): number {
  const [h, m] = str.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatDiffTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.floor(totalMinutes % 60);
  const secs = Math.floor((totalMinutes * 60) % 60);

  if (hours > 0) {
    return `${hours} jam ${mins} mnt ${secs} dtk`;
  }
  return `${mins} mnt ${secs} dtk`;
}
