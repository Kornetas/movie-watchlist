const express = require("express");
const router = express.Router();

// post api/movies - recive mowie title from fronted
router.post("/", (req, res) => {
  const title = req.body.title;

  if (!title) {
    return res.status(400).send("Title is required");
  }

  //na razie tylko logujemt, bez bazy danych
  console.log("New movie added:", title);

  res.status(201).json({ message: "OK", title });
});

module.exports = router;
