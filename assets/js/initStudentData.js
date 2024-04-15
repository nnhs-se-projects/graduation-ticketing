const csvtojson = require("csvtojson")
const generateAccessCode = require("./accessCodes")


const fs = require("fs")

const csvFilePath = "StudentData.csv"
const jsonFilePath = "../../server/model/students.json"
const csvOptions = {
  headers: ['id', 'last_name', 'first_name', 'num_tickets', 'tickets'], // Replace with your desired field names
};

function generateRandomBarcode() {
  var randomNumber = Math.floor(Math.random() * 1000000000000); // Random number between 0 and 999,999,999,999
  var barcodeValue = randomNumber.toString().padStart(12, '0'); // Ensure 12 digits by padding with leading zeros if necessary
  return barcodeValue;
}


csvtojson(csvOptions).fromFile(csvFilePath).then((obj) => {
  obj.forEach((entry) => {
      entry.tickets = [];
      for (let i = 0; i < entry.num_tickets; i++)
      {
        var code = generateRandomBarcode()
        var accesscode = generateAccessCode();
        entry.tickets.push({
          "barcode" : code,
          "access_code" : accesscode,
          "time_scanned" : null
        })

      }
    });
  const jsonString = JSON.stringify(obj, null, 2);
  fs.writeFileSync(jsonFilePath, jsonString);
})

