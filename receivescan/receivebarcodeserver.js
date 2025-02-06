// Import required modules
const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const mongoose = require("mongoose");
const entry = require("../server/model/entry");
const dotenv = require("dotenv");
const fs = require("fs");

// Load environment variables
dotenv.config({ path: "../.env" });

// Connect to the database
const connectDB = require("../server/database/connection");
connectDB();

// Configure the Express application
const app = express();
app.use(express.json());
app.set("view engine", "ejs");
app.use("/css", express.static("css"));

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" }); // Store uploaded files in 'uploads' directory

// Render the main page initially
app.get("/", async (req, res) => {
  console.log("path requested: " + req.path);
  res.render("receiver");
});

// Route to handle file uploads and import names from Excel
app.post("/import", upload.single("excelFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    // Load the uploaded Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0]; // Get the first sheet
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Check if the sheetData is empty
    if (sheetData.length === 0) {
      throw new Error("The uploaded Excel file is empty.");
    }

    // Array to keep track of processing results
    const results = {
      successful: [],
      failed: [],
    };

    // Process each row in the Excel file
    for (const row of sheetData) {
      try {
        // Extract fields from the row
        const { ID_Num, First_name, Last_Name, num_of_tickets } = row;

        // Validate required fields
        if (!ID_Num || !First_name || !Last_Name || isNaN(num_of_tickets)) {
          throw new Error("Missing or invalid data in row.");
        }

        // Generate the tickets
        const tickets = [];
        for (let i = 0; i < num_of_tickets; i++) {
          tickets.push({
            barcode: `${ID_Num}${i + 100000}`, // Generate a unique barcode based on the student's ID and ticket number
            time_scanned: null, // Time scanned is initially null
            access_code: `${Math.random()
              .toString(36)
              .substring(2, 8)
              .toUpperCase()}`, // Generate a random access code
            override_log: "", // Empty override log initially
          });
        }

        // Create a new entry in the database with the tickets
        await entry.create({
          id: ID_Num,
          first_name: First_name,
          last_name: Last_Name,
          num_tickets: Number(num_of_tickets), // Ensure this is a number
          tickets: tickets, // Add the generated tickets here
        });

        // Log success
        console.log(`Successfully added: ${First_name} ${Last_Name}`);
        results.successful.push(`${First_name} ${Last_Name}`);
      } catch (err) {
        // Log failure for this row
        console.error(
          `Failed to create entry for ${First_name} ${Last_Name}:`,
          err.message
        );
        results.failed.push({ row, error: err.message });
      }
    }

    // Respond to the client with summary of results
    res.json({
      message: "Excel file processed.",
      summary: results,
    });
  } catch (error) {
    console.error("Error processing file:", error.message);
    res.status(500).send(`Failed to process the file: ${error.message}`);
  } finally {
    // Delete the uploaded file after processing
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting file:", err);
    });
  }
});

// Render the import names page
app.get("/importNames", (req, res) => {
  console.log("Rendering importNames page");
  res.render("importNames");
});

// Handle the receiving of scan information
app.post("/scanned", (req, res) => {
  const barcode = req.body.barcode; // Grab the barcode scanned
  const curr_time_scanned = req.body.timestamp; // Grab the time it was scanned

  let studentObj = {}; // Initialize object to pass back to the client

  entry
    .findOne({ "tickets.barcode": barcode }) // Query for the student with the exact barcode that was scanned
    .then((student) => {
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Keep track of scan validity and which ticket was scanned
      let ticket_id = "";
      let validScan = true;

      // Parameters for updating the timestamp of the ticket in the database
      const updateTimestamp = {
        $set: {
          "tickets.$.time_scanned": curr_time_scanned,
        },
      };

      student.tickets.forEach((ticket) => {
        // Find which of the student's multiple tickets the barcode corresponds to
        if (ticket.barcode == barcode) {
          // Check if the ticket has been scanned before
          if (ticket.time_scanned == null) {
            ticket_id = ticket._id;
          } else {
            // If the time_scanned has a non-null value, it has been scanned before and is invalid
            validScan = false;
          }
        }
      });

      // If the scan was invalid, just pass back the student information and the validity and do not update the database
      if (ticket_id == "") {
        res.json({ studObj: student, validity: validScan });
        return;
      }

      // If the scan was valid, update the database
      // Query by the exact ticket's id.
      entry
        .updateOne({ "tickets._id": ticket_id }, updateTimestamp)
        .then((result) => {
          console.log("Update successful", result);
        })
        .catch((error) => {
          console.log(error);
          console.error("Error updating document:", error);
        });

      // Pass the information about the student and if the scan was valid back to the client.
      res.json({ studObj: student, validity: validScan });
    })
    .catch((error) => {
      console.error("Error searching for student:", error);
    });
});

// Handle manual ticket override logs
app.post("/override", (req, res) => {
  const overrideString = req.body.log;
  const barcode = req.body.barcode;
  console.log(overrideString + " " + barcode);

  entry.findOne({ "tickets.barcode": barcode }).then((student) => {
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    let ticket_id = "";
    let currentLog = "";
    student.tickets.forEach((ticket) => {
      // Find which of the student's multiple tickets the barcode corresponds to
      if (ticket.barcode == barcode) {
        ticket_id = ticket._id;
        currentLog = ticket.override_log;
      }
    });

    const updateLog = {
      $set: {
        "tickets.$.override_log": currentLog + overrideString,
        "tickets.$.time_scanned": null,
      },
    };
    entry
      .updateOne({ "tickets._id": ticket_id }, updateLog)
      .then((result) => {
        console.log("Update successful", result);
      })
      .catch((error) => {
        console.log(error);
        console.error("Error updating document:", error);
      });
  });
});

// Start the server on the specified port
app.listen(process.env.RECEIVER_PORT, () => {
  console.log(
    "Server is listening on http://localhost:" + process.env.RECEIVER_PORT
  );
});
