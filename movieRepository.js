const Database = require("better-sqlite3");

class MovieRepository {
  constructor(dbPath = "movies.db") {
    this.db = new Database(dbPath);

    // Create movies table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        watched INTEGER NOT NULL DEFAULT 0,
        poster TEXT,
        tmdb_link TEXT,
        rating INTEGER DEFAULT 0,
        favorite INTEGER DEFAULT 0,
        note TEXT,
        added_at TEXT DEFAULT (CURRENT_TIMESTAMP)
      )
    `);
  }

  // Check if a movie with the given title already exists
  movieExists(title) {
    const stmt = this.db.prepare("SELECT 1 FROM movies WHERE title = ?");
    return !!stmt.get(title);
  }

  // Add a new movie
  add({ title, poster, tmdb_link }) {
    const stmt = this.db.prepare(`
      INSERT INTO movies (title, poster, tmdb_link, added_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `);
    const result = stmt.run(title, poster, tmdb_link);
    return result;
  }

  // Get all movies
  getAll() {
    const stmt = this.db.prepare("SELECT * FROM movies");
    return stmt.all();
  }

  // Update watched status
  updateWatched(id, watched) {
    const stmt = this.db.prepare("UPDATE movies SET watched = ? WHERE id = ?");
    return stmt.run(watched ? 1 : 0, id);
  }

  // Remove a movie
  remove(id) {
    const stmt = this.db.prepare("DELETE FROM movies WHERE id = ?");
    return stmt.run(id);
  }

  // Update favorite status
  updateFavorite(id, favorite) {
    const stmt = this.db.prepare("UPDATE movies SET favorite = ? WHERE id = ?");
    return stmt.run(favorite ? 1 : 0, id);
  }

  // Update movie rating
  updateRating(id, rating) {
    const stmt = this.db.prepare("UPDATE movies SET rating = ? WHERE id = ?");
    return stmt.run(rating, id);
  }

  // Update movie note
  updateNote(id, note) {
    const stmt = this.db.prepare("UPDATE movies SET note = ? WHERE id = ?");
    return stmt.run(note, id);
  }
}

module.exports = MovieRepository;
