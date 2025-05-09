# Graduation Ticketing App

OVERVIEW: The Graduation Ticketing App is an application to be used for Naperville North's Graduation Ceremony. However, this project is only used under special circumstances such as rain, storms, or any circumstances which prevent Naperville North from hosting an outdoor graduation. Since an outdoor graduation will not have a limit on the number of guests a student can bring (i.e. there are no "tickets" for each student), the Graduation Ticketing App is rendered useless. However, if the Graduation Ceremony is deemed unfit to be hosted outside, the Graduation Ticketing App will be used because limited seatings means there are limits on the number of guests each student can bring.

Prior to the Graduation Ceremony date, students will receive access codes (two per student unless otherwise specified) to distribute to the guests they are bringing in. Each "outside" guest must input their access codes into the website https://gradticketdev.nnhsse.org to receive their ticket information which will contain the associated student's name and id number. Additionally, they will receive their barcode upon entering the access code. These barcodes are one-time usage. Once the barcodes are scanned at the ceremony, the administrator will see whether it is a valid or invalid scan.

The person scanning the tickets will have more options. If the ticket is invalid, they can choose to override it and make it valid. They will also have access to a log of all tickets, valid and invalid, and all invalid tickets will include the time last scanned. This lets the scanner quickly resolve issues with parents when an error occurs.

The admin user will have access to the entire site. They will be able to import a spreadsheet of names to update the database prior to graduation day, and they can also download the list of names as a spreadsheet. In case a mistake is made when importing, there will be an option to revert the last import. For testing purposes, inside the help page are two "dummy" tickets which don't belong to a student.

Anyone can access the help page, which should have most of the information in this document.

## Project Architecture

There are two main web servers and clients being ran:

Ticket server/client:

- Meant for parents to access their tickets
- Takes the access code a parent has and queries it with the database to get the ticket information
- Dynamically displays the ticket information and the actual barcode
- Separate web pages for each ticket (the url is based on the unique MongoDB object ID)

Receiving server/client:

- Meant for volunteers to scan tickets
- Scans the barcode on the client and sends the code to the server
- Server queries the same database for which ticket was scanned and sends that information back to the client
- Takes the ticket information and displays the validity, timestamp, and student information of the scan
- Sends information back to the server and updates the database based on the scan (updates time_scanned)
- Overrides invalid tickets and appends to the ticket's override_log

#### NOTE: https://gradticketdev.nnhsse.org/ and https://gradticketadmindev.nnhsse.org/ pulls from this Github's main every couple of minutes

## Data Schema

There are two main objects: Student and Ticket

Each Ticket has the following attributes:

- barcode: a 12 digit random code
- access_code: 6 random characters of letters and numbers
- time_scanned: default null, is updated to the current timestamp when scanned
- override_log: default empty string, a set log will be appended to the string when a ticket is overridden

Each Student has the following attributes:

- first_name: Student's first name
- last_name: Student's last name
- id: Student's NNHS ID number
- num_tickets: the number of tickets the student gets
- tickets: an array of the ticket objects a student has

## Remaining User Stories

We have basically finished all of what Mrs. Kallstrand and Mrs. Baumgartner (our product owners) asked us to do. The only remaining user story is about extending this project to other school events.

## Known Issues

Currently, we have no known errors.

## Installation Instructions

#### NOTE: These installation instructions are only applicable to Naperville North School Computers or Chromebooks. These have not been tested on other computers, operating systems, etc.

- Download Visual Studio Code from https://code.visualstudio.com/
- Follow the Software Engineering Toolchain Setup https://docs.google.com/document/d/1wvdn-MVotuBM6wehNdPpbbOFMzmKLPxFzErH8-mkP1s/preview#heading=h.ja24rkqe39ln
- Sign into Github from Visual Studio Code
- Navigate to the homepage of Visual Studio Code
- Select "Clone Git Repository..."
  - Select the Graduation Ticketing Github repository from the dropdown
- Sidenote: Make sure to run this following code in the terminal to ensure the project works

```
npm install
```

- Create a .env file with the following contents

```
MONGO_URI=mongodb+srv://nnhssoftware:MkJrY1s5mlqgHBox@cluster0.i7t6tw2.mongodb.net/?retryWrites=true&w=majority
SESSION_SECRET=c07f5e8a4bdc145e3d9f8a1b2c6d3a9e7b6f2c5a8d1e4c7a0d3e8c7a4b0d5
RECEIVER_PORT=8000
TICKET_PORT=8081
```

This is alternative method which the previous team used:

<!-- - In order to run the project, navigate to the left sidebar and click on "Run and Debug"
  - Make sure the top dropdown is selected to "Node Server"
    - Click the button "Start Debugging"
      - This starts the server
  - Now, make sure the top dropdown is selected to "Node Client"
    - Click the button "Start Debugging"
      - If the previous steps were done correctly, you should be redirected to a new page looking exactly like https://gradticketdev.nnhsse.org -->

However, we prefer to use the terminal for simplicity. Just open the terminal with Ctrl + ` and run "node server.js" to start up the ticket server. For the scanner server type "cd receivescan" to enter the receiver folder and then "node receivebarcodeserver.js". To access either page, go into your browser and type "localhost:8080" for tickets and "localhost:8081" for the scanner.

## Scanner Set-Up

To Scan: The barcode scanner must have ENTER as its suffix when scanning to function smoothly. To do this, refer to the Zebra DS9308 barcode scanner manual. On page 90, scan "Scan Suffix 1," then go to page 441 and scan "7," then "0," then "1," then "3." 7013 corresponds to enter, and if done as listed above, enter should be added as a suffix to scans.

## Parent Instructions

- Navigate to the ticket page, https://gradticketdev.nnhsse.org
- Enter in your access code and press submit (6 characters of uppercase letters and number)
- Verify that the name of your student and their id number are correct
- Scan the barcode at the volunteer's scanner (you cannot scan this ticket again afterwards)
- If an override is required, call an admin or volunteer over to grant access

## Volunteer Instructions

- Navigate to the ticket scanning page, https://gradticketadmindev.nnhsse.org/
- Log in to get access to the page
- Scan the attendee's ticket, you will see the validity of their scan and their student's information
- To override, click the button on the sidebar and provide a name, then scan ticket again
<!--TODO: explain ticket log-->
- Continue scanning

## Admin Instructions

- Admins have password-protected features
- Import, export, and revert last import
- Log in to get access to these features and everything else
