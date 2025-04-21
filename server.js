const express = require("express");
const app = express();
const PORT = 3000;



app.use(express.static('public'))

//this route just say hello for test if server is alive
// app.get("/", (req, res) => {
//   res.send("Cześć nowa appka");
// });

// init server
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
