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
        const weatherData = await weatherService.getWeatherData(
            latitude,
            longitude
        );

        res.json({
            success: true,
            city: { name, country },
            weather: {
                current: {
                    temperature: weatherData.current.temperature,
                    description: getWeatherDescription(
                        weatherData.current.weatherCode
                    ),
                },
                hourly: {
                    time: weatherData.hourly.time,
                    temperature_2m: weatherData.hourly.temperature_2m,
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
        const weatherData = await weatherService.getWeatherData(
            latitude,
            longitude
        );

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
        handleApiError(error, res);
    }
});

// Wind endpoint
router.get("/wind/:city", async (req, res) => {
    try {
        const { latitude, longitude, name, country } =
            await geocodingService.getCityCoordinates(req.params.city);
        const weatherData = await weatherService.getWeatherData(
            latitude,
            longitude
        );

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
        handleApiError(error, res);
    }
});

// Elevation endpoint
router.get("/elevation/:city", async (req, res) => {
    try {
        const { latitude, longitude, name, country } =
            await geocodingService.getCityCoordinates(req.params.city);
        const weatherData = await weatherService.getWeatherData(
            latitude,
            longitude
        );

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
        handleApiError(error, res);
    }
});

// Legacy endpoint for complete weather data
router.get("/:city", async (req, res) => {
    try {
        const cityData = await geocodingService.getCityCoordinates(
            req.params.city
        );
        const weatherData = await weatherService.getWeatherData(
            cityData.latitude,
            cityData.longitude
        );

        res.json({
            success: true,
            city: cityData,
            weather: {
                ...weatherData,
                current: {
                    ...weatherData.current,
                    description: getWeatherDescription(
                        weatherData.current.weatherCode
                    ),
                },
            },
        });
    } catch (error) {
        handleApiError(error, res);
    }
});

module.exports = router;
