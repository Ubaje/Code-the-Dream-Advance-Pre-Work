const { fetchWeatherApi } = require("openmeteo");

// My custom weather service
class WeatherService {
    // Get weather data from Open-Meteo API
    async getWeatherData(lat, lon) {
        const params = {
            latitude: lat,
            longitude: lon,
            hourly: "temperature_2m,relative_humidity_2m,wind_speed_10m",
            current:
                "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
            timezone: "auto",
        };

        try {
            const responses = await fetchWeatherApi(
                "https://api.open-meteo.com/v1/forecast",
                params
            );
            return this._processWeatherResponse(responses[0]);
        } catch (error) {
            throw new Error("Failed to fetch weather data: " + error.message);
        }
    }

    // Process the API response into a friendly format
    _processWeatherResponse(response) {
        // Get location info
        const locationInfo = {
            latitude: response.latitude(),
            longitude: response.longitude(),
            elevation: response.elevation(),
            timezone: response.timezone(),
            utcOffsetSeconds: response.utcOffsetSeconds(),
        };

        // Get current conditions
        const current = response.current();
        const currentConditions = {
            temperature: current.variables(0).value(),
            humidity: current.variables(1).value(),
            windSpeed: current.variables(2).value(),
            weatherCode: current.variables(3).value(),
        };

        // Get hourly forecast
        const hourly = response.hourly();
        const hourlyData = {
            time: this._generateTimeArray(
                hourly,
                locationInfo.utcOffsetSeconds
            ),
            temperature_2m: hourly.variables(0).valuesArray(),
            relative_humidity_2m: hourly.variables(1).valuesArray(),
            wind_speed_10m: hourly.variables(2).valuesArray(),
        };

        return {
            location: locationInfo,
            current: currentConditions,
            hourly: hourlyData,
        };
    }

    // Generate time array for hourly forecast
    _generateTimeArray(hourly, utcOffset) {
        const startTime = Number(hourly.time());
        const endTime = Number(hourly.timeEnd());
        const interval = hourly.interval();
        const steps = (endTime - startTime) / interval;

        return [...Array(steps)].map(
            (_, i) => new Date((startTime + i * interval + utcOffset) * 1000)
        );
    }
}

module.exports = new WeatherService();
