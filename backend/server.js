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
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const response = await axios.get(
      `https://www.reddit.com/search.json`,
      {
        params: { q: query, limit: 30, sort: "relevance" },
        timeout: 8000,
      }
    );

    const children = response.data?.data?.children || [];

    // Filter & normalize results
    const filtered = children.map((child) => {
      const data = child.data;
      return {
        id: data.id,
        title: data.title,
        url: data.url,
        permalink: data.permalink,
        is_video: data.is_video,
        media: data.media?.reddit_video || null,
      };
    });

    res.json({ data: filtered });
  } catch (error) {
    console.error("Reddit API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch Reddit data" });
  }
});




const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
