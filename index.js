// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6hLyzsx8dmxydQTTBvPg2YaIRSxZVt1k",
  authDomain: "ticket-system-6d32e.firebaseapp.com",
  databaseURL: "https://ticket-system-6d32e-default-rtdb.firebaseio.com",
  projectId: "ticket-system-6d32e",
  storageBucket: "ticket-system-6d32e.firebasestorage.app",
  messagingSenderId: "60261743685",
  appId: "1:60261743685:web:0f442ffd1cc4e16c01b72c",
  measurementId: "G-V2RQKGJJHH"
  
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Select the login form
const loginForm = document.getElementById('login-form');

// Select the strength message element
const strengthMessage = document.getElementById('strengthMessage');

// Add an event listener to handle the form submission
loginForm.addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent the form from submitting and refreshing the page

  // Get email and password input values
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  // Simple client-side validation
  if (email === '' || password === '') {
    strengthMessage.textContent = 'Please fill in both fields.';
    strengthMessage.classList.add('error');
    strengthMessage.style.display = 'block';
    return;
  };

  // Use Firebase Authentication to sign in the user
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Login successful
      strengthMessage.textContent = 'Login successful!';
      strengthMessage.classList.remove('error');
      strengthMessage.classList.add('success');
      strengthMessage.style.display = 'block'; // Show the message

      // Redirect to another page after 1 second
      setTimeout(() => {
        window.location.href = './ticket.html'; // Redirect to the ticket page
      }, 1000);
    })
    .catch((error) => {
      // Handle errors
      const errorMessage = error.message;
      strengthMessage.textContent = `Error: ${errorMessage}`;
      strengthMessage.classList.remove('success');
      strengthMessage.classList.add('error');
      strengthMessage.style.display = 'block'; // Show the error message
    });
}); // End of login form event listener
