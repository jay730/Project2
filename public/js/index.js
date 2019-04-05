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
var noQuoteMessage = "";
var noEventMessage = "";
var buttonID;
var eventCity;
var inputValid = true;
var originIata;
var destinationIata;
var signIn = false;
var ticketButton;
var $body = $("body");
var br = $("<br>");

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
  //price = $("#slider-format").val();
  price = inputFormat.value
    .split(")")
    .pop()
    .trim();
}
//Slider for max budget input

var sliderFormat = document.getElementById("slider-format");

noUiSlider.create(sliderFormat, {
  start: [100],
  step: 1,
  range: {
    min: [50],
    max: [1000]
  },
  ariaFormat: wNumb({
    decimals: 3
  }),
  format: wNumb({
    decimals: 2,
    thousand: ".",
    prefix: " ($) "
  })
});
var inputFormat = document.getElementById("input-format");

sliderFormat.noUiSlider.on("update", function(values, handle) {
  inputFormat.value = values[handle];
});

inputFormat.addEventListener("change", function() {
  sliderFormat.noUiSlider.set(this.value);
});

function inputValidation() {
  if (origin === null) {
    $("#results").text("Please select departing city!");
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
      toDT: toDT,
      price: price
    }
  }).then(returnFlights);
}

function returnFlights(selectedFlights) {
  var $section = $("<section>");
  var $divContainer = $("<div>");
  $divContainer.attr("class", "container");

  if (selectedFlights.length === 0) {
    noQuoteMessage =
      "No quote is available at this time! You might want to increase the price.";
  } else {
    for (var i = 0; i < selectedFlights.length; i++) {
      if (
        selectedFlights[i].destinationCity !== undefined &&
        selectedFlights[i].destinationCity !== ""
      ) {
        var $button = $("<button>");
        $button.text(
          selectedFlights[i].destinationCity + ", $" + selectedFlights[i].price
        );
        $button.addClass("flightButton btn w-100 mx-auto");
        $button.css("display", "block");
        $button.css("background", "white");
        $button.css("color", "black");
        $button.css("height", "200px");
        $button.css("margin", "15px");
        $button.attr("id", i);
        $button.attr("data-eventCity", selectedFlights[i].destinationCity);
        $button.attr(
          "data-destinationIata",
          selectedFlights[i].destinationIata
        );
        $button.attr("data-originIata", selectedFlights[i].originIata);
        $divContainer.append($button);
      }
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
  selectedEvents = [];
  eventCity = $(this).attr("data-eventCity");
  buttonID = "#" + $(this).attr("id");
  $(".flightButton").attr("disabled", false);
  $(this).attr("disabled", true);
  destinationIata = $(this).attr("data-destinationIata");
  originIata = $(this).attr("data-originIata");
  bookingAPI();
}

function eventAPI() {
  $.ajax("/api/eventSearch", {
    type: "GET",
    data: {
      city: eventCity,
      startDateTime: startDateTime,
      endDateTime: endDateTime
    }
  }).then(filterEvents);
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
}

function returnEvents() {
  var section = $("<section>");
  var divContainer = $("<div>");
  section.addClass("eventSection");
  divContainer.addClass("container btn-group-vertical w-75 mx-auto");
  if (selectedEvents.length !== 0) {
    for (var i = 0; i < selectedEvents.length; i++) {
      var eventButton = $("<button>");
      var eventLink = $("<a>");
      eventLink.text(selectedEvents[i].eventName);
      eventLink.attr("href", selectedEvents[i].eventURL);
      eventLink.attr("target", "_blank");
      eventLink.addClass("text-dark");
      eventButton.addClass("btn btn-primary btn-sm");
      eventButton.append(eventLink);
      divContainer.append(eventButton);
    }
  } else {
    divContainer.text(noEventMessage);
    noEventMessage = "";
  }
  divContainer.append(ticketButton);
  if (signIn) {
    addTripButton = $("<button>");
    addTripButton.text("Add Trip");
    addTripButton.addClass("btn addTrip btn-secondary btn-sm text-dark");
    divContainer.append(addTripButton);
  }
  section.append(divContainer);
  $(buttonID).append(section);
  $(buttonID).removeClass("btn");
}

function bookingAPI() {
  $.ajax("/api/flightTicketBooking", {
    type: "GET",
    data: {
      originIata: originIata,
      destinationIata: destinationIata,
      outboundDate: fromDT,
      inboundDate: toDT
    }
  }).then(returnBooking);
}

function returnBooking(response) {
  ticketButton = $("<button>");
  var ticketLink = $("<a>");
  ticketLink.text("Take Me Here!");
  ticketLink.attr("href", response.agentUrl);
  ticketLink.attr("target", "_blank");
  ticketLink.addClass("text-dark");
  ticketButton.append(ticketLink);
  ticketButton.addClass("btn btn-success btn-sm");
  eventAPI();
}

function onSignIn(googleUser) {
  var idToken = googleUser.getAuthResponse().id_token;
  $.ajax("/tokensignin", {
    type: "POST",
    data: {
      idToken: idToken
    }
  }).then(checkSignIn);
}

function signOut() {
  $("#signIn").removeClass("d-none");
  $("#signOut").addClass("d-none");
  $("#trip").addClass("d-none");
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function() {
    console.log("User signed out.");
  });
}

function checkSignIn(signInStatus) {
  if (signInStatus) {
    signIn = true;
    $("#signIn").addClass("d-none");
    $("#signOut").removeClass("d-none");
    $("#trip").removeClass("d-none");
  }
}

function addTripFunction() {
  $.ajax("/addTrip", {
    type: "POST",
    data: {
      originIata: originIata,
      destinationIata: destinationIata,
      fromDT: fromDT,
      toDT: toDT
    }
  }).then(addTripResult);
}

function addTripResult(response) {
  if (response) {
    addTripButton.text("Trip Added");
    addTripButton.attr("disabled", true);
    addTripButton.removeClass("addTrip");
  } else {
    addTripButton.text("Failed");
    addTripButton.attr("disabled", true);
    addTripButton.removeClass("addTrip");
  }
}

$(document).ready(function() {
  $(".first-button").on("click", function() {
    $(".animated-icon1").toggleClass("open");
  });
});
// Add event listeners to the submit and delete buttons
$("#submit").on("click", mainFunction);
$(document).on("click", ".flightButton", eventFunction);
$(document).on("click", ".addTrip", addTripFunction);

$(document).on({
  ajaxStart: function() {
    $body.addClass("loading");
  },
  ajaxStop: function() {
    $body.removeClass("loading");
  }
});
