/**
 * main Javascript file for the application
 *  this file is executed by the Node server
 */

// import the express module, which exports the express function
const express = require("express");
const entry = require("../server/model/entry")
// invoke the express function to create an Express application
const app = express();

// Load in .env variables
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

// Connect to the database
const connectDB = require("../server/database/connection");
connectDB();

// Configure project
app.use(express.json());
app.set("view engine", "ejs");
app.use("/css", express.static("css"));


// Render the main page initially
app.get("/", async (req, res) => {
  console.log("path requested: " + req.path);
  res.render("receiver");
});

// Handle the receiving of the scan information
app.post("/scanned", (req, res) => {
  const barcode = req.body.barcode;   // Grab the barcode scanned
  const curr_time_scanned = req.body.timestamp;   // Grab the time it was scanned

  studentObj = {}   // initialize object to pass back to the client

  entry.findOne({ 'tickets.barcode': barcode})  //  Query for the student with the exact barcode that was scanned
    .then(student => {
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      //  Keep track of scan validity and which ticket was scanned
      let ticket_id = "";   
      let validScan = true

      //  Parameters for updating the timestamp of the ticket in the database
      const updateTimestamp = {
        $set : {
          'tickets.$.time_scanned' : curr_time_scanned
        }
      }

      student.tickets.forEach(ticket => {
        //  Find which of the student's multiple tickets the barcode corresponds to
        if (ticket.barcode == barcode)
        {
          // Check if the ticket has been scanned before
          if (ticket.time_scanned == null)
          {
            ticket_id = ticket._id;
          }
          else
          {
            // If the time_scanned has a non-null value, it has been scanned before and is invalid
            validScan = false;
          }
        }
    })
    
    //  If the scan was invalid, just pass back the student information and the validity and do not update the database
    if (ticket_id == "")
    {
      res.json({studObj: student, validity: validScan})
      return
    }
    
    //  If the scan was valid, update the database
    //  Query by the exact ticket's id.
    entry.updateOne({'tickets._id' : ticket_id}, updateTimestamp).then(result => {
      console.log("update successful", result)
    }).catch(error => {
      console.log(error)
      console.error('Error updating document:', error);
    })

      //  Pass the information about the student and if the scan was valid back to the client.
      res.json({studObj: student, validity: validScan})
    })
    .catch(error => {
      console.error('Error searching for student:', error);
    })

})

// start the server on port 8080
app.listen(dotenv.RECEIVER_PORT, () => {
  console.log("server is listening on http://localhost:8000");
});