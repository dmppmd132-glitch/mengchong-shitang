/**
 * Vercel Serverless / Edge Weather Function powered by Open-Meteo
 *
 * - Uses Open-Meteo (https://api.open-meteo.com/v1/forecast) — zero API keys or registration needed.
 * - Resolves city coordinates first (via curated Taiwan/East Asia city registry + Open-Meteo Geocoding),
 *   then fetches current weather and 7-day daily forecast.
 * - Manual city selection only (defaults to Quebec, Canada / 魁北克省); strictly NO GPS geolocation.
 * - Caches responses at Vercel Edge / browser for 30 minutes (s-maxage=1800, max-age=1800).
 */

export const config = {
  runtime: 'edge',
};

interface CityLookup {
  id: string;
  name: string;
  geocodingQuery: string;
  lat: number;
  lon: number;
}

const CITY_LOOKUP: Record<string, CityLookup> = {
  quebec: {
    id: 'quebec',
    name: '魁北克省',
    geocodingQuery: 'Quebec',
    lat: 46.8139,
    lon: -71.208,
  },
  kaohsiung: {
    id: 'kaohsiung',
    name: '高雄',
    geocodingQuery: 'Kaohsiung',
    lat: 22.6273,
    lon: 120.3014,
  },
  taipei: {
    id: 'taipei',
    name: '台北',
    geocodingQuery: 'Taipei',
    lat: 25.033,
    lon: 121.5654,
  },
  taichung: {
    id: 'taichung',
    name: '台中',
    geocodingQuery: 'Taichung',
    lat: 24.1477,
    lon: 120.6736,
  },
  tainan: {
    id: 'tainan',
    name: '台南',
    geocodingQuery: 'Tainan',
    lat: 22.9997,
    lon: 120.227,
  },
  hualien: {
    id: 'hualien',
    name: '花蓮',
    geocodingQuery: 'Hualien',
    lat: 23.9872,
    lon: 121.6016,
  },
  tokyo: {
    id: 'tokyo',
    name: '東京',
    geocodingQuery: 'Tokyo',
    lat: 35.6762,
    lon: 139.6503,
  },
  seoul: {
    id: 'seoul',
    name: '首爾',
    geocodingQuery: 'Seoul',
    lat: 37.5665,
    lon: 126.978,
  },
  sapporo: {
    id: 'sapporo',
    name: '札幌',
    geocodingQuery: 'Sapporo',
    lat: 43.0618,
    lon: 141.3545,
  },
};

type GameWeatherCondition = 'clear' | 'cloudy' | 'rain' | 'snow' | 'hot' | 'windy' | 'storm';

const CONDITION_META: Record<GameWeatherCondition, { label: string; emoji: string }> = {
  clear: { label: '晴天', emoji: '☀️' },
  cloudy: { label: '多雲', emoji: '⛅' },
  rain: { label: '下雨', emoji: '🌧️' },
  snow: { label: '下雪', emoji: '❄️' },
  hot: { label: '炎熱', emoji: '🌡️' },
  windy: { label: '大風', emoji: '🍃' },
  storm: { label: '雷雨', emoji: '⛈️' },
};

interface ResolvedCoordinates {
  cityId: string;
  locationName: string;
  lat: number;
  lon: number;
}

interface DailyForecastItem {
  date: string;
  condition: GameWeatherCondition;
  label: string;
  emoji: string;
  tempMaxC: number;
  tempMinC: number;
  weatherCode: number;
}

