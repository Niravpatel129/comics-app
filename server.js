const express = require("express");
const router = express.Router();
const app = express();

const axios = require("axios");

const PORT = process.env.PORT || 3000;
let pageVisitCount = {}; // hold how many times all the comics have been visited

// express middlewares and setup for our rendering engine
app.use(express.static(__dirname + "/public"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

// hold all the page visits for each comic
function incrementPageVisit(id) {
  if (pageVisitCount[id]) {
    pageVisitCount = {
      ...pageVisitCount,
      [id]: (pageVisitCount[id] += 1)
    };
  } else {
    pageVisitCount = { ...pageVisitCount, [id]: 1 };
  }
}

// Server Routes
router.get("/", function(req, res) {
  // redirect to the "current comic"
  res.redirect(`/comic/`);
});

// redirect to comic based on the href provided
router.get("/comic/:id?", async function(req, res) {
  incrementPageVisit(req.params.id);
  console.log("Loading Comic: " + req.params.id);
  try {
    await axios
      .get(`https://xkcd.com/${req.params.id || ""}/info.0.json`)
      .then(response => {
        let data = {
          ...response.data,
          pageVisitCount: pageVisitCount[req.params.id]
        };

        // regex parsing for calrity
        data.transcript = data.transcript
          .replace(/\[\[/g, "<i>")
          .replace(/\]\]/g, "</i>")
          .replace(/\{\{/g, "<b>")
          .replace(/\}\}/g, "</b>")
          .replace(/\(\(/g, "<u>")
          .replace(/\)\)/g, "</u>")
          .replace(/([^\\\r\n]+:)/g, matched => "<b>" + matched + "</b>");

        res.render("comic", data);
      });
  } catch (e) {
    console.log("comic not found, sending you back to homepage!");
    res.redirect(`/comic/`);
  }
});

// catch all undefined pages
router.get("*", (req, res) => {
  res.send("Error page not found!");
});

// add the router
app.use("/", router);

app.listen(PORT, () => {
  console.log("app running on ", PORT);
});
