/**
 * The exported function establishes a connection to the specified MongoDB database via the Mongoose module.
 */

const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config({ path: "../../.env" });



const connectDB = async () => {
  try {
    const con = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected : ${con.connection.host}`);
    
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

connectDB();

module.exports = connectDB;

