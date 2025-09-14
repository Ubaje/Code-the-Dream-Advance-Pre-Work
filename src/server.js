const express = require("express");
const path = require("path");

// Import my custom weather routes
const weatherRoutes = require("./routes/weather");

const app = express();
const port = process.env.PORT || 3000;

// Set up middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Register weather routes
app.use("/api/weather", weatherRoutes);

// Serve the main app page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health check for monitoring
app.get("/api/health", (req, res) => {
    res.json({
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

// Error handling for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found",
    });
});

// Start server
app.listen(port, () => {
    console.log(`
🌤  Weather App Server Running!
    
   Local:            http://localhost:${port}
   Health Check:     http://localhost:${port}/api/health
   API Documentation: http://localhost:${port}/api/weather/{city}
   
   Ready for requests!
`);
});
