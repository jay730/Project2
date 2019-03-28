// // Get references to page elements
// var $exampleText = $("#example-text");
// var $exampleDescription = $("#example-description");
// var $submitBtn = $("#submit");
// var $exampleList = $("#example-list");

// // The API object contains methods for each kind of request we'll make
// var API = {
//   saveExample: function(example) {
//     return $.ajax({
//       headers: {
//         "Content-Type": "application/json"
//       },
//       type: "POST",
//       url: "api/examples",
//       data: JSON.stringify(example)
//     });
//   },
//   getExamples: function() {
//     return $.ajax({
//       url: "api/examples",
//       type: "GET"
//     });
//   },
//   deleteExample: function(id) {
//     return $.ajax({
//       url: "api/examples/" + id,
//       type: "DELETE"
//     });
//   }
// };

// // refreshExamples gets new examples from the db and repopulates the list
// var refreshExamples = function() {
//   API.getExamples().then(function(data) {
//     var $examples = data.map(function(example) {
//       var $a = $("<a>")
//         .text(example.text)
//         .attr("href", "/example/" + example.id);

//       var $li = $("<li>")
//         .attr({
//           class: "list-group-item",
//           "data-id": example.id
//         })
//         .append($a);

//       var $button = $("<button>")
//         .addClass("btn btn-danger float-right delete")
//         .text("ｘ");

//       $li.append($button);

//       return $li;
//     });

//     $exampleList.empty();
//     $exampleList.append($examples);
//   });
// };

// // handleFormSubmit is called whenever we submit a new example
// // Save the new example to the db and refresh the list
// var handleFormSubmit = function(event) {
//   event.preventDefault();

//   var example = {
//     text: $exampleText.val().trim(),
//     description: $exampleDescription.val().trim()
//   };

//   if (!(example.text && example.description)) {
//     alert("You must enter an example text and description!");
//     return;
//   }

//   API.saveExample(example).then(function() {
//     refreshExamples();
//   });

//   $exampleText.val("");
//   $exampleDescription.val("");
// };

// // handleDeleteBtnClick is called when an example's delete button is clicked
// // Remove the example from the db and refresh the list
// var handleDeleteBtnClick = function() {
//   var idToDelete = $(this)
//     .parent()
//     .attr("data-id");

//   API.deleteExample(idToDelete).then(function() {
//     refreshExamples();
//   });
// };

// // Add event listeners to the submit and delete buttons
// $submitBtn.on("click", handleFormSubmit);
// $exampleList.on("click", ".delete", handleDeleteBtnClick);

//global vars
var origin;
var fromDT;
var toDT;
var price;
var city;
var stateCode;
var startDateTime;
var endDateTime;
var selectedEvents = [];
var placesArray = [];
var selectedFlights = [];
var noQuoteMessage = "";
var noEventMessage = "";
var buttonID;
var eventCity;
var inputValid = true;

//functions
//main functions to call sky api
function mainFunction() {
  //Remove previous results
  initialization();
  //input collection
  inputCollection();
  //input validation
  inputValidation();
  if (inputValid) {
    //input conversion
    inputConversion();
    //call event API
    skyAPI();
  }
}

function initialization() {
  noQuoteMessage = "";
  inputValid = true;
  selectedEvents = [];
  selectedFlights = [];
  $("#results").empty();
}

function inputCollection() {
  //origin place
  origin = $("#origin").val();
  //from date
  fromDT = $("#fromDT").val();
  //to date
  toDT = $("#toDT").val();
  //max price
  price = $("#price").val();
}

function inputValidation() {
  if (!$.isNumeric(price) || price <= 0) {
    $("#results").text("Please put correct price!");
    inputValid = false;
  }

  var now = moment();
  now = moment(now).add(1, "days");
  now = moment(now).format("YYYY-MM-DD");
  if (toDT < fromDT) {
    $("#results").text("Please pick correct end date!");
    inputValid = false;
  }

  if (fromDT < now) {
    $("#results").text(
      "The start date is a past date. Please pick correct start date!"
    );
    inputValid = false;
  }
}

function inputConversion() {
  var cityState = origin.split(",");
  city = cityState[0];
  stateCode = cityState[1];
  startDateTime = fromDT + "T00:00:00Z";
  endDateTime = toDT + "T00:00:00Z";
}

