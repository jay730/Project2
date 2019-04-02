var db = require("../models");
var axios = require("axios");
var db = require("../models");
var selectedFlights = [];
var selectedDesitinationId = [];
var cityCode;
var price;
var fromDT;
var toDT;
var sessionKey;
var agentImg;
var agentPrice;
var agentUrl;
var agentId;
var unirest = require("unirest");

module.exports = function(app) {
  app.get("/api/flightQuotes", function(req, res) {
    price = req.query.price;
    fromDT = req.query.fromDT;
    toDT = req.query.toDT;
    db.places
      .findOne({
        attributes: ["SkyscannerCode"],
        where: {
          CityName: req.query.city
        }
      })
      .then(function(result) {
        cityCode = result.dataValues.SkyscannerCode;
        skyAPI(res);
      });
  });

  app.get("/api/eventSearch", function(req, res) {
    axios({
      method: "get",
      url: "https://app.ticketmaster.com/discovery/v2/events.json?",
      params: {
        apikey: "RiZRkyV5YlnXPcOPAlrXwWG4IMbwx2n8",
        countryCode: "US",
        city: req.query.city,
        startDateTime: req.query.startDateTime,
        endDateTime: req.query.endDateTime
      }
    })
      .then(function(response) {
        res.send(response.data);
      })
      .catch(function(error) {
        console.log(error);
      });
  });

  app.get("/api/flightTicketBooking", function(req, res) {
    unirest
      .post(
        "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/pricing/v1.0"
      )
      .header(
        "X-RapidAPI-Key",
        "724f8b9587msh8a227a8b4dd0c9cp10065ajsnb69f17f1332c"
      )
      .header("Content-Type", "application/x-www-form-urlencoded")
      .send("inboundDate=" + req.query.inboundDate)
      .send("country=US")
      .send("currency=USD")
      .send("locale=en-US")
      .send("cabinClass=economy")
      .send("originPlace=" + req.query.originIata)
      .send("destinationPlace=" + req.query.destinationIata)
      .send("outboundDate=" + req.query.outboundDate)
      .send("adults=1")
      .end(function(result) {
        console.log(result.headers.location.split("/").pop());
        sessionKey = result.headers.location.split("/").pop();
        getTickets(res);
      });
  });
};

function skyAPI(res) {
  var queryURL =
    "http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/US/usd/en-US/" +
    cityCode +
    "/us/" +
    fromDT +
    "/" +
    toDT +
    "?";
  axios({
    method: "get",
    url: queryURL,
    params: {
      ApiKey: "prtl6749387986743898559646983194"
    }
  })
    .then(function(response) {
      filterFlights(response, res);
    })
    .catch(function(error) {
      console.log(error);
    });
}

function filterFlights(response, res) {
  if (response.data.Quotes.length === 0) {
    selectedFlights = [];
  } else {
    for (var i = 0; i < response.data.Quotes.length; i++) {
      if (response.data.Quotes[i].MinPrice <= price) {
        if (selectedFlights.length < 9) {
          selectedFlights.push({
            destinationCode: response.data.Quotes[i].OutboundLeg.DestinationId,
            price: response.data.Quotes[i].MinPrice,
            destinationCity: "",
            destinationIata: "",
            originIata: cityCode + "-sky"
          });
          selectedDesitinationId.push(
            response.data.Quotes[i].OutboundLeg.DestinationId
          );
        }
      }
    }
  }

  db.places
    .findAll({
      attributes: ["cityName", "IataCode"],
      where: {
        PlaceId: selectedDesitinationId
      }
    })
    .then(function(result) {
      for (var i = 0; i < result.length; i++) {
        selectedFlights[i].destinationCity = result[i].dataValues.cityName;
        selectedFlights[i].destinationIata =
          result[i].dataValues.IataCode + "-sky";
      }
      res.send(selectedFlights);
    });
}

function getTickets(res) {
  unirest
    .get(
      "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/pricing/uk2/v1.0/" +
        sessionKey +
        "?pageIndex=0&pageSize=10"
    )
    .header(
      "X-RapidAPI-Key",
      "724f8b9587msh8a227a8b4dd0c9cp10065ajsnb69f17f1332c"
    )
    .end(function(result) {
      if (result.body.Status !== "UpdatesComplete") {
        getTickets(res);
      } else {
        var lowest = Number.POSITIVE_INFINITY;
        for (var i = 0; i < result.body.Itineraries.length; i++) {
          for (
            var j = 0;
            j < result.body.Itineraries[i].PricingOptions.length;
            j++
          ) {
            agentPrice = result.body.Itineraries[i].PricingOptions[j].Price;
            if (agentPrice < lowest) {
              lowest = agentPrice;
              agentUrl =
                result.body.Itineraries[i].PricingOptions[j].DeeplinkUrl;
              agentId = result.body.Itineraries[i].PricingOptions[j].Agents[0];
            }
          }
        }
        for (var i = 0; i < result.body.Agents.length; i++) {
          var agentIdKey = Object.keys(result.body.Agents[i]).find(key => result.body.Agents[i][key] === agentId);

          if (agentIdKey !== undefined) {
            agentImg = result.body.Agents[i].ImageUrl;
          }
        }
        res.send({
          agentImg: agentImg,
          agentPrice: agentPrice,
          agentUrl: agentUrl
        });
      }
    });
}
