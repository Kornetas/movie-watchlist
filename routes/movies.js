const express = require("express");
const router = express.Router();

// POST /api/movies – Add a new movie
router.post("/", (req, res) => {
  console.log("BODY:", req.body);

  const { title, poster, tmdb_link } = req.body; // <--- enter tmdb_link here

  if (!title) {
    return res.status(400).send("Title is required");
  }

  if (req.app.locals.movieRepo.movieExists(title)) {
    return res.status(409).json({ message: "Movie already exists" });
  }

  const result = req.app.locals.movieRepo.add({ title, poster, tmdb_link }); // <--- we pass on tmdb_link

  res.status(201).json({ message: "Movie saved", id: result.lastInsertRowid });
});

// GET /api/movies – Get all movies
router.get("/", (req, res) => {
  const movies = req.app.locals.movieRepo.getAll();
  res.json(movies);
});

// PUT /api/movies/:id – Update watched status
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const watched = req.body.watched;

  if (typeof watched !== "boolean") {
    return res.status(400).json({ error: "Invalid watched value" });
  }

  req.app.locals.movieRepo.updateWatched(id, watched);
  res.status(200).json({ message: "Movie updated" });
});

// DELETE /api/movies/:id – Remove movie
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  req.app.locals.movieRepo.remove(id);
  res.status(200).json({ message: "Movie deleted" });
});

// PUT /api/movies/:id/favorite – Toggle favorite status
router.put("/:id/favorite", (req, res) => {
  const id = req.params.id;
  const favorite = req.body.favorite;

  if (typeof favorite !== "boolean") {
    return res.status(400).json({ error: "Invalid favorite value" });
  }

  req.app.locals.movieRepo.updateFavorite(id, favorite);
  res.status(200).json({ message: "Favorite status updated" });
});

// PUT /api/movies/:id/rating – Update movie rating
router.put("/:id/rating", (req, res) => {
  const id = req.params.id;
  const rating = req.body.rating;

  if (typeof rating !== "number" || rating < 0 || rating > 5) {
    return res.status(400).json({ error: "Invalid rating" });
  }

  req.app.locals.movieRepo.updateRating(id, rating);
  res.status(200).json({ message: "Rating updated" });
});

// PUT /api/movies/:id/note – Update movie note
router.put("/:id/note", (req, res) => {
  const id = req.params.id;
  const note = req.body.note;

  if (typeof note !== "string") {
    return res.status(400).json({ error: "Invalid note" });
  }

  req.app.locals.movieRepo.updateNote(id, note);
  res.status(200).json({ message: "Note updated" });
});

module.exports = router;
