/**
 * main Javascript file for the application
 *  this file is executed by the Node server
 */

// import the express module, which exports the express function
const express = require("express");
// invoke the express function to create an Express application
const app = express();

// import the express-session module, which is used to manage sessions
// const session = require("express-session");
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//   })
// );

const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

// add middleware to handle JSON in HTTP request bodies (used with POST commands)
app.use(express.json());

// set the template engine to EJS, which generates HTML with embedded JavaScript
app.set("view engine", "ejs");

// load assets
app.use("/css", express.static("assets/css"));
app.use("/img", express.static("assets/img"));
app.use("/js", express.static("assets/js"));


// to keep this file manageable, we will move the routes to a separate file
//  the exported router object is an example of middleware
app.get("/", async (req, res) => {
  // the req parameter references the HTTP request object, which has a number
  //  of properties
  console.log("path requested: " + req.path);
  // the res parameter references the HTTP response object
  res.render("receiver");
});


// start the server on port 8080
app.listen(8000, () => {
  console.log("server is listening on http://localhost:8000");
});
