const express = require("express");
const router = express.Router();

// post api/movies - recive mowie title from fronted
router.post("/", (req, res) => {
  const { title, poster } = req.body;

  if (!title) {
    return res.status(400).send("Title is required");
  }

  if (req.app.locals.movieRepo.movieExists(title)) {
    return res.status(409).json({ message: "Movie already exists" });
  }

  const result = req.app.locals.movieRepo.add(title, poster);
  res.status(201).json({ message: "Movie saved", id: result.lastInsertRowid });
});

// get /api/movies
router.get("/", (req, res) => {
  const movies = req.app.locals.movieRepo.getAll();
  res.json(movies);
});

// PUT /api/movies/:id – update watched status
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const watched = req.body.watched;

  if (typeof watched !== "boolean") {
    return res.status(400).json({ error: "Invalid watched value" });
  }

  req.app.locals.movieRepo.updateWatched(id, watched);
  res.status(200).json({ message: "Movie updated" });
});

// DELETE /api/movies/:id – remove a movie
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  req.app.locals.movieRepo.remove(id);
  res.status(200).json({ message: "Movie deleted" });
});

// PUT /api/movies/:id/favorite – toggle favorite status
router.put("/:id/favorite", (req, res) => {
  const id = req.params.id;
  const favorite = req.body.favorite;

  if (typeof favorite !== "boolean") {
    return res.status(400).json({ error: "Invalid favorite value" });
  }

  req.app.locals.movieRepo.updateFavorite(id, favorite);
  res.status(200).json({ message: "Favorite status updated" });
});

// Update movie rating
router.put("/:id/rating", (req, res) => {
  const id = req.params.id;
  const rating = req.body.rating;

  if (typeof rating !== "number" || rating < 0 || rating > 5) {
    return res.status(400).json({ error: "Invalid rating" });
  }

  req.app.locals.movieRepo.updateRating(id, rating);
  res.status(200).json({ message: "Rating updated" });
});

// PUT /api/movies/:id/note – update note
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
