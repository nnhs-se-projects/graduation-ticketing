/**
 * main Javascript file for the application
 *  this file is executed by the Node server
 */

// import the express module, which exports the express function
const express = require("express");
const entry = require("../server/model/entry")
// invoke the express function to create an Express application
const app = express();



const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

const connectDB = require("../server/database/connection");
connectDB();
app.use(express.json());

app.set("view engine", "ejs");

app.use("/css", express.static("assets/css"));
app.use("/img", express.static("assets/img"));
app.use("/js", express.static("assets/js"));

app.get("/", async (req, res) => {
  console.log("path requested: " + req.path);
  res.render("receiver");
});

app.post("/scanned", (req, res) => {
  const barcode = req.body.barcode;
  const time_scanned = req.body.timestamp;
  studentObj = {}
  entry.findOne({ 'tickets.barcode': barcode})
    .then(student => {
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      
      student.tickets.forEach(ticket => {
        if (ticket.barcode == barcode && ticket.time_scanned == null)
          ticket.time_scanned = req.body.time_scanned;
    })

      
      res.json(student)
    })
    .catch(error => {
      console.error('Error searching for student:', error);
    })
  console.log('Received data: ' + barcode + " at " + time_scanned);

})



// start the server on port 8080
app.listen(8000, () => {
  console.log("server is listening on http://localhost:8000");
});
