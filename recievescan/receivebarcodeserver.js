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
  console.log("Path requested: " + req.path);
  res.render("receiver");
});

// Helper function to generate a random numeric string of a given length
const generateRandomNumber = (length) => {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
};

// Route to handle file uploads and import names from Excel
app.post("/import", upload.single("excelFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (sheetData.length === 0) {
      throw new Error("The uploaded Excel file is empty.");
    }

    const results = {
      successful: [],
      failed: [],
    };

    for (const row of sheetData) {
      try {
        const { ID_Num, First_name, Last_Name, num_of_tickets } = row;

        if (!ID_Num || !First_name || !Last_Name || isNaN(num_of_tickets)) {
          throw new Error("Missing or invalid data in row.");
        }

        const tickets = [];
        for (let i = 0; i < num_of_tickets; i++) {
          tickets.push({
            barcode: generateRandomNumber(12), // Generate a random 12-digit barcode
            time_scanned: null,
            access_code: generateRandomNumber(6), // Generate a random 6-digit access code
            override_log: "",
          });
        }

        await entry.create({
          id: ID_Num,
          first_name: First_name,
          last_name: Last_Name,
          num_tickets: Number(num_of_tickets),
          tickets: tickets,
        });

        results.successful.push(`${First_name} ${Last_Name}`);
      } catch (err) {
        results.failed.push({ row, error: err.message });
      }
    }

    res.json({ message: "Excel file processed.", summary: results });
  } catch (error) {
    res.status(500).send(`Failed to process the file: ${error.message}`);
  } finally {
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting file:", err);
    });
  }
});

// Handle receiving scan information
app.post("/scanned", (req, res) => {
  const barcode = req.body.barcode;
  const curr_time_scanned = req.body.timestamp;

  entry
    .findOne({ "tickets.barcode": barcode })
    .then((student) => {
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      let validScan = true;
      let ticket_id = "";

      student.tickets.forEach((ticket) => {
        if (ticket.barcode === barcode) {
          if (ticket.time_scanned === null) {
            ticket_id = ticket._id;
          } else {
            validScan = false;
          }
        }
      });

      if (ticket_id === "") {
        return res.json({ studObj: student, validity: validScan });
      }

      const updateTimestamp = {
        $set: { "tickets.$.time_scanned": curr_time_scanned },
      };

      entry
        .updateOne({ "tickets._id": ticket_id }, updateTimestamp)
        .then(() => console.log("Update successful"))
        .catch((error) => console.error("Error updating document:", error));

      res.json({ studObj: student, validity: validScan });
    })
    .catch((error) => console.error("Error searching for student:", error));
});

// Handle manual ticket override logs
app.post("/override", (req, res) => {
  const overrideString = req.body.log;
  const barcode = req.body.barcode;

  entry.findOne({ "tickets.barcode": barcode }).then((student) => {
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    let ticket_id = "";
    let currentLog = "";

    student.tickets.forEach((ticket) => {
      if (ticket.barcode === barcode) {
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
      .then(() => console.log("Override update successful"))
      .catch((error) => console.error("Error updating document:", error));
  });
});

// Start the server
app.listen(process.env.RECEIVER_PORT, () => {
  console.log(
    "Server is listening on http://localhost:" + process.env.RECEIVER_PORT
  );
});
