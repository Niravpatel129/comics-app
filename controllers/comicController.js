const axios = require("axios");
const moment = require("moment");

let pageVisitCount = {}; // hold how many times all the comics have been visited
let latestComic; // hold the most early comic's id

// hold all the page visits for each comic
function incrementPageVisit(id) {
  if (pageVisitCount[id]) {
    pageVisitCount[id]++;
  } else {
    pageVisitCount[id] = 1;
  }
}

// set latest comic id
function setLatestComic(param, id) {
  // check if we are on the homepage which loads the latest by default
  if (param === undefined) {
    latestComic = id;
  }
}

// get date
function getDate(year, month, day) {
  if (day < 10) {
    day = day.padStart(2, "0");
  }

  if (month < 10) {
    month = month.padStart(2, "0");
  }

  return moment(year + month + day).format("ll");
}

module.exports = {
  GetHome: (req, res) => {
    // home redirect to the "current comic"
    res.redirect(`/comic/`);
  },
  GetComicById: async (req, res) => {
    try {
      await axios
        .get(`https://xkcd.com/${req.params.id || ""}/info.0.json`)
        .then(response => {
          const comicId = response.data.num;

          console.log("Loading Comic: " + response.data.num);

          // increment our comic page visit count
          incrementPageVisit(comicId);
          setLatestComic(req.params.id, response.data.num);

          let date = getDate(
            response.data.year,
            response.data.month,
            response.data.day
          );

          // append our counter onto the page data
          let data = {
            ...response.data,
            pageVisitCount: pageVisitCount[comicId],
            latestComic: latestComic,
            date: date
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
  }
};
