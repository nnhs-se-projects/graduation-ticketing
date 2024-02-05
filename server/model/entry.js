/**
 * schema for a journal entry
 */

const mongoose = require("mongoose");

const schema = new mongoose.Schema({
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
  access_code: {
    type: String,
    required: true,
  },
  num_tickets: {
    type: String,
    required: true,
  },
});

const Entry = mongoose.model("Entry", schema);

module.exports = Entry;
