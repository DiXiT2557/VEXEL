const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

// Basic test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// YouTube Search Route
app.get("/api/youtube", async (req, res) => {
  const query = req.query.q;
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: "snippet",
          q: query,
          maxResults: 30,   
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Reddit Search Route
app.get("/api/reddit", async (req, res) => {
  const query = req.query.q;
  try {
    const response = await axios.get(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=30` 
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
