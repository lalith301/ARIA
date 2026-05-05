// ARIA Tools — Tavily primary, Serper fallback

const TODAY = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  export const CURRENT_DATE_CONTEXT = `Today is ${TODAY}.`;
  
  // Tavily search — full page content, built for AI agents
  async function searchWithTavily(query: string): Promise<string | null> {
    try {
      const todayISO = new Date().toISOString().split("T")[0]; // e.g. 2026-04-21
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query: `${query} ${todayISO}`,  // ← inject date into query
          search_depth: "advanced",
          include_answer: true,
          include_raw_content: false,
          max_results: 5,               
        }),
      });
  
      if (!res.ok) throw new Error(`Tavily failed: ${res.status}`);
      const data = await res.json();
  
      let result = "";
      if (data.answer) result += `Summary: ${data.answer}\n\n`;
  
      if (data.results?.length) {
        result += data.results
          .slice(0, 4)
          .map((r: any) => `Source: ${r.title}\n${r.content}\nURL: ${r.url}`)
          .join("\n\n");
      }
  
      return result || null;
    } catch (err) {
      console.warn("Tavily failed, trying Serper:", err);
      return null;
    }
  }
  
  // Serper search — fallback
  async function searchWithSerper(query: string): Promise<string | null> {
    try {
      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: query, num: 5 }),
      });
  
      if (!res.ok) throw new Error(`Serper failed: ${res.status}`);
      const data = await res.json();
      if (!data.organic?.length) return null;
  
      const answerBox = data.answerBox
        ? `Quick Answer: ${data.answerBox.answer || data.answerBox.snippet}\n\n`
        : "";
  
      const results = data.organic
        .slice(0, 4)
        .map((r: any) => `Title: ${r.title}\nSnippet: ${r.snippet}\nURL: ${r.link}`)
        .join("\n\n");
  
      return answerBox + results;
    } catch (err) {
      console.warn("Serper also failed:", err);
      return null;
    }
  }
  
  // Main search — Tavily first, Serper fallback
  export async function searchWeb(query: string): Promise<string> {
    const tavily = await searchWithTavily(query);
    if (tavily) return tavily;
  
    const serper = await searchWithSerper(query);
    if (serper) return serper;
  
    return "Search unavailable right now. Please try again.";
  }
  
  // Weather using Open-Meteo (completely free, no key needed)
  export async function getWeather(city: string): Promise<string> {
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );
      const geoData = await geoRes.json();
  
      if (!geoData.results?.length) {
        return `Could not find weather for "${city}".`;
      }
  
      const { latitude, longitude, name, country } = geoData.results[0];
  
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature&timezone=auto`
      );
      const weatherData = await weatherRes.json();
      const current = weatherData.current;
  
      const weatherDescriptions: { [key: number]: string } = {
        0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Foggy", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
        61: "Light rain", 63: "Rain", 65: "Heavy rain",
        71: "Light snow", 73: "Snow", 75: "Heavy snow",
        80: "Rain showers", 95: "Thunderstorm",
      };
  
      const description = weatherDescriptions[current.weather_code] || "Unknown";
  
      return `Weather in ${name}, ${country}:
  Temperature: ${current.temperature_2m}°C (feels like ${current.apparent_temperature}°C)
  Condition: ${description}
  Humidity: ${current.relative_humidity_2m}%
  Wind: ${current.wind_speed_10m} km/h`;
    } catch (err) {
      console.error("Weather failed:", err);
      return "Could not fetch weather right now.";
    }
  }
  
  // Smart tool detection — aggressive, catches most factual questions
  export function detectToolNeeded(message: string): {
    tool: "search" | "weather" | null;
    query: string;
  } {
    const lower = message.toLowerCase();
  
    // Weather detection
    const weatherKeywords = ["weather", "temperature", "forecast", "rain", "sunny", "hot", "cold", "humid", "climate"];
    if (weatherKeywords.some(k => lower.includes(k))) {
      const cityPatterns = [
        /weather\s+in\s+([a-zA-Z\s]+)/i,
        /weather\s+(?:for|at)\s+([a-zA-Z\s]+)/i,
        /temperature\s+in\s+([a-zA-Z\s]+)/i,
        /([a-zA-Z\s]+)\s+weather/i,
      ];
      for (const pattern of cityPatterns) {
        const match = message.match(pattern);
        if (match) return { tool: "weather", query: match[1].trim() };
      }
      return { tool: "weather", query: "Chennai" };
    }
  
    // Aggressive search detection
    const searchTriggers = [
      "news", "latest", "recent", "today", "yesterday", "this week",
      "current", "now", "happening", "update", "breaking",
      "what is", "what are", "who is", "who are", "where is",
      "when did", "when was", "how much", "how many", "what happened",
      "why did", "tell me about", "explain", "history of", "origin of",
      "president", "prime minister", "ceo", "founder",
      "movie", "film", "show", "series", "book", "song", "album",
      "price", "cost", "stock", "market", "score", "result", "winner",
      "population", "capital", "search", "find", "look up", "google",
      "discover", "learn about", "know about",
      "live", "ipl", "cricket", "football", "match", "game", "sport",  // ← added sports
    ];
  
    if (searchTriggers.some(k => lower.includes(k))) {
        const isLive = ["live", "score", "match", "ipl", "cricket", "football", "game"].some(k => lower.includes(k));
        const specificQuery = isLive
          ? `${message} live score ${new Date().toISOString().split("T")[0]}`
          : message;
        return { tool: "search", query: specificQuery };
      }
  
    // Any question longer than 3 words → search it
    const isQuestion =
      lower.includes("?") ||
      lower.startsWith("what") || lower.startsWith("who") ||
      lower.startsWith("where") || lower.startsWith("when") ||
      lower.startsWith("why") || lower.startsWith("how") ||
      lower.startsWith("is ") || lower.startsWith("are ") ||
      lower.startsWith("does ") || lower.startsWith("did ") ||
      lower.startsWith("can ");
  
    const wordCount = message.trim().split(/\s+/).length;
    if (isQuestion && wordCount > 3) {
      return { tool: "search", query: message };
    }
  
    return { tool: null, query: "" };
  }