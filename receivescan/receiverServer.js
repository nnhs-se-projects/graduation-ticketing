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
app.use("/assets", express.static("../assets"));

const path = require("path");

// Set up EJS as the view engine
app.set("views", path.join(__dirname, "views"));

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" }); // Store uploaded files in 'uploads' directory

// Configure sessions
const session = require("express-session");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.get("/loginPage", (req, res) => {
  res.render("loginPage");
});

// Handle login requests
app.post("/login", (req, res) => {
  const { password } = req.body;
  console.log("Password received:", password); // DEBUG

  if (password === process.env.USERPASSWORD) {
    req.session.user = "user";
    console.log("Session after setting user:", req.session); // DEBUG
    res.sendStatus(200);
  } else if (password === process.env.ADMINPASSWORD) {
    req.session.user = "admin";
    console.log("Session after setting admin:", req.session); // DEBUG
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

// Any page will redirect to login page unless user is logged in
app.use((req, res, next) => {
  console.log("Session:", req.session.user); // DEBUG
  if (!req.session.user) {
    return res.redirect("/loginPage");
  }
  next();
});

// Render the main page initially
app.get("/", async (req, res) => {
  console.log("path requested: " + req.path);
  res.render("receiver");
});

// Route to render the exportNames.ejs file
app.get("/exportNames", (req, res) => {
  res.render("exportNames");
});

app.get("/helpPage", (req, res) => {
  res.render("helpPage");
});

app.get("/dummyTicket1", (req, res) => {
  const testId = req.query.test;
  res.render("dummyTicket1", { testId });
});

app.get("/dummyTicket2", (req, res) => {
  const testId = req.query.test;
  res.render("dummyTicket2", { testId });
});

app.post("/import", upload.single("excelFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  // Helper function to add two dummy tickets with fixed access codes
  const insertDummyTickets = async () => {
    const dummyEntries = [
      {
        id: "DUMMY1",
        first_name: "Dummy",
        last_name: "TicketOne",
        num_tickets: 1,
        tickets: [
          {
            barcode: "DUMMY1000001",
            time_scanned: null,
            access_code: "51ZSRL",
            override_log: "",
          },
        ],
      },
      {
        id: "DUMMY2",
        first_name: "Dummy",
        last_name: "TicketTwo",
        num_tickets: 1,
        tickets: [
          {
            barcode: "DUMMY2000001",
            time_scanned: null,
            access_code: "AX9B9C",
            override_log: "",
          },
        ],
      },
    ];

    try {
      await entry.insertMany(dummyEntries);
      console.log("✅ Dummy tickets inserted.");
    } catch (err) {
      console.error("❌ Error inserting dummy tickets:", err);
    }
  };

  try {
    // Fetch all current entries before importing new data
    const existingEntries = await entry.find({});

    // Save a backup as a JSON file (if there's existing data)
    if (existingEntries.length > 0) {
      fs.writeFileSync("backup.json", JSON.stringify(existingEntries, null, 2));
      console.log("Backup created before import.");
    }

    // Drop the entire database (Removes ALL collections)
    await mongoose.connection.dropDatabase();
    console.log("Database dropped before import.");

    // ✅ Insert two permanent dummy tickets
    await insertDummyTickets();

    // Load the uploaded Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (sheetData.length === 0) {
      throw new Error("The uploaded Excel file is empty.");
    }

    const results = { successful: [], failed: [] };

    for (const row of sheetData) {
      try {
        const { ID_Num, First_name, Last_Name, num_of_tickets } = row;
        if (!ID_Num || !First_name || !Last_Name || isNaN(num_of_tickets)) {
          throw new Error("Missing or invalid data in row.");
        }

        const tickets = [];
        for (let i = 0; i < num_of_tickets; i++) {
          tickets.push({
            barcode: `${ID_Num}${i + 1000000}`,
            time_scanned: null,
            access_code: `${Math.random()
              .toString(36)
              .substring(2, 8)
              .toUpperCase()}`,
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

        console.log(`Successfully added: ${First_name} ${Last_Name}`);
        results.successful.push(`${First_name} ${Last_Name}`);
      } catch (err) {
        console.error(
          `Failed to create entry for ${row.First_name} ${row.Last_Name}:`,
          err.message
        );
        results.failed.push({ row, error: err.message });
      }
    }

    // Respond to the client with summary of results
    res.json({
      status: "success",
      message: "Excel file processed.",
      results: results,
    });
  } catch (error) {
    console.error("Error processing file:", error.message);

    // If an error occurs, attempt to restore from backup
    if (fs.existsSync("backup.json")) {
      console.log("Restoring database from backup due to import failure...");
      const backupData = JSON.parse(fs.readFileSync("backup.json"));

      await entry.insertMany(backupData);
      console.log("Database successfully restored from backup.");
      res.status(500).json({
        message: "Import failed. Database reverted to previous state.",
      });
    } else {
      res.status(500).send(`Failed to process the file: ${error.message}`);
    }
  } finally {
    // Delete the uploaded file after processing
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting file:", err);
    });
  }
});

// POST route for exporting data based on filters
app.post("/export", async (req, res) => {
  try {
    // Extract filter parameters from the request body
    const { first_name, last_name, barcode } = req.body;

    // Build query object based on filters
    let query = {};
    if (first_name) query["first_name"] = first_name;
    if (last_name) query["last_name"] = last_name;
    if (barcode) query["tickets.barcode"] = barcode;

    // Fetch filtered student data from the database
    const students = await entry.find(query);

    // Flatten the tickets and structure the data for export
    const exportData = students
      .map((student) => {
        return student.tickets.map((ticket) => ({
          ID_Num: student.id,
          First_Name: student.first_name,
          Last_Name: student.last_name,
          Num_Tickets: student.num_tickets,
          Barcode: ticket.barcode,
          Access_Code: ticket.access_code,
          Time_Scanned: ticket.time_scanned || "Not Scanned",
          Override_Log: ticket.override_log || "None",
        }));
      })
      .flat();

    // Create an Excel file
    const ws = xlsx.utils.json_to_sheet(exportData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Student Data");

    // Send the Excel file as response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="students_data.xlsx"'
    );
    const buffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });
    res.send(buffer);
  } catch (error) {
    console.error("Error exporting student data:", error);
    res.status(500).send("Error exporting data.");
  }
});

// Render the import names page
app.get("/importNames", (req, res) => {
  console.log("Rendering importNames page");
  res.render("importNames");
});

app.post("/revertDatabase", async (req, res) => {
  try {
    if (!fs.existsSync("backup.json")) {
      return res
        .status(400)
        .json({ message: "No backup available to revert." });
    }

    // Read the backup file
    const backupData = JSON.parse(fs.readFileSync("backup.json"));

    // Drop the database again before restoring
    await mongoose.connection.dropDatabase();

    // Restore from backup
    await entry.insertMany(backupData);

    res.json({ message: "Database reverted to previous state." });
  } catch (error) {
    console.error("Revert failed:", error);
    res.status(500).json({ message: "Revert failed." });
  }
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
