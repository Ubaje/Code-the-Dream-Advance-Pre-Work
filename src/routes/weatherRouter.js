const express = require("express");
const router = express.Router();
const weatherService = require("../services/weather");
const geocodingService = require("../services/geocoding");
const { getWeatherDescription } = require("../utils/weatherCodes");

// Helper function to handle API errors
const handleApiError = (error, res) => {
    console.error("API Error:", error);
    res.status(500).json({
        success: false,
        error: error.message || "Something went wrong",
    });
};

// Temperature endpoint
router.get("/temperature/:city", async (req, res) => {
    try {
        const { latitude, longitude, name, country } =
            await geocodingService.getCityCoordinates(req.params.city);

        // Get current weather and temperature forecast in parallel
        const [currentData, forecastData] = await Promise.all([
            weatherService.getCurrentWeather(latitude, longitude),
            weatherService.getTemperatureForecast(latitude, longitude),
        ]);

        res.json({
            success: true,
            city: { name, country },
            weather: {
                current: {
                    temperature: currentData.current.temperature,
                    description: getWeatherDescription(
                        currentData.current.weatherCode
                    ),
                },
                hourly: {
                    time: forecastData.hourly.time,
                    temperature_2m: forecastData.hourly.temperature_2m,
                },
            },
        });
    } catch (error) {
        handleApiError(error, res);
    }
});

// Humidity endpoint
router.get("/humidity/:city", async (req, res) => {
    try {
        const { latitude, longitude, name, country } =
            await geocodingService.getCityCoordinates(req.params.city);

        // Get current weather and humidity forecast in parallel
        const [currentData, forecastData] = await Promise.all([
            weatherService.getCurrentWeather(latitude, longitude),
            weatherService.getHumidityForecast(latitude, longitude),
        ]);

        res.json({
            success: true,
            city: { name, country },
            weather: {
                current: {
                    humidity: currentData.current.humidity,
                },
                hourly: {
                    time: forecastData.hourly.time,
                    relative_humidity_2m:
                        forecastData.hourly.relative_humidity_2m,
                },
            },
        });
    } catch (error) {
        handleApiError(error, res);
    }
});

// Wind endpoint
router.get("/wind/:city", async (req, res) => {
    try {
        const { latitude, longitude, name, country } =
            await geocodingService.getCityCoordinates(req.params.city);

        // Get current weather and wind forecast in parallel
        const [currentData, forecastData] = await Promise.all([
            weatherService.getCurrentWeather(latitude, longitude),
            weatherService.getWindForecast(latitude, longitude),
        ]);

        res.json({
            success: true,
            city: { name, country },
            weather: {
                current: {
                    windSpeed: currentData.current.windSpeed,
                },
                hourly: {
                    time: forecastData.hourly.time,
                    wind_speed_10m: forecastData.hourly.wind_speed_10m,
                },
            },
        });
    } catch (error) {
        handleApiError(error, res);
    }
});

// Elevation endpoint
router.get("/elevation/:city", async (req, res) => {
    try {
        const { latitude, longitude, name, country } =
            await geocodingService.getCityCoordinates(req.params.city);

        // Only need location data for elevation
        const locationData = await weatherService.getLocationData(
            latitude,
            longitude
        );

        res.json({
            success: true,
            city: { name, country },
            weather: {
                location: {
                    elevation: locationData.location.elevation,
                },
            },
        });
    } catch (error) {
        handleApiError(error, res);
    }
});

// Legacy endpoint for complete weather data
router.get("/:city", async (req, res) => {
    try {
        const { latitude, longitude, name, country } =
            await geocodingService.getCityCoordinates(req.params.city);

        // Get all weather data in parallel
        const [currentData, tempForecast, humidityForecast, windForecast] =
            await Promise.all([
                weatherService.getCurrentWeather(latitude, longitude),
                weatherService.getTemperatureForecast(latitude, longitude),
                weatherService.getHumidityForecast(latitude, longitude),
                weatherService.getWindForecast(latitude, longitude),
            ]);

        // Combine the data
        res.json({
            success: true,
            city: {
                name,
                country,
                latitude,
                longitude,
            },
            weather: {
                location: currentData.location,
                current: {
                    ...currentData.current,
                    description: getWeatherDescription(
                        currentData.current.weatherCode
                    ),
                },
                hourly: {
                    time: tempForecast.hourly.time,
                    temperature_2m: tempForecast.hourly.temperature_2m,
                    relative_humidity_2m:
                        humidityForecast.hourly.relative_humidity_2m,
                    wind_speed_10m: windForecast.hourly.wind_speed_10m,
                },
            },
        });
    } catch (error) {
        handleApiError(error, res);
    }
});

module.exports = router;
