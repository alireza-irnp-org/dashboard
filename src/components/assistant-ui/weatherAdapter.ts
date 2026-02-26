// lib/weather/weatherAdapter.ts

import type {
  WeatherConditionCode,
  WeatherWidgetProps,
} from "@/components/tool-ui/weather-widget/runtime";
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* 1. Condition Code Mapping (Open-Meteo → WeatherConditionCode)     */
/* ------------------------------------------------------------------ */

const openMeteoCodeMap: Record<number, WeatherConditionCode> = {
  0: "clear",
  1: "partly-cloudy",
  2: "cloudy",
  3: "overcast",
  45: "fog",
  48: "fog",
  51: "drizzle",
  53: "drizzle",
  55: "drizzle",
  61: "rain",
  63: "rain",
  65: "heavy-rain",
  80: "rain",
  81: "heavy-rain",
  82: "heavy-rain",
  95: "thunderstorm",
  96: "hail",
  99: "hail",
  71: "snow",
  73: "snow",
  75: "snow",
  77: "snow",
  85: "snow",
  86: "snow",
};

export function mapCondition(code: number): WeatherConditionCode {
  return openMeteoCodeMap[code] ?? "cloudy";
}

/* ------------------------------------------------------------------ */
/* 2. Helper — derive localTimeOfDay (0..1)                           */
/* ------------------------------------------------------------------ */

function deriveLocalTimeOfDay(timezone: string): number {
  const now = new Date();
  const local = new Date(now.toLocaleString("en-US", { timeZone: timezone }));

  const seconds =
    local.getHours() * 3600 + local.getMinutes() * 60 + local.getSeconds();

  return seconds / 86400; // 0..1
}

/* ------------------------------------------------------------------ */
/* 3. Zod Validation for Final Payload                                */
/* ------------------------------------------------------------------ */

const WeatherConditionCodeSchema = z.enum([
  "clear",
  "partly-cloudy",
  "cloudy",
  "overcast",
  "fog",
  "drizzle",
  "rain",
  "heavy-rain",
  "thunderstorm",
  "snow",
  "sleet",
  "hail",
  "windy",
] as const);

const WeatherWidgetPayloadSchema = z.object({
  version: z.literal("3.1"),
  id: z.string(),
  location: z.object({
    name: z.string(),
  }),
  units: z.object({
    temperature: z.union([z.literal("celsius"), z.literal("fahrenheit")]),
  }),
  current: z.object({
    temperature: z.number(),
    tempMin: z.number(),
    tempMax: z.number(),
    conditionCode: WeatherConditionCodeSchema,
    windSpeed: z.number().optional(),
    precipitationLevel: z
      .enum(["none", "light", "moderate", "heavy"] as const)
      .optional(),
    visibility: z.number().optional(),
  }),
  forecast: z
    .array(
      z.object({
        label: z.string(),
        tempMin: z.number(),
        tempMax: z.number(),
        conditionCode: WeatherConditionCodeSchema,
      }),
    )
    .min(1)
    .max(7),
  time: z.object({
    localTimeOfDay: z.number().min(0).max(1),
  }),
  updatedAt: z.string(),
});

/* ------------------------------------------------------------------ */
/* 4. Main Adapter                                                     */
/* ------------------------------------------------------------------ */

export async function fetchWeatherWidgetData(
  city: string,
): Promise<WeatherWidgetProps> {
  // 1️⃣ Geocode city
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city,
    )}&count=1`,
  );

  const geoData = await geoRes.json();

  if (!geoData?.results?.length) {
    throw new Error("City not found");
  }

  const { latitude, longitude, name, timezone } = geoData.results[0];

  // 2️⃣ Fetch weather
  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=${timezone}`,
  );

  const weatherData = await weatherRes.json();

  const current = weatherData.current_weather;
  const daily = weatherData.daily;

  const forecast = daily.time.slice(0, 5).map((date: string, i: number) => ({
    label: new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
    }),
    tempMin: daily.temperature_2m_min[i],
    tempMax: daily.temperature_2m_max[i],
    conditionCode: mapCondition(daily.weathercode[i]),
  }));

  const payload = {
    version: "3.1",
    id: `weather-${city.toLowerCase()}`,
    location: { name },
    units: { temperature: "celsius" },
    current: {
      temperature: current.temperature,
      tempMin: daily.temperature_2m_min[0],
      tempMax: daily.temperature_2m_max[0],
      conditionCode: mapCondition(current.weathercode),
      windSpeed: current.windspeed,
    },
    forecast,
    time: {
      localTimeOfDay: deriveLocalTimeOfDay(timezone),
    },
    updatedAt: new Date().toISOString(),
  };

  const parsed = WeatherWidgetPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error("Weather payload validation failed");
  }

  return parsed.data;
}
