document.getElementById("sendOtpBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
  
    if (!email) return alert("Enter your email!");
  
    const res = await fetch("http://localhost:5000/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  
    const data = await res.json();
    alert(data.message);
    
    if (res.ok) {
      document.getElementById("resetSection").style.display = "block";
    }
  });
  
  document.getElementById("resetPassBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const otp = document.getElementById("otp").value;
    const newPassword = document.getElementById("newPassword").value;
  
    if (!otp || !newPassword) return alert("Enter OTP and new password!");
  
    const res = await fetch("http://localhost:5000/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });
  
    const data = await res.json();
    alert(data.message);
    
    if (res.ok) window.location.href = "login.html";
  });
  
  function forgotPassword() {
    window.location.href = "forgot-password.html";
  }
  