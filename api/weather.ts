/**
 * Vercel Serverless / Web Standard Weather Proxy Architecture
 *
 * Security notes:
 * - Reads WEATHER_API_KEY strictly from server-side environment variables (`process.env.WEATHER_API_KEY`).
 * - NEVER expose weather API keys in VITE_* frontend env variables or client bundles.
 * - Uses manual city selection (no GPS/geolocation).
 * - Falls back cleanly to city/season simulation when WEATHER_API_KEY is unset or upstream fails.
 */

export const config = {
  runtime: 'edge',
};

interface CityLookup {
  id: string;
  name: string;
  lat: number;
  lon: number;
  climateBias: 'warm' | 'mild' | 'cool' | 'snowy';
}

const CITY_LOOKUP: Record<string, CityLookup> = {
  kaohsiung: { id: 'kaohsiung', name: '高雄', lat: 22.6273, lon: 120.3014, climateBias: 'warm' },
  taipei: { id: 'taipei', name: '台北', lat: 25.033, lon: 121.5654, climateBias: 'mild' },
  taichung: { id: 'taichung', name: '台中', lat: 24.1477, lon: 120.6736, climateBias: 'mild' },
  tainan: { id: 'tainan', name: '台南', lat: 22.9997, lon: 120.227, climateBias: 'warm' },
  hualien: { id: 'hualien', name: '花蓮', lat: 23.9872, lon: 121.6016, climateBias: 'mild' },
  tokyo: { id: 'tokyo', name: '東京', lat: 35.6762, lon: 139.6503, climateBias: 'cool' },
  seoul: { id: 'seoul', name: '首爾', lat: 37.5665, lon: 126.978, climateBias: 'cool' },
  sapporo: { id: 'sapporo', name: '札幌', lat: 43.0618, lon: 141.3545, climateBias: 'snowy' },
};

type ProxyCondition = 'clear' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'hot' | 'windy';

function mapOpenWeatherCode(weatherId: number, tempC: number, windSpeedMs: number): ProxyCondition {
  if (weatherId >= 200 && weatherId < 300) return 'storm';
  if (weatherId >= 600 && weatherId < 700) return 'snow';
  if (weatherId >= 300 && weatherId < 600) return 'rain';
  if (windSpeedMs >= 8.5) return 'windy';
  if (tempC >= 31) return 'hot';
  if (weatherId === 800) return 'clear';
  return 'cloudy';
}

function getServerEnvKey(): string {
  const g = globalThis as {
    process?: { env?: Record<string, string | undefined> };
  };
  return g.process?.env?.WEATHER_API_KEY?.trim() ?? '';
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const rawCity = (url.searchParams.get('city') ?? 'kaohsiung').toLowerCase().trim();
  const city = CITY_LOOKUP[rawCity] ?? CITY_LOOKUP.kaohsiung;
  const apiKey = getServerEnvKey();

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        ok: true,
        mode: 'simulated',
        cityId: city.id,
        cityName: city.name,
        message: 'WEATHER_API_KEY not configured on server; client uses seasonal simulation.',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=900',
        },
      }
    );
  }

  try {
    const endpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&lang=zh_tw&appid=${encodeURIComponent(
      apiKey
    )}`;
    const upstream = await fetch(endpoint, { method: 'GET' });
    if (!upstream.ok) {
      throw new Error(`Upstream status ${upstream.status}`);
    }
    const payload = (await upstream.json()) as {
      main?: { temp?: number };
      wind?: { speed?: number };
      weather?: Array<{ id?: number }>;
    };
    const tempC = Math.round(Number(payload.main?.temp ?? 24));
    const windMs = Number(payload.wind?.speed ?? 0);
    const weatherId = Number(payload.weather?.[0]?.id ?? 800);
    const condition = mapOpenWeatherCode(weatherId, tempC, windMs);

    return new Response(
      JSON.stringify({
        ok: true,
        mode: 'live',
        cityId: city.id,
        cityName: city.name,
        condition,
        temperatureC: tempC,
        updatedAt: Date.now(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=1800',
        },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({
        ok: true,
        mode: 'simulated',
        cityId: city.id,
        cityName: city.name,
        message: 'Weather provider unavailable; falling back safely to seasonal simulation.',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