function skyAPI() {
  $.ajax("/api/flightQuotes", {
    type: "GET",
    data: {
      city: city,
      fromDT: fromDT,
      toDT: toDT
    }
  }).then(returnFlights);
}

function returnFlights(response) {
  var $section = $("<section>");
  var $divContainer = $("<div>");
  $divContainer.attr("class", "container");

  if (selectedFlights.length === 0) {
    noQuoteMessage =
      "no quote is available at this time! You might want to increase the price.";
  } else {
    for (var i = 0; i < selectedFlights.length; i++) {
      var $button = $("<button>");
      $button.text(
        selectedFlights[i].destinationCity + "," + selectedFlights[i].price
      );
      $button.attr("class", "flightButton");
      $button.css("display", "block");
      $button.attr("id", i);
      $button.attr("value", selectedFlights[i].destinationCity);
      $divContainer.append($button);
    }
  }
  if (noQuoteMessage === "") {
    $section.append($divContainer);
    $("#results").append($section);
  } else {
    $("#results").text(noQuoteMessage);
    noQuoteMessage = "";
  }
}

//functions to call event api
function eventFunction() {
  $(".eventSection").empty();
  $(".weatherSection").empty();
  selectedEvents = [];
  eventCity = $(this).attr("value");
  buttonID = "#" + $(this).attr("id");
  eventAPI();
}

function eventAPI() {
  var queryURL = eventUrl();
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(filterEvents);
}

function eventUrl() {
  queryURL = "https://app.ticketmaster.com/discovery/v2/events.json?";
  queryParams = {
    apikey: "RiZRkyV5YlnXPcOPAlrXwWG4IMbwx2n8",
    countryCode: "US"
  };
  queryParams.city = eventCity;
  queryParams.startDateTime = startDateTime;
  queryParams.endDateTime = endDateTime;
  return queryURL + $.param(queryParams);
}

function filterEvents(response) {
  var eventCount = 0;
  if (response.page.totalElements === 0) {
    noEventMessage = "no event is available at this time!";
  } else if (response._embedded.events.length > 3) {
    eventCount = 3;
  } else {
    eventCount = response._embedded.events.length;
  }
  if (eventCount > 0) {
    for (var i = 0; i < eventCount; i++) {
      selectedEvents.push({
        eventName: response._embedded.events[i].name,
        eventURL: response._embedded.events[i].url
      });
    }
  }
  returnEvents();
  weatherAPI();
}

function returnEvents() {
  var section = $("<section>");
  var divContainer = $("<div>");
  section.attr("class", "eventSection");
  divContainer.attr("class", "container");
  if (selectedEvents.length !== 0) {
    for (var i = 0; i < selectedEvents.length; i++) {
      var eventButton = $("<button>");
      var eventLink = $("<a>");
      eventLink.text(selectedEvents[i].eventName);
      eventLink.attr("href", selectedEvents[i].eventURL);
      eventLink.attr("target", "_blank");
      eventButton.append(eventLink);
      divContainer.append(eventButton);
    }
  } else {
    divContainer.text(noEventMessage);
    noEventMessage = "";
  }
  section.append(divContainer);
  $(buttonID).append(section);
}

//functions to call weather api
function weatherAPI() {
  weatherUrl();
  var queryURL = weatherUrl();
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(returnWeather);
}

function weatherUrl() {
  queryURL = "https://api.openweathermap.org/data/2.5/weather?";
  queryParams = {
    apikey: "710caaee5eb7962fcebb2ea857da3696"
  };
  queryParams.q = eventCity + ",us";
  queryParams.units = "imperial";
  return queryURL + $.param(queryParams);
}

function returnWeather(response) {
  var section = $("<section>");
  var divContainer = $("<div>");
  section.attr("class", "weatherSection");
  divContainer.attr("class", "container");
  divContainer.text(
    "Current Weather: " +
      response.main.temp +
      ", " +
      response.weather[0].description
  );
  section.append(divContainer);
  $(buttonID).append(section);
}

$(document).ready(function() {
  $(".first-button").on("click", function() {
    $(".animated-icon1").toggleClass("open");
  });
});
// Add event listeners to the submit and delete buttons
$("#submit").on("click", mainFunction);
$(document).on("click", ".flightButton", eventFunction);
