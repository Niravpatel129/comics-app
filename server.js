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

router.get("/", function(req, res) {
  res.redirect(`/comic/`);
});

router.get("/comic/:id?", async function(req, res) {
  let data = {};
  incrementPageVisit(req.params.id);
  await axios
    .get(`https://xkcd.com/${req.params.id || ""}/info.0.json`)
    .then(res => {
      data = res.data;
    });

  // console.log(data.transcript);
  data = { ...data, pageVisitCount: pageVisitCount[req.params.id] };
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
