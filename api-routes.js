//requirements and requests 
var request = require("request");
var db = require("./models");

module.exports = function(app) {
  
  
  
    // The Get for all examples of an inquiry
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


//Our filter for the response quote 
function filterFlights(response) {
  if (response.Quotes.length === 0) {
      //If no info in the response
    noQuoteMessage = "No quote is available for your request!";
  } else {
    for (var i = 0; i < response.Quotes.length; i++) {
      if (response.Quotes[i].MinPrice <= price) {

        var destinationCode = response.Quotes[i].OutboundLeg.DestinationId;
        var place = $.grep(placesArray, function(n) {
          return n.PlaceId === destinationCode;
        });


        var destinationCity = place[0].CityName;
        selectedFlights.push({
          destinationCity: destinationCity,
          price: response.Quotes[i].MinPrice
        });
      }
    }
    returnFlights();
  }
}