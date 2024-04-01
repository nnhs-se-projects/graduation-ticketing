
const mongoose = require("mongoose");
const students = require("../model/students.json");
const entry = require("../model/entry");

const dotenv = require("dotenv");
dotenv.config({ path: "../../.env" });



// Populates the database based on the values in the students.json file
// (Run only once if resetting the database, but make sure to drop the collection and remake it first)

const populateDB = async () => {
  try {
    const con = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected : ${con.connection.host}`);
    students.forEach(student => {
      entry.create(student)
    })
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

populateDB();