const login = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:5000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("token", data.token);

    // Fetch user details after login
    const userRes = await fetch(`http://localhost:5000/api/user-info?email=${email}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${data.token}` },
    });

    const userData = await userRes.json();
    if (userRes.ok) {
      localStorage.setItem("user", JSON.stringify(userData)); // Store user data
      alert("Login successful!");
      window.location.href = "main.html"; // Redirect to main.html
    } else {
      alert("Failed to fetch user details.");
    }
  } else {
    alert(data.message);
  }
};