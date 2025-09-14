# Weather Information App

A dynamic web application that provides detailed weather information for cities worldwide using the Open-Meteo API. The app features separate views for different weather aspects and makes real-time API requests for fresh data.

## Prerequisites

Before running this project, make sure you have the following installed:

-   [Node.js](https://nodejs.org/) (v12 or higher)
-   npm (comes with Node.js)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Ubaje/Code-the-Dream-Advance-Pre-Work.git
```

2. Navigate to the project directory:

```bash
cd Code-the-Dream-Advance-Pre-Work
```

3. Install dependencies:

```bash
npm install
```

## Running the Application

1. Start the server:

```bash
npm start
```

2. Open your web browser and visit:

```
http://localhost:3000
```

3. Try out the features:
    - Enter a city name and click "Get Weather"
    - Use the navigation buttons to view different weather aspects
    - Each view makes a fresh API request for up-to-date data

## Project Structure

```
Code the Dream Advance Pre-Work/
├── src/
│   ├── public/           # Static files
│   │   ├── index.html    # Main HTML file
│   │   ├── style.css     # Styles
│   │   └── script.js     # Frontend JavaScript
│   ├── routes/           # API route handlers
│   │   └── weather.js    # Weather-related endpoints
│   ├── services/         # Business logic
│   │   ├── geocoding.js  # City coordinates service
│   │   └── weather.js    # Weather data service
│   ├── utils/           # Helper functions
│   │   └── weatherCodes.js # Weather code mappings
│   └── server.js        # Main application file
├── package.json
└── README.md
```

## External APIs Used

-   **Geocoding API:** https://geocoding-api.open-meteo.com/v1/search
    -   Used for converting city names to coordinates
-   **Weather API:** https://api.open-meteo.com/v1/forecast
    -   Used for fetching weather data

## Technologies Used

-   **Frontend:**
    -   HTML5 with semantic elements
    -   CSS3 with responsive design
    -   Vanilla JavaScript with modern features
-   **Backend:**
    -   Node.js
    -   Express.js
    -   Open-Meteo API package
