/**
 * The exported function establishes a connection to the specified MongoDB database via the Mongoose module.
 */

const mongoose = require("mongoose");
const students = require("../model/students.json");
const entry = require("../model/entry");

const dotenv = require("dotenv");
dotenv.config({ path: "../../.env" });



const connectDB = async () => {
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
};

connectDB();

module.exports = connectDB;
