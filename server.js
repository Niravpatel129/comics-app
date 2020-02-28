const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// express middlewares and setup for our rendering engine
app.use(express.static(__dirname + "/public"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

//routes
app.use("/", require("./routes/comicRoute"));

// start our server
app.listen(PORT, () => {
  console.log("app running on ", PORT);
});
