window.onload = function () {
  const sidebar = document.querySelector(".sidebar");
  const closeBtn = document.querySelector("#btn");

  closeBtn.addEventListener("click", function () {
    sidebar.classList.toggle("open");
    menuBtnChange();
  });

  function menuBtnChange() {
    if (sidebar.classList.contains("open")) {
      closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
    } else {
      closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
    }
  }
};

document.getElementById("revertImport").addEventListener("click", function () {
  if (!confirm("Are you sure you want to revert the last import?")) return;

  fetch("/revertDatabase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then(async (response) => {
      const data = await response.json();
      alert(data.message);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

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
const currentTimeStamp = "";
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

document.addEventListener("keydown", function (event) {
  console.log(event.key);
  // Check if the key pressed is Enter (key code 13)
  if (event.keyCode === 13) {
    // Barcode termination character detected, handle barcode data
    barcodeData = document.getElementById("barcodeInput").value;
    console.log("Barcode scanned:", barcodeData);
    currentTimestamp = new Date();

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

//override
overrideButton.addEventListener("click", function () {
  console.log("Overridden " + first_name + last_name + "'s ticket to valid");
  var overrideAuth = window.prompt(
    "Are you sure you want to override this invalid scan? Sign off to override: "
  );
  if (overrideAuth !== null && overrideAuth !== "") {
    const overrideLog =
      "Overridden by " +
      overrideAuth +
      " at " +
      currentTimestamp +
      ", was previously scanned at " +
      previousScanTime +
      "; ";
    alert(overrideLog);
    fetch("/override", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        log: overrideLog,
        barcode: barcodeData,
      }),
    });
    alert("Override Successful, please scan again.");
  } else {
    alert("Override cancelled.");
  }
});
