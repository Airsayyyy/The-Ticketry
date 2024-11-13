// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js';

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
  // Your Firebase configuration here
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// Select the register form and input fields
const registerForm = document.getElementById('register-form');
const strengthMessage = document.getElementById('message-signup'); // Message to show feedback

// Add an event listener to handle form submission
registerForm.addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent form submission and page refresh

  // Get values from input fields
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Validate password (uppercase, lowercase, number)
  if (!validatePassword(password)) {
    strengthMessage.textContent = 'Password must contain at least one uppercase letter, one lowercase letter, and one number.';
    strengthMessage.classList.remove('success');
    strengthMessage.classList.add('error');
    strengthMessage.style.display = 'block'; // Show the error message
    return;
  }

  // Use Firebase Authentication to create a new user
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // User created successfully
      const user = userCredential.user;

      // Save additional user info in Firestore
      setDoc(doc(db, 'users', user.uid), {
        username: username,
        email: email
      });

      strengthMessage.textContent = 'Sign-up successful! You can now log in.';
      strengthMessage.classList.remove('error');
      strengthMessage.classList.add('success');
      strengthMessage.style.display = 'block';

      // Redirect after 1 second to login page
      setTimeout(() => {
        window.location.href = './index.html'; // Redirect to login
      }, 1000);
    })
    .catch((error) => {
      // Handle errors and log them
      console.error('Error during sign-up:', error);
      const errorMessage = error.message;
      strengthMessage.textContent = `Error: ${errorMessage}`;
      strengthMessage.classList.remove('success');
      strengthMessage.classList.add('error');
      strengthMessage.style.display = 'block'; // Show the error message
    });
});

// Password validation function
function validatePassword(password) {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return hasUpperCase && hasLowerCase && hasNumber;
}