function mapOpenMeteoWeatherCode(
  weatherCode: number,
  tempC: number,
  windSpeedMs: number
): GameWeatherCondition {
  // Thunderstorm (95, 96, 99)
  if (weatherCode >= 95) return 'storm';

  // Snow fall / snow grains / snow showers (71-77, 85-86) or freezing drizzle below 0C
  if (
    (weatherCode >= 71 && weatherCode <= 77) ||
    weatherCode === 85 ||
    weatherCode === 86 ||
    ((weatherCode === 56 || weatherCode === 57) && tempC <= 0)
  ) {
    return 'snow';
  }

  // Drizzle / Rain / Freezing Rain / Rain Showers (51-67, 80-82)
  if (
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82)
  ) {
    return 'rain';
  }

  // Strong wind (Beaufort 5+ / >= 8.5 m/s)
  if (windSpeedMs >= 8.5) return 'windy';

  // High heat (>= 31°C)
  if (tempC >= 31) return 'hot';

  // Clear / Mainly clear (0, 1)
  if (weatherCode === 0 || weatherCode === 1) return 'clear';

  // Partly cloudy / Overcast / Fog (2, 3, 45, 48)
  return 'cloudy';
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function resolveCityCoordinates(rawCityParam: string): Promise<ResolvedCoordinates> {
  const cleaned = rawCityParam.trim().slice(0, 40);
  const lowerKey = cleaned.toLowerCase();
  const knownCity = CITY_LOOKUP[lowerKey] ?? (!cleaned ? CITY_LOOKUP.quebec : null);
  const queryName = knownCity ? knownCity.geocodingQuery : cleaned;

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      queryName
    )}&count=1&language=zh&format=json`;
    const geoRes = await fetchWithTimeout(geoUrl, 2500);
    if (geoRes.ok) {
      const geoData = (await geoRes.json()) as {
        results?: Array<{
          name?: unknown;
          latitude?: unknown;
          longitude?: unknown;
        }>;
      };
      const first = geoData.results?.[0];
      const lat = typeof first?.latitude === 'number' ? first.latitude : NaN;
      const lon = typeof first?.longitude === 'number' ? first.longitude : NaN;
      if (
        Number.isFinite(lat) &&
        Number.isFinite(lon) &&
        lat >= -90 &&
        lat <= 90 &&
        lon >= -180 &&
        lon <= 180
      ) {
        return {
          cityId: knownCity ? knownCity.id : lowerKey || 'quebec',
          locationName: knownCity
            ? knownCity.name
            : typeof first?.name === 'string' && first.name.trim()
            ? first.name.trim()
            : cleaned,
          lat,
          lon,
        };
      }
    }
  } catch {
    // Fall back to curated city coordinates when geocoding times out
  }

  const fallbackCity = knownCity ?? CITY_LOOKUP.quebec;
  return {
    cityId: fallbackCity.id,
    locationName: fallbackCity.name,
    lat: fallbackCity.lat,
    lon: fallbackCity.lon,
  };
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const rawCity = url.searchParams.get('city') ?? 'quebec';

  try {
    const coords = await resolveCityCoordinates(rawCity);

    const forecastUrl =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${encodeURIComponent(String(coords.lat))}` +
      `&longitude=${encodeURIComponent(String(coords.lon))}` +
      `&current=temperature_2m,weather_code,wind_speed_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max` +
      `&wind_speed_unit=ms` +
      `&timezone=auto` +
      `&forecast_days=7`;

    const upstream = await fetchWithTimeout(forecastUrl, 4500);
    if (!upstream.ok) {
      throw new Error(`Open-Meteo status ${upstream.status}`);
    }

    const payload = (await upstream.json()) as {
      current?: {
        temperature_2m?: unknown;
        weather_code?: unknown;
        wind_speed_10m?: unknown;
      };
      daily?: {
        time?: unknown[];
        weather_code?: unknown[];
        temperature_2m_max?: unknown[];
        temperature_2m_min?: unknown[];
        wind_speed_10m_max?: unknown[];
      };
    };

    const currentTempRaw = Number(payload.current?.temperature_2m);
    const currentCodeRaw = Number(payload.current?.weather_code);
    const currentWindRaw = Number(payload.current?.wind_speed_10m);

    if (!Number.isFinite(currentTempRaw) || !Number.isFinite(currentCodeRaw)) {
      throw new Error('Invalid Open-Meteo current payload');
    }

    const temperatureC = Math.round(currentTempRaw);
    const weatherCode = Math.round(currentCodeRaw);
    const windSpeedMs = Number.isFinite(currentWindRaw) ? currentWindRaw : 0;
    const condition = mapOpenMeteoWeatherCode(weatherCode, temperatureC, windSpeedMs);

    const dailyTimes = Array.isArray(payload.daily?.time) ? payload.daily.time : [];
    const dailyCodes = Array.isArray(payload.daily?.weather_code) ? payload.daily.weather_code : [];
    const dailyMax = Array.isArray(payload.daily?.temperature_2m_max)
      ? payload.daily.temperature_2m_max
      : [];
    const dailyMin = Array.isArray(payload.daily?.temperature_2m_min)
      ? payload.daily.temperature_2m_min
      : [];
    const dailyWind = Array.isArray(payload.daily?.wind_speed_10m_max)
      ? payload.daily.wind_speed_10m_max
      : [];

    const dailyForecast: DailyForecastItem[] = dailyTimes
      .slice(0, 7)
      .map((dateVal, idx) => {
        const date = typeof dateVal === 'string' ? dateVal : '';
        const code = Number.isFinite(Number(dailyCodes[idx])) ? Math.round(Number(dailyCodes[idx])) : 0;
        const tempMaxC = Number.isFinite(Number(dailyMax[idx]))
          ? Math.round(Number(dailyMax[idx]))
          : temperatureC;
        const tempMinC = Number.isFinite(Number(dailyMin[idx]))
          ? Math.round(Number(dailyMin[idx]))
          : temperatureC;
        const windMax = Number.isFinite(Number(dailyWind[idx])) ? Number(dailyWind[idx]) : 0;
        const dayCond = mapOpenMeteoWeatherCode(code, tempMaxC, windMax);
        const meta = CONDITION_META[dayCond];
        return {
          date,
          condition: dayCond,
          label: meta.label,
          emoji: meta.emoji,
          tempMaxC,
          tempMinC,
          weatherCode: code,
        };
      })
      .filter((item) => Boolean(item.date));

    return new Response(
      JSON.stringify({
        ok: true,
        mode: 'live',
        source: 'open-meteo',
        cityId: coords.cityId,
        cityName: coords.locationName,
        locationName: coords.locationName,
        condition,
        temperatureC,
        weatherCode,
        windSpeedMs,
        updatedAt: Date.now(),
        dailyForecast,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, s-maxage=1800, max-age=1800, stale-while-revalidate=900',
        },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Weather provider unavailable',
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
