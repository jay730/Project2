require("dotenv").config();
var express = require("express");
var helmet = require("helmet");

var db = require("./models");

var app = express();
var PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use(helmet());

// Routes
require("./routes/apiRoutes")(app);
require("./routes/htmlRoutes")(app);

var syncOptions = { force: false };

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}
// app.listen(PORT, function(){
//   console.log("listening on port" + PORT);
// });
// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(function() {
  app.listen(PORT, function() {
    console.log(
      "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
      PORT,
<<<<<<< HEAD
      PORT
    );
=======
      PORT);
>>>>>>> 3070b50cf29c9dbf861b96667aaf96a0bc14a8b7
  });
});

module.exports = app;
