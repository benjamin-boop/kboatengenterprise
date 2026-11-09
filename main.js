const container = document.querySelector('.container');
const signupButton = document.querySelector('.signup-section header');
const loginButton = document.querySelector('.login-section header');

loginButton.addEventListener('click', () => {
    container.classList.add('active');
});

signupButton.addEventListener('click', () => {
    container.classList.remove('active');
});


/*Login and SignUp Functionality */

/*document.addEventListener("DOMContentLoaded", () => {
  // Social buttons
  document.getElementById("googleSignup").addEventListener("click", () => {
      window.location.href = "googleAuth.html";
  });

  document.getElementById("appleSignup").addEventListener("click", () => {
      window.location.href = "appleAuth.html";
  });

  document.getElementById("googleLogin").addEventListener("click", () => {
      window.location.href = "googleAuth.html";
  });

  document.getElementById("appleLogin").addEventListener("click", () => {
      window.location.href = "appleAuth.html";
  });

  // Forms
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");

  // Store credentials in localStorage
  signupForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const fullName = document.getElementById("fullName").value;
      const email = document.getElementById("signupEmail").value;

      if (localStorage.getItem(email)) {
          alert("Email is already registered. Please use Login.");
      } else {
          localStorage.setItem(email, JSON.stringify({ fullName }));
          localStorage.setItem("userEmail", email); // Store current user email
          alert("Signup successful! Please login now.");

          // Switch to login section
          document.getElementById("signupSection").style.display = "block";
          document.getElementById("loginSection").style.display = "none";
      }
  });

  // Validate login credentials
  loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value;
      const storedUser = localStorage.getItem(email);

      if (!storedUser) {
          alert("No account found with this email. Please signup first.");
      } else {
          alert("Login successful!");
          localStorage.setItem("userEmail", email); // Store current user email
          window.location.href = "Home.html";
      }
  });
});  */




