//var db = require("../models");
var path = require("path");

module.exports = function(app) {
  // Load index page
  app.get("/", function(req, res) {
    var indexHtml = path.join(__dirname, "../public/html/index.html");
    res.sendFile(indexHtml);
  });
};
