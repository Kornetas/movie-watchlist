const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 3000;

// parse JSON bodies
app.use(express.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// Movie routes (add, update, delete, get)
const movieRoutes = require("./routes/movies");
app.use("/api/movies", movieRoutes);

// TMDB search route (search movies from TMDB)
const searchRoutes = require("./routes/search");
app.use("/api/search", searchRoutes);

// Set up the movie repository and attach it to app.locals
const MovieRepository = require("./movieRepository");
const movieRepo = new MovieRepository(); //containing detailed movies.db file
app.locals.movieRepo = movieRepo;

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
