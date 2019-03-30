var request = require("request");
var db = require("../models");

module.exports = function(app) {
  // Get all examples
  app.get("/api/flightQuotes", function(req, res) {
    var queryURL =
      "http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/US/usd/en-US/" +
      req.query.cityCode +
      "/us/" +
      req.query.fromDT +
      "/" +
      req.query.toDT +
      "?";
    request({
      uri: queryURL,
      qs: {
        apikey: "prtl6749387986743898559646983194"
      }
    }).pipe(res);
  });
};

function filterFlights(response) {
  if (response.Quotes.length === 0) {
    noQuoteMessage = "no quote is available at this time!";
  } else {
    for (var i = 0; i < response.Quotes.length; i++) {
      if (response.Quotes[i].MinPrice <= price) {
        var destinationCode = response.Quotes[i].OutboundLeg.DestinationId;
        var place = $.grep(placesArray, function(n) {
          return n.PlaceId === destinationCode;
        });
        //var destinationCity = place[0].CityName;
        var destinationCity = "test";
        selectedFlights.push({
          destinationCity: destinationCity,
          price: response.Quotes[i].MinPrice
        });
      }
    }
    returnFlights();
  }
}
