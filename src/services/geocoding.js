// Service for handling city geocoding operations
class GeocodingService {
    async getCityCoordinates(cityName) {
        const searchURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            cityName
        )}&count=1`;

        try {
            const response = await fetch(searchURL);

            if (!response.ok) {
                throw new Error(`Geocoding failed (HTTP ${response.status})`);
            }

            const data = await response.json();

            if (!data.results?.length) {
                throw new Error(`Sorry, I couldn't find "${cityName}"`);
            }

            return data.results[0];
        } catch (error) {
            throw error;
        }
    }
}

// Export a singleton instance
module.exports = new GeocodingService();
