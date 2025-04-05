const API_KEY = '1eeadc851ec9da25984fd02b4a8a8ed5'; // Replace with your real API key

export async function fetchWeather(locationName) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(locationName)}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) throw new Error('Weather fetch failed');

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
    };
  } catch (err) {
    console.error('Weather API error:', err);
    return null; // fallback if weather fails
  }
}
