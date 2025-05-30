const express = require("express");
const router = express.Router();
require("dotenv").config();

// TMDB API KEY
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// GET /api/search?query=batman&lang=pl-PL – Search movies from TMDB
router.get("/", async (req, res) => {
  const query = req.query.query;
  const lang = req.query.lang || "en-US";

  if (!query) {
    return res.status(400).json({ error: "Missing search query" });
  }

  try {
    // Build TMDB search URL
    const tmdbUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      query
    )}&language=${lang}`;

    // Fetch search results from TMDB
    const response = await fetch(tmdbUrl);
    const data = await response.json();

    if (data.errors) {
      return res.status(500).json({ error: "TMDB API error" });
    }

    // Map results to cleaner format
    const results = data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster: movie.poster_path,
    }));

    res.json(results);
  } catch (error) {
    console.error("TMDB API error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
