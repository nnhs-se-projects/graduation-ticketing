const fs = require('fs')
const { createObjectCsvWriter } = require('csv-writer');

const jsonFilePath = '../../server/model/students.json'

const students = fs.readFileSync(jsonFilePath, 'utf-8')

const studentData = JSON.parse(students)

const flattenedStudents = studentData.map(student => {
    return student.tickets.map(ticket => {
        return {
            first_name: student.first_name,
            last_name: student.last_name,
            id: student.id,
            access_code: ticket.access_code
        };
    });
}).reduce((acc, val) => acc.concat(val), []);

const csvHeader = [
  { id: 'first_name', title: 'First Name' },
  { id: 'last_name', title: 'Last Name' },
  { id: 'id', title: 'ID Number' },
  { id: 'access_code', title: 'Access Code' }

]

const csvWriter = createObjectCsvWriter({
  path: "studentAccessCodes.csv",
  header: csvHeader
})

csvWriter.writeRecords(flattenedStudents)
    .then(() => console.log('CSV file has been written successfully'))
    .catch(err => console.error('Error writing CSV file:', err));