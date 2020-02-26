const express = require("express");
const app = express();
const path = require("path");
const router = express.Router();
const axios = require("axios");

app.use(express.static("public"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

//routes
router.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

router.get("/comic/:id", async function(req, res) {
  let data = {};
  await axios.get(`https://xkcd.com/${req.params.id}/info.0.json`).then(res => {
    data = res.data;
  });
  res.render("comic", data);
});

//add the router
app.use("/", router);

app.listen(process.env.port || 3000);

console.log("Running at Port 3000");
