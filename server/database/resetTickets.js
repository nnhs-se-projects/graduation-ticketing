const mongoose = require("mongoose");
const entry = require("../model/entry");

const dotenv = require("dotenv");
dotenv.config({ path: "../../.env" });



// Resets all student's tickets to valid

const revalidateTickets = async () => {
  try {
    const con = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected : ${con.connection.host}`);
    const students = await entry.find();
    for (const student of students) {
      for (const ticket of student.tickets) {
        await entry.findOneAndUpdate(
          { "tickets.barcode": ticket.barcode},
          { $set: {"tickets.$.time_scanned": null}},
          { new: true}
        )
      }
    }
  } catch (err) {
    console.log(err);
    process.exit(1);
  } finally {
    mongoose.disconnect();
  }
}

revalidateTickets();