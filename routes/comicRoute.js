const router = require("express").Router();
const comic = require("../controllers/comicController");

// Server Routes
router.get("/", comic.GetHome);

// redirect to comic based on the href provided
router.get("/comic/:id?", comic.GetComicById);

// catch all undefined pages
router.get("*", (req, res) => {
  res.send("Error page not found!");
});

module.exports = router;
