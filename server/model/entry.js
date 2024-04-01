/**
 * schema for a journal entry
 */

const mongoose = require("mongoose");


// Each ticket has a 12 digit unique barcode, a date object for when it was scanned, and a unique 6 character access code
const ticketSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true,
  },
  time_scanned: {
    type: Date,
    default: null,
  },
  access_code: {
    type: String,
    required: true,
  }
})


// Each student object has their student id, their first and last name, the number of tickets they have, and an array of ticket objects.
const studentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  num_tickets: {
    type: String,
    required: true,
  },
  tickets: [ticketSchema]
});

const Entry = mongoose.model("Entry", studentSchema);

module.exports = Entry;
