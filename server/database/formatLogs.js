const mongoose = require("mongoose");
const entry = require("../model/entry");

const dotenv = require("dotenv");
dotenv.config({ path: "../../.env" });

const fs = require("fs")


const filePath = 'overrideLog.txt'

// Organizes all ticket logs

const revalidateTickets = async () => {
  let log = "";
  try {
    const con = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected : ${con.connection.host}`);
    const students = await entry.find();
    for (const student of students) {
      for (const ticket of student.tickets) {
        if (ticket.override_log !== "")
        {
          log += student.first_name + " " + student.last_name + ", " + student.id + ", ticket (" + ticket.access_code + ") " + ticket.override_log + "\n"
        }
      }
    }

    
    fs.writeFile(filePath, log, { flag: 'w' }, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
        return;
      }
      console.log('Data has been written to', filePath);
    })
  } catch (err) {
    console.log(err);
    process.exit(1);
  } finally {
    mongoose.disconnect();
  }
}

revalidateTickets();