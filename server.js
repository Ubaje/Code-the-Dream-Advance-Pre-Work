const express = require("express");
const path = require("path");
const { fetchWeatherApi } = require("openmeteo");

const app = express();
const port = 3000;

// Middleware
app.use(express.static("public"));
app.use(express.json());

/**
 * Gets coordinates for a city using the geocoding API
 * @param {string} cityName - Name of the city
 * @returns {Promise<Object>} City data with coordinates
 */
async function getCityCoordinates(cityName) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        cityName
    )}&count=1`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Failed to fetch city coordinates (HTTP ${response.status})`
        );
    }

    const data = await response.json();
    if (!data.results?.length) {
        throw new Error("City not found");
    }

    return data.results[0];
}

/**
 * Fetches weather data using the openmeteo package
 * @param {number} latitude - Latitude of the location
 * @param {number} longitude - Longitude of the location
 * @returns {Promise<Object>} Processed weather data
 */
async function getWeatherWithOpenMeteo(latitude, longitude) {
    const params = {
        latitude: latitude,
        longitude: longitude,
        hourly: "temperature_2m,relative_humidity_2m,wind_speed_10m",
        current:
            "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
        timezone: "auto",
    };

    const url = "https://api.open-meteo.com/v1/forecast";
    const responses = await fetchWeatherApi(url, params);

    // Process first location
    const response = responses[0];

    // Attributes for timezone and location
    const responseLatitude = response.latitude();
    const responseLongitude = response.longitude();
    const elevation = response.elevation();
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const timezone = response.timezone();

    console.log(
        `\nCoordinates: ${responseLatitude}°N ${responseLongitude}°E`,
        `\nElevation: ${elevation}m asl`,
        `\nTimezone: ${timezone}`,
        `\nTimezone difference to GMT+0: ${utcOffsetSeconds}s`
    );

    // Get current data
    const current = response.current();
    const currentData = {
        temperature: current.variables(0).value(), // temperature_2m
        humidity: current.variables(1).value(), // relative_humidity_2m
        windSpeed: current.variables(2).value(), // wind_speed_10m
        weatherCode: current.variables(3).value(), // weather_code
    };

    // Get hourly data
    const hourly = response.hourly();
    const weatherData = {
        hourly: {
            time: [
                ...Array(
                    (Number(hourly.timeEnd()) - Number(hourly.time())) /
                        hourly.interval()
                ),
            ].map(
                (_, i) =>
                    new Date(
                        (Number(hourly.time()) +
                            i * hourly.interval() +
                            utcOffsetSeconds) *
                            1000
                    )
            ),
            temperature_2m: hourly.variables(0).valuesArray(),
            relative_humidity_2m: hourly.variables(1).valuesArray(),
            wind_speed_10m: hourly.variables(2).valuesArray(),
        },
    };

    return {
        location: {
            latitude: responseLatitude,
            longitude: responseLongitude,
            elevation: elevation,
            timezone: timezone,
            utcOffsetSeconds: utcOffsetSeconds,
        },
        current: currentData,
        hourly: weatherData.hourly,
    };
}

/**
 * Gets weather description from weather code
 */
function getWeatherDescription(code) {
    const weatherCodes = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        95: "Thunderstorm",
    };
    return weatherCodes[code] || "Unknown";
}

// API Routes

// Route for getting temperature data
app.get("/api/weather/temperature/:city", async (req, res) => {
    try {
        const cityName = req.params.city;
        const cityData = await getCityCoordinates(cityName);
        const { latitude, longitude, name, country } = cityData;
        const weatherData = await getWeatherWithOpenMeteo(latitude, longitude);
        const weatherDescription = getWeatherDescription(
            weatherData.current.weatherCode
        );

        res.json({
            success: true,
            city: { name, country },
            weather: {
                current: {
                    temperature: weatherData.current.temperature,
                    description: weatherDescription,
                },
                hourly: {
                    time: weatherData.hourly.time,
                    temperature_2m: weatherData.hourly.temperature_2m,
                },
            },
        });
    } catch (error) {
        console.error("Weather API error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route for getting humidity data
app.get("/api/weather/humidity/:city", async (req, res) => {
    try {
        const cityName = req.params.city;
        const cityData = await getCityCoordinates(cityName);
        const { latitude, longitude, name, country } = cityData;
        const weatherData = await getWeatherWithOpenMeteo(latitude, longitude);

        res.json({
            success: true,
            city: { name, country },
            weather: {
                current: {
                    humidity: weatherData.current.humidity,
                },
                hourly: {
                    time: weatherData.hourly.time,
                    relative_humidity_2m:
                        weatherData.hourly.relative_humidity_2m,
                },
            },
        });
    } catch (error) {
        console.error("Weather API error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route for getting wind data
app.get("/api/weather/wind/:city", async (req, res) => {
    try {
        const cityName = req.params.city;
        const cityData = await getCityCoordinates(cityName);
        const { latitude, longitude, name, country } = cityData;
        const weatherData = await getWeatherWithOpenMeteo(latitude, longitude);

        res.json({
            success: true,
            city: { name, country },
            weather: {
                current: {
                    windSpeed: weatherData.current.windSpeed,
                },
                hourly: {
                    time: weatherData.hourly.time,
                    wind_speed_10m: weatherData.hourly.wind_speed_10m,
                },
            },
        });
    } catch (error) {
        console.error("Weather API error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route for getting elevation data
app.get("/api/weather/elevation/:city", async (req, res) => {
    try {
        const cityName = req.params.city;
        const cityData = await getCityCoordinates(cityName);
        const { latitude, longitude, name, country } = cityData;
        const weatherData = await getWeatherWithOpenMeteo(latitude, longitude);

        res.json({
            success: true,
            city: { name, country },
            weather: {
                location: {
                    elevation: weatherData.location.elevation,
                },
            },
        });
    } catch (error) {
        console.error("Weather API error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Legacy route for getting all weather data
app.get("/api/weather/:city", async (req, res) => {
    try {
        const cityName = req.params.city;

        // Get city coordinates
        const cityData = await getCityCoordinates(cityName);
        const { latitude, longitude, name, country } = cityData;

        // Get weather data using openmeteo package
        const weatherData = await getWeatherWithOpenMeteo(latitude, longitude);

        // Add weather description
        const weatherDescription = getWeatherDescription(
            weatherData.current.weatherCode
        );

        // Send response
        res.json({
            success: true,
            city: {
                name: name,
                country: country,
                latitude: latitude,
                longitude: longitude,
            },
            weather: {
                ...weatherData,
                current: {
                    ...weatherData.current,
                    description: weatherDescription,
                },
            },
        });
    } catch (error) {
        console.error("Weather API error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// Route for the main page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(
        `Weather API available at http://localhost:${port}/api/weather/{city}`
    );
    console.log(`Health check at http://localhost:${port}/api/health`);
});
