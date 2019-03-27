//var db = require("../models");
var request = require("request");

module.exports = function(app) {
  // Get all examples
  app.get("/api/flightQuotes", function(req, res) {
    console.log(req.query);
    var queryURL =
      "http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/US/usd/en-US/" +
      req.query.cityCode +
      "/us/" +
      req.query.fromDT +
      "/" +
      req.query.toDT +
      "?";
    console.log(queryURL);
    request({
      uri: queryURL,
      qs: {
        apikey: "prtl6749387986743898559646983194"
      }
    }).pipe(res);
  });

  // Create a new example
  app.post("/api/examples", function(req, res) {
    db.Example.create(req.body).then(function(dbExample) {
      res.json(dbExample);
    });
  });

  // Delete an example by id
  app.delete("/api/examples/:id", function(req, res) {
    db.Example.destroy({ where: { id: req.params.id } }).then(function(
      dbExample
    ) {
      res.json(dbExample);
    });
  });
};
