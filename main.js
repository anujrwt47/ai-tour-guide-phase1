import { fetchWeather } from './weatherApi.js';
import {
  fetchPlacePredictions,
  getCoordinatesForPlace,
  fetchNearbyAttractions
} from './placesApi.js';
const loader = document.getElementById("loader");

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const suggestionsContainer = document.getElementById("suggestions");
const errorContainer = document.getElementById("error-message");
const resultContainer = document.getElementById("trip-results");

let activeLocationName = "";

searchInput.addEventListener("input", async (e) => {
  const value = e.target.value.trim();
  if (value.length > 2) {
    const predictions = await fetchPlacePredictions(value);
    suggestionsContainer.innerHTML = "";
    predictions.forEach((prediction) => {
      const button = document.createElement("button");
      button.className = "suggestion-item";
      button.textContent = prediction.description;
      button.addEventListener("click", () => handleLocationSelect(prediction.description));
      suggestionsContainer.appendChild(button);
    });
  } else {
    suggestionsContainer.innerHTML = "";
  }
});

searchButton.addEventListener("click", () => {
  if (searchInput.value.trim()) {
    handleLocationSelect(searchInput.value.trim());
  }
});

async function handleLocationSelect(locationName) {
  suggestionsContainer.innerHTML = "";
  showError(""); // Clear any previous error
  showLoader(); // Show loading state

  searchInput.value = locationName;
  activeLocationName = locationName;

  try {
    console.log("Fetching weather for", locationName);
    const weather = await fetchWeather(locationName);

    if (!weather) throw new Error("Failed to get weather");

    const coords = await getCoordinatesForPlace(locationName);
    console.log("Got coordinates", coords);

    const places = await fetchNearbyAttractions(coords.lat, coords.lng);
    console.log("Fetched places", places);

    const tripDetails = {
      weather,
      recommendations: {
        summary: `Here's what's happening in ${locationName} — great weather for exploring!`,
        weatherAdvice: `Pack accordingly: ${weather.description}.`,
        activities: places.map((place) => ({
          name: place.name,
          description: `Located at ${place.address}`,
          weatherSuitability: "Great in current weather",
        })),
      },
    };

    renderTripDetails(tripDetails);
  } catch (err) {
    console.error("ERROR during fetch:", err);
    showError("❌ Failed to load trip details. Please check your input or API setup.");
  }
}




function renderTripDetails(trip) {
  resultContainer.classList.remove("hidden");

  resultContainer.innerHTML = `
    <h2>Current Weather</h2>
    <p>${trip.weather.temperature}°C - ${trip.weather.description}</p>
    <p>Humidity: ${trip.weather.humidity}%</p>
    <p>Wind Speed: ${trip.weather.windSpeed} m/s</p>

    <h2>Trip Summary</h2>
    <p>${trip.recommendations.summary}</p>

    <h2>Recommended Activities</h2>
    <ul>
      ${trip.recommendations.activities
        .map(
          (activity) =>
            `<li><strong>${activity.name}</strong><br>${activity.description}<br>${activity.weatherSuitability}</li>`
        )
        .join("")}
    </ul>

    <h2>Weather Advice</h2>
    <p>${trip.recommendations.weatherAdvice}</p>
  `;
}
function showLoader() {
  resultContainer.classList.remove("hidden");
  resultContainer.innerHTML = "<p>Loading...</p>";
}

function showError(message) {
  errorContainer.textContent = message;
  errorContainer.classList.remove("hidden");
  resultContainer.classList.add("hidden");
}
