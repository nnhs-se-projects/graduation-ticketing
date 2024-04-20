# Graduation Ticketing App
OVERVIEW: Generate unique barcodes (two per student unless otherwise specified) which will be one-time usage. The barcodes should read red or green based on usage, and the scanner should receive the name of the student and the time that the barcode was scanned. The student should be able to insert their access codes, and then see their name followed by their two tickets.

## Scanner Set-Up
To Scan: The barcode scanner must have ENTER as its suffix when scanning to function smoothly. To do this, refer to the Zebra DS9308 barcode scanner manual. On page 90, scan "Scan Suffix 1," then go to page 441 and scan "7," then "0," then "1," then "3." 7013 corresponds to enter, and if done as listed above, enter should be added as a suffix to scans. 


Running parent view and scanner receiving view:

## Parent View
- In main directory terminal, run 
```
node server.js
```

## Receiver view
- In main directory terminal, navigate to recievescan directory
```
cd recievescan
```
- Run server from receivebarcodeserver.js
```
node receivebarcodeserver.js
```

## Parent Instructions

- Navigate to the ticket page, https://gradticketdev.nnhsse.org
- Enter in your access code and press submit (6 characters of uppercase letters and number)
- Verify that the name of your student and their id number are correct
- Scan the barcode at the volunteer's scanner (you cannot scan this ticket again afterwards)

## Volunteer Instructions

- Navigate to the ticket scanning page, https://gradticketadmindev.nnhsse.org/
- Scan the attendee's ticket, you will see the validity of their scan and their student's information
- Continue scanning
# Troubleshooting

- If a ticket doesn't scan, refresh the page
- To prevent issues, do not press any keyboard inputs (if you do, just refresh the page)
- In any conflicts with attendees, all invalid scans will display the validity of any other tickets the student has (their access code, and the time it was last scanned)