// DOM Elements
const form = document.getElementById("location-form");
const resultDiv = document.getElementById("weather-result");
const cityInput = document.getElementById("city");
const weatherNav = document.getElementById("weather-nav");

// Store the current weather data globally
let currentWeatherData = null;

/**
 * Fetches specific weather data from our server API
 * @param {string} cityName - Name of the city to search for
 * @param {string} type - Type of weather data to fetch (temperature, humidity, wind, elevation)
 * @returns {Promise<Object>} Weather data from server
 */
async function getWeatherFromServer(cityName, type = "temperature") {
    const response = await fetch(
        `/api/weather/${type}/${encodeURIComponent(cityName)}`
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.error || `Server error (HTTP ${response.status})`
        );
    }

    return response.json();
}

/**
 * Updates the UI with loading, error, or weather information
 * @param {string} message - Message to display
 * @param {string} [type='info'] - Type of message (info, error, or success)
 */
function updateUI(message, type = "info") {
    resultDiv.innerHTML = message;
    resultDiv.className = `weather-result ${type}`;
}

/**
 * Validates the city input
 * @param {string} city - City name to validate
 * @returns {boolean} Whether the input is valid
 */
function validateInput(city) {
    if (!city) {
        updateUI("Please enter a city name", "error");
        return false;
    }
    if (!/^[a-zA-Z\s-]+$/.test(city)) {
        updateUI(
            "Please enter a valid city name (letters, spaces, and hyphens only)",
            "error"
        );
        return false;
    }
    return true;
}

/**
 * Formats temperature view
 * @param {Object} data - Weather data from server
 * @returns {string} Formatted HTML string
 */
function formatTemperatureView(data) {
    const { city, weather } = data;
    const { current, hourly } = weather;

    const nextHours = hourly.time.slice(0, 6).map((time, index) => ({
        time: new Date(time).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        }),
        temp: Math.round(hourly.temperature_2m[index]),
    }));

    return `
        <div class="weather-info">
            <h2>${city.name}, ${city.country}</h2>
            <div class="current-weather">
                <div class="temperature">${Math.round(
                    current.temperature
                )}°C</div>
                <div class="description">${current.description}</div>
            </div>
            
            <div class="hourly-preview">
                <h3>Temperature Forecast - Next 6 Hours</h3>
                <div class="hourly-grid">
                    ${nextHours
                        .map(
                            (hour) => `
                        <div class="hourly-item">
                            <div class="hour-time">${hour.time}</div>
                            <div class="hour-temp">${hour.temp}°C</div>
                        </div>
                    `
                        )
                        .join("")}
                </div>
            </div>
        </div>
    `;
}

/**
 * Formats humidity view
 * @param {Object} data - Weather data from server
 * @returns {string} Formatted HTML string
 */
function formatHumidityView(data) {
    const { city, weather } = data;
    const { current } = weather;

    return `
        <div class="weather-info">
            <h2>${city.name}, ${city.country}</h2>
            <div class="current-weather">
                <div class="humidity-display">
                    <div class="large-value">${Math.round(
                        current.humidity
                    )}%</div>
                    <div class="label">Current Humidity</div>
                </div>
                <div class="description">
                    ${
                        current.humidity > 70
                            ? "High humidity levels"
                            : current.humidity < 30
                            ? "Low humidity levels"
                            : "Moderate humidity levels"
                    }
                </div>
            </div>
        </div>
    `;
}

/**
 * Formats wind speed view
 * @param {Object} data - Weather data from server
 * @returns {string} Formatted HTML string
 */
function formatWindView(data) {
    const { city, weather } = data;
    const { current } = weather;

    return `
        <div class="weather-info">
            <h2>${city.name}, ${city.country}</h2>
            <div class="current-weather">
                <div class="wind-display">
                    <div class="large-value">${Math.round(
                        current.windSpeed
                    )} km/h</div>
                    <div class="label">Current Wind Speed</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Formats elevation view
 * @param {Object} data - Weather data from server
 * @returns {string} Formatted HTML string
 */
function formatElevationView(data) {
    const { city, weather } = data;
    const { location } = weather;

    return `
        <div class="weather-info">
            <h2>${city.name}, ${city.country}</h2>
            <div class="current-weather">
                <div class="elevation-display">
                    <div class="large-value">${location.elevation}m</div>
                    <div class="label">Elevation Above Sea Level</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Updates the weather display based on the selected view
 * @param {string} view - The view to display (temperature, humidity, wind, elevation)
 * @param {string} city - The city name to fetch data for
 */
async function updateWeatherView(view, city) {
    updateUI("Loading " + view + " data...", "info");

    try {
        const data = await getWeatherFromServer(city, view);
        if (!data.success) {
            throw new Error(data.error || "Unknown error occurred");
        }

        let content;
        switch (view) {
            case "temperature":
                content = formatTemperatureView(data);
                break;
            case "humidity":
                content = formatHumidityView(data);
                break;
            case "wind":
                content = formatWindView(data);
                break;
            case "elevation":
                content = formatElevationView(data);
                break;
            default:
                content = formatTemperatureView(data);
        }

        updateUI(content, "success");
    } catch (error) {
        console.error("Weather fetch error:", error);
        updateUI(error.message || "Error fetching " + view + " data.", "error");
    }
}

// Store the current city name globally
let currentCity = "";

// Set up navigation button event listeners
weatherNav.addEventListener("click", (e) => {
    if (e.target.classList.contains("nav-btn")) {
        const view = e.target.dataset.view;
        // Update active button state
        document.querySelectorAll(".nav-btn").forEach((btn) => {
            btn.classList.remove("active");
        });
        e.target.classList.add("active");
        // Update the view with new API request
        updateWeatherView(view, currentCity);
    }
});

// Main form submission handler
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();

    if (!validateInput(city)) {
        return;
    }

    updateUI("Loading weather data from server...", "info");
    weatherNav.style.display = "none"; // Hide navigation while loading

    try {
        // Store the city name globally
        currentCity = city;

        // Get initial temperature data
        const data = await getWeatherFromServer(city, "temperature");

        if (!data.success) {
            throw new Error(data.error || "Unknown error occurred");
        }

        // Show the default view (temperature)
        const formattedDisplay = formatTemperatureView(data);
        updateUI(formattedDisplay, "success");

        // Show navigation buttons
        weatherNav.style.display = "flex";

        // Set the first button as active
        document
            .querySelector('.nav-btn[data-view="temperature"]')
            .classList.add("active");

        // Log data for debugging
        console.log("Temperature data received:", data);
    } catch (error) {
        console.error("Weather fetch error:", error);
        updateUI(error.message || "Error fetching weather data.", "error");
        weatherNav.style.display = "none"; // Hide navigation on error
    }
});
