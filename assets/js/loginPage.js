document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault(); // prevent form from submitting normally

  const password = document.getElementById("password").value;
  const message = document.getElementById("message");
  let userType = "none";

  console.log("test1");

  if (password === process.env.USERPASSWORD) {
    document.getElementById("message").textContent = "Login successful!";
    document.getElementById("message").style.color = "green";
    type = "user";
  } else if (password === process.env.ADMINPASSWORD) {
    document.getElementById("message").textContent = "Login successful!";
    document.getElementById("message").style.color = "green";
    type = "admin";
  } else {
    document.getElementById("message").textContent = "Invalid credentials.";
    document.getElementById("message").style.color = "red";
  }

  console.log("test2 " + userType);

  // Send the login request to the server
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: userType }),
  }).then((response) => {
    if (response.redirected) {
      window.location.href = response.url;
    } else {
      message.textContent = "Login failed.";
      message.style.color = "red";
    }
  });
});
