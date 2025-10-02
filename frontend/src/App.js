import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("youtube");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light"); // light | dark

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const searchContent = async () => {
    if (!query) return;
    setLoading(true);

    try {
      const endpoint = activeTab === "youtube" ? "/api/youtube" : "/api/reddit";
      const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

      const res = await axios.get(`${BASE_URL}${endpoint}`, {
        params: { q: query },
      });

      if (activeTab === "youtube") {
        setResults(Array.isArray(res.data.items) ? res.data.items : []);
      } else {
        // ✅ Updated for safer Reddit handling
        setResults(Array.isArray(res.data?.data) ? res.data.data : []);
      }
    } catch (err) {
      console.error("API Fetch Error:", err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="container">
      {/* Theme Toggle */}
      <div className="theme-toggle">
        <button onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </div>

      <h1>🔍 Content Search</h1>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "youtube" ? "active" : ""}
          onClick={() => setActiveTab("youtube")}
        >
          🎥 YouTube
        </button>
        <button
          className={activeTab === "reddit" ? "active" : ""}
          onClick={() => setActiveTab("reddit")}
        >
          👾 Reddit
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${activeTab}...`}
        />
        <button onClick={searchContent} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Floating Particles */}
      <div className="particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div className="particle" key={i}></div>
        ))}
      </div>

      {/* Results */}
      <div className="results">
        {activeTab === "youtube" &&
          results.map((video) => {
            const videoId = video?.id?.videoId;
            const title = video?.snippet?.title;
            if (!videoId || !title) return null;
            return (
              <div className="card" key={videoId}>
                <h3>{title}</h3>
                <iframe
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  frameBorder="0"
                  allowFullScreen
                  title={title}
                ></iframe>
              </div>
            );
          })}

        {activeTab === "reddit" &&
          results.map((post) => {
            const url = post.url;
            const mediaUrl = post.media?.fallback_url;
            const isImage = url && url.match(/\.(jpeg|jpg|gif|png)$/i);
            const isVideo = post.is_video && mediaUrl;

            return (
              <div className="card" key={post.id}>
                <h3>{post.title}</h3>
                {isImage && <img src={url} alt={post.title} className="media" />}
                {isVideo && <video controls className="media" src={mediaUrl}></video>}
                {!isImage && !isVideo && (
                  <a
                    href={`https://reddit.com${post.permalink}`}
                    target="_blank"
                    rel="noreferrer"
                    className="fallback-link"
                  >
                    View Post
                  </a>
                )}
              </div>
            );
          })}

      </div>
    </div>
  );
}

export default App;
