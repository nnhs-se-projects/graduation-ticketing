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

app.use("/", require("./server/routes/router"));


// Handle when the user submits an access code to the main page
app.post("/studentTicket", async (req, res) => {

  const code = req.body.accessCode
  const studentData = await entry.find();
  match = false
  //  Loop through each student in the database
  studentData.forEach(s => {
    // Loop through each student's tickets
    s.tickets.forEach(t => {
      if (t.access_code == code && match != true)
          {
            st = s.first_name + " " + s.last_name
            match = true
            // If it matches, redirect to the corresponding ticket page
            res.redirect(`/ticketDisplay/${t._id}`)
          }
    })
  })
  if (!match)
  {
    console.error("student with access code '" + code + "' not found")
  }

})

//  Handle each unique ticket's page
app.get("/ticketDisplay/:ticketId", async (req, res) => {
  const { ticketId } = req.params;
  // Find the student object based on the ticket's id
  const student = await entry.findOne({ "tickets._id": ticketId });
  // Find that ticket object based on the ticket's id
  const ticket = student.tickets.find(ticket => ticket._id.toString() === ticketId);

  // Pass the ticket object and student object to the client and render the ticket page
  res.render('ticket', {ticket, student});
});


// start the server on port 8080
app.listen(dotenv.TICKET_PORT, () => {
  console.log("server is listening on http://localhost:8080");
});
