const csvtojson = require("csvtojson")
const generateAccessCode = require("./accessCodes")

const fs = require("fs")

const csvFilePath = "StudentData.csv"
const jsonFilePath = "../../server/model/students.json"
const csvOptions = {
  headers: ['id', 'last_name', 'first_name', 'access_code'], // Replace with your desired field names
};


csvtojson(csvOptions).fromFile(csvFilePath).then((obj) => {
  obj.forEach((entry) => {
      entry.access_code = generateAccessCode();
      entry.numTickets = 2;
    });
  const jsonString = JSON.stringify(obj, null, 2);
  fs.writeFileSync(jsonFilePath, jsonString);
})

