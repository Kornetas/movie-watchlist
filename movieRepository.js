const Database = require("better-sqlite3");

class MovieRepository {
  constructor(dbPath = "movies.db") {
    this.db = new Database(dbPath);

    //create table if it doesn't exist
    this.db.exec(`
  CREATE TABLE IF NOT EXISTS movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  watched INTEGER NOT NULL DEFAULT 0,
  poster TEXT,
  added_at TEXT
)
     `);
  }

  // quick existence check for a movie by title
  movieExists(title) {
    const stmt = this.db.prepare("SELECT 1 FROM movies WHERE title = ?");
    return !!stmt.get(title);
  }

  // add a movie
  add(title, poster = null) {
    const added_at = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO movies (title, watched, poster, added_at)
      VALUES (?, 0, ?, ?)
    `);
    return stmt.run(title, poster, added_at);
  }

  // get all movies
  getAll() {
    const stmt = this.db.prepare("SELECT * FROM movies");
    return stmt.all();
  }

  // update watched status
  updateWatched(id, watched) {
    const stmt = this.db.prepare("UPDATE movies SET watched = ? WHERE id = ?");
    return stmt.run(watched ? 1 : 0, id);
  }

  // delete movie
  remove(id) {
    const stmt = this.db.prepare("DELETE FROM movies WHERE id = ?");
    return stmt.run(id);
  }

  updateFavorite(id, favorite) {
    const stmt = this.db.prepare("UPDATE movies SET favorite = ? WHERE id = ?");
    return stmt.run(favorite ? 1 : 0, id);
  }

  updateRating(id, rating) {
    const stmt = this.db.prepare("UPDATE movies SET rating = ? WHERE id = ?");
    return stmt.run(rating, id);
  }
}

module.exports = MovieRepository;
