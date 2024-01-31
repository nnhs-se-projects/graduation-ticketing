const express = require("express");
const route = express.Router();
const Entry = require("../model/entry");

// easy way to assign static data (e.g., array of strings) to a variable
const students = require("../model/students.json");

// pass a path (e.g., "/") and callback function to the get method
//  when the client makes an HTTP GET request to the specified path,
//  the callback function is executed
route.get("/", async (req, res) => {
  // the req parameter references the HTTP request object, which has a number
  //  of properties
  console.log("path requested: " + req.path);

  // const entries = await Entry.find();

  // // convert MongoDB objects to objects formatted for the EJS template
  // const formattedEntries = entries.map((entry) => {
  //   return {
  //     id: entry._id,
  //     first_name: entry._first_name,
  //     last_name: entry._last_name,
  //     access_code: entry._access_code,
  //     num_tickets: entry._num_tickets
  //   };
  // });

  // the res parameter references the HTTP response object
  res.render("index");
});


// route.post("/studentTicket", async (req, res) => {
  
//     const code = req.body
//     console.log(req)
  
  
  
//   // const entry = new Entry({
//   //   id: entry._id,
//   //   first_name: entry._first_name,
//   //   last_name: entry._last_name,
//   //   access_code: entry._access_code,
//   //   num_tickets: entry._num_tickets 
//   // });
//   // await entry.save();

//   res.status(201).end();
// });

// route.get("/editEntry/:id", async (req, res) => {
//   const entry = await Entry.findById(req.params.id);
//   console.log(entry);
//   res.send(entry);
// });

// delegate all authentication to the auth.js router
route.use("/auth", require("./auth"));

module.exports = route;
