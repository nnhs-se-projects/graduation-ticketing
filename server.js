/**
 * main Javascript file for the application
 *  this file is executed by the Node server
 */

// import the express module, which exports the express function
const express = require("express");
const entry = require("./server/model/entry");
// invoke the express function to create an Express application
const app = express();

// load environment variables from the .env file into process.env
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

// connect to the database
const connectDB = require("./server/database/connection");
connectDB();

// import the express-session module, which is used to manage sessions
const session = require("express-session");
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

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
app.use("/", require("./server/routes/router"));


app.post("/studentTicket", async (req, res) => {

  const code = req.body.accessCode
  const studentData = await entry.find();
  match = false
  studentData.forEach(s => {
    if (s.access_code == code && match != true)
    {
      st = s.first_name + " " + s.last_name
      match = true
      console.log(st)
      res.redirect(`/ticketDisplay/${s._id}`)
    }
  })
  if (!match)
  {
    console.error("student with access code '" + code + "' not found")
  }

})

app.get("/ticketDisplay/:id", async (req, res) => {
  const student = await entry.findById(req.params.id);
  console.log("here");
  res.render('ticket', {student});
});


// start the server on port 8080
app.listen(8080, () => {
  console.log("server is listening on http://localhost:8080");
});
