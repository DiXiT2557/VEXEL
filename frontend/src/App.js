import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("youtube");
  const [loading, setLoading] = useState(false);

  const searchContent = async () => {
    if (!query) return;
    setLoading(true);

    try {
      const endpoint = activeTab === "youtube" ? "/api/youtube" : "/api/reddit";

      // Use environment variable for backend URL
      const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

      const res = await axios.get(`${BASE_URL}${endpoint}`, {
        params: { q: query },
      });

      if (activeTab === "youtube") {
        setResults(Array.isArray(res.data.items) ? res.data.items : []);
      } else {
        setResults(
          Array.isArray(res.data?.data?.children) ? res.data.data.children : []
        );
      }
    } catch (err) {
      console.error("API Fetch Error:", err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ JSX should be returned from App component, not from searchContent
  return (
    <div className="container">
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

      {/* Results */}
      <div className="results">
        {/* YouTube */}
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

        {/* Reddit */}
        {activeTab === "reddit" &&
          results.map((post) => {
            const data = post?.data;
            if (!data) return null;

            const url = data?.url;
            const mediaUrl = data?.media?.reddit_video?.fallback_url;
            const isImage = url && url.match(/\.(jpeg|jpg|gif|png)$/i);
            const isVideo = data?.is_video && mediaUrl;

            return (
              <div className="card" key={data.id}>
                <h3>{data.title}</h3>

                {isImage && (
                  <img src={url} alt={data.title} className="media" />
                )}
                {isVideo && (
                  <video controls className="media" src={mediaUrl}></video>
                )}

                {!isImage && !isVideo && (
                  <a
                    href={`https://reddit.com${data.permalink}`}
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
