const express = require("express");
const app = express();
const axios = require("axios");

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

// helper function
let pageVisitCount = {};

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

// future feature to go to the highest count page
function getHighestVisitPage() {
  if (Object.keys(pageVisitCount).length === 0) {
    // just return 1 if there is no visits yet
    return 1;
  }

  const arr = Object.keys(pageVisitCount).map(function(key) {
    return key;
  });

  return Math.max.apply(null, arr);
}

//routes
const router = express.Router();

// entry point route
router.get("/", function(req, res) {
  // redirect to the "current comic"
  res.redirect(`/comic/`);
});

// redirect to comic based on the href provided
router.get("/comic/:id?", async function(req, res) {
  let data = {};

  incrementPageVisit(req.params.id);

  await axios
    .get(`https://xkcd.com/${req.params.id || ""}/info.0.json`)
    .then(res => {
      data = res.data;
    })
    .catch(err => {
      res.redirect(`/comic/1`);
      console.log("went to a comic that dosn't exist yet!!");
    });

  data = { ...data, pageVisitCount: pageVisitCount[req.params.id] };

  // regex parsing for calrity
  if (data.transcript) {
    data.transcript = data.transcript
      .replace(/\[\[/g, "<i>")
      .replace(/\]\]/g, "</i>")
      .replace(/\{\{/g, "<b>")
      .replace(/\}\}/g, "</b>")
      .replace(/\(\(/g, "<u>")
      .replace(/\)\)/g, "</u>")
      .replace(/([^\\\r\n]+:)/g, matched => "<b>" + matched + "</b>");
  }

  res.render("comic", data);
});

// catch all undefined pages
router.get("*", (req, res) => {
  res.send("Error page not found!");
});

//add the router
app.use("/", router);

app.listen(PORT, () => {
  console.log("app running on ", PORT);
});
