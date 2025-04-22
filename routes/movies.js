const express = require("express");
const router = express.Router();

// post api/movies - recive mowie title from fronted
router.post("/", (req, res) => {
  const title = req.body.title;
  if (!title) {
    return res.status(400).send("Title is required");
  }

  const result = req.app.locals.movieRepo.add(title);
  res.status(201).json({ message: "Movie saved", id: result.lastInsertRowid });
});

// get /api/movies
router.get("/", (req, res) => {
  const movies = req.app.locals.movieRepo.getAll();
  res.json(movies);
});

module.exports = router;
