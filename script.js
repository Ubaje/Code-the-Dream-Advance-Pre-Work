const form = document.getElementById("location-form");
const resultDiv = document.getElementById("weather-result");
    
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = document.getElementById("city").value.trim();
  if (!city) return;
  alert("Form submitted for city: " + city);

  resultDiv.textContent = "Loading...";

  try {
    // Step 1: Get city coordinates
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      resultDiv.textContent = "City not found.";
      return;
    }

    resultDiv.textContent = "Weather data fetched successfully!";

    const { latitude, longitude, name, country } = geoData.results[0];

  } catch (error) {
    resultDiv.textContent = "Error fetching weather data.";
    console.error(error);
  }
});

