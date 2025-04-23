const Database = require("better-sqlite3");

class MovieRepository {
  constructor(dbPath = "movies.db") {
    this.db = new Database(dbPath);

    //create table if it doesn't exist
    this.db.exec(`
        CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        watched INTEGER NOT NULL DEFAULT 0
      )
     `);
  }

  // quick existence check for a movie by title
  movieExists(title) {
    const stmt = this.db.prepare("SELECT 1 FROM movies WHERE title = ?");
    return !!stmt.get(title);
  }

  // add a movie
  add(title) {
    const stmt = this.db.prepare("INSERT INTO movies (title) VALUES (?)");
    return stmt.run(title);
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
}

module.exports = MovieRepository;
