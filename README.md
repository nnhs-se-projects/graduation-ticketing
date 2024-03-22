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

