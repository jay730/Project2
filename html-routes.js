//var db = require("../models");
//The path
var path = require("path");

module.exports = function(app) {

  // Load index page
  app.get("/", function(req, res) {
      
    var indexHtml = path.join(__dirname, '../public/html/index.html');
    res.sendFile(indexHtml);
  });

  //Keep for reference
  // Load example page and pass in an example by id
     app.get("/example/:id", function(req, res) {
       db.Example.findOne({ where: { id: req.params.id } }).then(function(dbExample) {
         res.render("example", {
           example: dbExample
         });
       });
    });


};