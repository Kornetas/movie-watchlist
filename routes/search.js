const express = require("express");
const router = express.Router();

const API_KEY = process.env.TMDB_API_KEY;

router.get("/", async (req, res) => {
  const query = req.query.query;
  const lang = req.query.lang || "pl-PL";

  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
        query
      )}&language=${lang}`
    );
    const data = await response.json();
    const results = data.results.map((movie) => ({
      title: movie.title,
      release_date: movie.release_date,
      poster: movie.poster_path,
    }));
    res.json(results);
  } catch (err) {
    console.error("TMDB search error:", err);
    res.status(500).json({ error: "TMDB search failed" });
  }
});

module.exports = router;
