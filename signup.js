document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;
  const sex = document.querySelector('input[name="sex"]:checked').value;

  try {
    const response = await fetch("http://localhost:5000/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, age, email, phone, password, sex }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Signup successful! OTP sent to your email.");
      document.getElementById("otpSection").style.display = "block";
    } else {
      alert("Signup failed: " + data.message);
    }
  } catch (error) {
    alert("Error: " + error.message);
  }
});

document.getElementById("verify-btn").addEventListener("click", async () => {
  const otp = document.getElementById("otp").value;
  const email = document.getElementById("email").value;

  try {
    const res = await fetch("http://localhost:5000/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      window.location.href = "login.html";
    }
  } catch (error) {
    alert("Error: " + error.message);
  }
});
