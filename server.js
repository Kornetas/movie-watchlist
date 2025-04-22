const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// parse JSON bodies
app.use(express.json());

// serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));

//import and use movie routes
const movieRoutes = require("./routes/movies");
app.use("/api/movies", movieRoutes);

const MovieRepository = require("./movieRepository");
const movieRepo = new MovieRepository(); //containing detailed movies.db file
app.locals.movieRepo = movieRepo;

// start server
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
