const students = require("../model/students.json");
const fs = require("fs")



students.forEach(student => {
  student.tickets.forEach(ticket => {
    ticket.override_log = "";
  })
})

const jsonString = JSON.stringify(students, null, 2);

console.log(jsonString)

fs.writeFile('../model/students.json', jsonString, (err) => {
    if (err) {
        console.error('Error writing file:', err);
    } else {
        console.log('File saved successfully!');
    }
});