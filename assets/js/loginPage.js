document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault(); // prevent form from submitting normally

  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  // Send the login request to the server
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password: password }),
  }).then((response) => {
    if (response.ok) {
      message.textContent = "Login successful!";
      message.style.color = "green";
      window.location.href = "/";
    } else {
      message.textContent = "Login failed.";
      message.style.color = "red";
    }
  });
});
