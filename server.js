const express = require("express");
const app = express();
const axios = require("axios");

app.use(express.static("public"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

//routes
const router = express.Router();
router.get("/", function(req, res) {
  res.send("hello world");
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
