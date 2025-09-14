const { fetchWeatherApi } = require("openmeteo");

// My custom weather service
class WeatherService {
    constructor() {
        this.API_URL = "https://api.open-meteo.com/v1/forecast";
    }

    // Get only current weather data
    async getCurrentWeather(lat, lon) {
        const params = {
            latitude: lat,
            longitude: lon,
            current:
                "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
            timezone: "auto",
        };

        try {
            const responses = await fetchWeatherApi(this.API_URL, params);
            return this._processCurrentWeather(responses[0]);
        } catch (error) {
            throw new Error(
                "Failed to fetch current weather: " + error.message
            );
        }
    }

    // Get temperature forecast data
    async getTemperatureForecast(lat, lon) {
        const params = {
            latitude: lat,
            longitude: lon,
            hourly: "temperature_2m",
            timezone: "auto",
        };

        try {
            const responses = await fetchWeatherApi(this.API_URL, params);
            return this._processHourlyForecast(responses[0], "temperature_2m");
        } catch (error) {
            throw new Error(
                "Failed to fetch temperature forecast: " + error.message
            );
        }
    }

    // Get humidity forecast data
    async getHumidityForecast(lat, lon) {
        const params = {
            latitude: lat,
            longitude: lon,
            hourly: "relative_humidity_2m",
            timezone: "auto",
        };

        try {
            const responses = await fetchWeatherApi(this.API_URL, params);
            return this._processHourlyForecast(
                responses[0],
                "relative_humidity_2m"
            );
        } catch (error) {
            throw new Error(
                "Failed to fetch humidity forecast: " + error.message
            );
        }
    }

    // Get wind speed forecast data
    async getWindForecast(lat, lon) {
        const params = {
            latitude: lat,
            longitude: lon,
            hourly: "wind_speed_10m",
            timezone: "auto",
        };

        try {
            const responses = await fetchWeatherApi(this.API_URL, params);
            return this._processHourlyForecast(responses[0], "wind_speed_10m");
        } catch (error) {
            throw new Error("Failed to fetch wind forecast: " + error.message);
        }
    }

    // Get location data only
    async getLocationData(lat, lon) {
        const params = {
            latitude: lat,
            longitude: lon,
            timezone: "auto",
        };

        try {
            const responses = await fetchWeatherApi(this.API_URL, params);
            const locationInfo = this._processLocationInfo(responses[0]);
            return {
                location: locationInfo, // Wrap in location object to match expected structure
            };
        } catch (error) {
            throw new Error("Failed to fetch location data: " + error.message);
        }
    }

    // Process current weather data
    _processCurrentWeather(response) {
        const current = response.current();
        return {
            location: this._processLocationInfo(response),
            current: {
                temperature: current.variables(0).value(),
                humidity: current.variables(1).value(),
                windSpeed: current.variables(2).value(),
                weatherCode: current.variables(3).value(),
            },
        };
    }

    // Process location information
    _processLocationInfo(response) {
        return {
            latitude: response.latitude(),
            longitude: response.longitude(),
            elevation: response.elevation(),
            timezone: response.timezone(),
            utcOffsetSeconds: response.utcOffsetSeconds(),
        };
    }

    // Process hourly forecast for a specific variable
    _processHourlyForecast(response, variable) {
        const hourly = response.hourly();
        const locationInfo = this._processLocationInfo(response);

        return {
            location: locationInfo,
            hourly: {
                time: this._generateTimeArray(
                    hourly,
                    locationInfo.utcOffsetSeconds
                ),
                [variable]: hourly.variables(0).valuesArray(),
            },
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
