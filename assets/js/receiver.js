let actionType = "";
const correctPassword = "admin123"; // PASSWORD

function promptPassword(action) {
  actionType = action;
  document.getElementById("import").style.display = "none";
  document.getElementById("export").style.display = "none";
  document.getElementById("revertImport").style.display = "none";
  document.getElementById("helpPage").style.display = "none";
  document.getElementById("passwordInput").style.display = "block";
  document.getElementById("passwordInput").placeholder = "Enter password";
  document.getElementById("confirmPassword").style.display = "block";
  document.getElementById("cancelPassword").style.display = "block";
  document.getElementById("passwordInput").focus();
}

function confirmPassword() {
  const enteredPassword = document.getElementById("passwordInput").value;

  // Directs user to page specified
  if (enteredPassword === correctPassword) {
    window.location.href = `/${actionType}`;
  } else {
    document.getElementById("passwordInput").placeholder = "Incorrect password";
    document.getElementById("passwordInput").value = "";
  }
}

// Edge case for revert, password does not work but will be fixed with session feature
document.getElementById("revertImport").addEventListener("click", function () {
  if (!confirm("Are you sure you want to revert the last import?")) return;

  fetch("/revertDatabase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

function cancelPassword() {
  document.getElementById("passwordInput").value = "";
  document.getElementById("import").style.display = "block";
  document.getElementById("export").style.display = "block";
  document.getElementById("revertImport").style.display = "block";
  document.getElementById("helpPage").style.display = "block";
  document.getElementById("passwordInput").style.display = "none";
  document.getElementById("confirmPassword").style.display = "none";
  document.getElementById("cancelPassword").style.display = "none";
}

// Hides elements initially
document.getElementById("overrideInput").style.display = "none";
document.getElementById("confirm").style.display = "none";
document.getElementById("cancel").style.display = "none";

// Set parameters for timestamp formatting
const timeOptions = {
  timeZone: "America/Chicago",
  month: "2-digit",
  day: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
};

// Initializes variables
var barcodeData = null;
var previousScanTime = null;

document.addEventListener("keydown", function (event) {
  console.log(event.key);
  // Check if the key pressed is Enter (key code 13)
  if (event.keyCode === 13) {
    // Barcode termination character detected, handle barcode data
    barcodeData = document.getElementById("barcodeInput").value;
    console.log("Barcode scanned:", barcodeData);
    const currentTimestamp = new Date();

    // Update timestamp timezone
    currentTimestamp.toLocaleString("en-US", { timeZone: "America/Chicago" });

    const scanData = document.getElementById("datafield");

    // Send post request to the server with what barcode was scanned and at what time
    fetch("/scanned", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        barcode: barcodeData,
        timestamp: currentTimestamp,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        return response.json();
      })
      .then((data) => {
        // Fetch student object data from the server
        first_name = data.studObj.first_name;
        last_name = data.studObj.last_name;
        id_num = data.studObj.id;

        // Grab html elements
        const scan_validity = document.getElementById("scan-validity");
        const buttons = document.getElementById("buttons");
        const overrideButton = document.getElementById("override");
        const wait_status = document.getElementById("wait_status");
        const displayName = document.getElementById("name");
        const displayNum = document.getElementById("id_number");
        const displayValid = document.getElementById("is_valid");
        const displayTimeStamp = document.getElementById("time_scanned");
        const otherTicket = document.getElementById("ticket_row");

        // update information and style
        wait_status.hidden = true;
        displayName.textContent = first_name + " " + last_name;
        displayNum.textContent = id_num;

        // Set parameters for timestamp formatting
        const timeOptions = {
          timeZone: "America/Chicago",
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        };

        console.log(scan_validity.childNodes);

        scan_validity.childNodes.forEach((child) => {
          if (child.id == "ticket_row") {
            scan_validity.removeChild(child);
            console.log(child);
          }
        });

        // Styling for an invalid scan
        if (data.validity == false) {
          overrideButton.style.opacity = "100";
          overrideButton.style.pointerEvents = "auto";
          scan_validity.style.backgroundColor = "red";
          displayValid.textContent = "INVALID SCAN";
          displayTimeStamp.textContent = "Time Last Scanned: ";

          scan_validity.childNodes.forEach((child) => {
            if (child.id == "ticket_row") {
              scan_validity.removeChild(child);
            }
          });

          // Logic to find the time of the last valid scan of a invalidly scanned ticket
          var previousScanTime = null;
          data.studObj.tickets.forEach((ticket) => {
            if (ticket.barcode == barcodeData) {
              previousScanTime = new Date(ticket.time_scanned).toLocaleString(
                "en-US",
                timeOptions
              );
              displayTimeStamp.textContent += previousScanTime;
            } else {
              otherTicket.textContent = ticket.access_code;
              if (ticket.time_scanned == null) {
                otherTicket.textContent += ": VALID TICKET";
              } else {
                otherTicket.textContent += ": INVALID TICKET -  ";
                otherTicket.textContent += new Date(
                  ticket.time_scanned
                ).toLocaleString("en-US", timeOptions);
              }
              scan_validity.appendChild(otherTicket);
            }
          });
        }
        // Styling for a valid scan
        else {
          scan_validity.style.backgroundColor = "green";
          displayValid.textContent = "VALID SCAN";
          overrideButton.style.opacity = "0";
          overrideButton.style.pointerEvents = "none";
          displayTimeStamp.textContent =
            "Time Scanned: " +
            new Date(currentTimestamp).toLocaleString("en-US", timeOptions);
          scan_validity.childNodes.forEach((child) => {
            if (child.id == "ticket_row") {
              scan_validity.removeChild(child);
              console.log(child);
            }
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    // Clear the input for the next scan
    document.getElementById("barcodeInput").value = "";
  }
});

function override() {
  document.getElementById("import").style.display = "none";
  document.getElementById("export").style.display = "none";
  document.getElementById("revertImport").style.display = "none";
  document.getElementById("helpPage").style.display = "none";
  document.getElementById("override").style.display = "none";
  document.getElementById("overrideInput").style.display = "block";
  document.getElementById("confirm").style.display = "block";
  document.getElementById("cancel").style.display = "block";
  document.getElementById("overrideInput").focus();
}

function overrideConfirm(isConfirmed) {
  if (isConfirmed) {
    const currentTimestamp = new Date();
    const time = currentTimestamp.toLocaleString("en-US", timeOptions);
    const name = document.getElementById("overrideInput").textContent;
    const overrideLog =
      "Overridden by " +
      name +
      " at " +
      time +
      ", was previously scanned at " +
      previousScanTime +
      "; ";

    fetch("/override", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        barcode: barcodeData,
        log: overrideLog,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  // Reset the display
  document.getElementById("overrideInput").value = "";
  document.getElementById("import").style.display = "block";
  document.getElementById("export").style.display = "block";
  document.getElementById("revertImport").style.display = "block";
  document.getElementById("helpPage").style.display = "block";
  document.getElementById("override").style.display = "block";
  document.getElementById("overrideInput").style.display = "none";
  document.getElementById("confirm").style.display = "none";
  document.getElementById("cancel").style.display = "none";
}
