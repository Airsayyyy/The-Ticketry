// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js';

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
const db = getFirestore(app); // Initialize Firestore

// Get references to elements
const addTicketBtn = document.getElementById('add-ticket-btn');
const popup = document.getElementById('popup');
const closePopup = document.querySelector('.close');
const createTicketBtn = document.getElementById('create');
const ticketForm = document.getElementById('ticket-form');
const strengthMessage = document.getElementById('message');
const ticketRows = document.getElementById('ticketRows');
const detailPopup = document.getElementById('detail-popup');
const closeDetailPopup = document.querySelector('.close-detail');
const logoutbtn = document.getElementById('logout-btn');

let editingTicketId = null; // Variable to track if a ticket is being edited

// Show the ticket form when the "Add New Ticket" button is clicked
addTicketBtn.addEventListener('click', function() {
  popup.style.display = 'block';
  strengthMessage.style.display = 'none'; // Hide any previous messages
  ticketForm.reset(); // Clear the form
  editingTicketId = null; // Reset the editing state
  createTicketBtn.textContent = 'Create Ticket'; // Set button text to "Create" when adding new ticket
});

// Hide the ticket form when the close button is clicked
closePopup.addEventListener('click', function() {
  popup.style.display = 'none';
  editingTicketId = null; // Reset the editing state when popup is closed
});

// Handle form submission when the "Create Ticket" or "Update Ticket" button is clicked
createTicketBtn.addEventListener('click', async function(event) {
  event.preventDefault(); // Prevent form submission refresh

  // Get values from the form
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const issueType = document.getElementById('issueType').value;
  const priorityLevel = document.getElementById('priorityLevel').value;
  const customersName = document.getElementById('customersname').value;

  // Check if all fields are filled
  if (!title || !description || !issueType || !priorityLevel || !customersName) {
    strengthMessage.textContent = 'Please fill in all fields.';
    strengthMessage.classList.remove('success');
    strengthMessage.classList.add('error');
    strengthMessage.style.display = 'block';
    return;
  }

  const user = auth.currentUser; // Get the logged-in user
  if (!user) {
    strengthMessage.textContent = 'Error: User is not authenticated.';
    strengthMessage.classList.add('error');
    strengthMessage.style.display = 'block';
    return;
  }

  const userEmail = user.email; // Get the user's email

  if (editingTicketId) {
    // Update the existing ticket in Firestore
    try {
      const ticketRef = doc(db, 'tickets', editingTicketId);
      await updateDoc(ticketRef, {
        title: title,
        description: description,
        issueType: issueType,
        priorityLevel: priorityLevel,
        customersName: customersName,
        email: userEmail // Ensure the user's email is still associated
      });

      // Update success message
      strengthMessage.textContent = 'Ticket Updated Successfully!';
      strengthMessage.classList.remove('error');
      strengthMessage.classList.add('success');
      strengthMessage.style.display = 'block';

      // Update the ticket row in the table
      const ticketRow = document.querySelector(`tr[data-id="${editingTicketId}"]`);
      ticketRow.querySelector('td:nth-child(1)').textContent = title;
      ticketRow.querySelector('td:nth-child(2)').textContent = customersName;
      ticketRow.querySelector('td:nth-child(3)').textContent = issueType;
      ticketRow.querySelector('td:nth-child(4)').textContent = priorityLevel;

    } catch (error) {
      console.error("Error updating ticket:", error);
      strengthMessage.textContent = `Error: ${error.message}`;
      strengthMessage.classList.remove('success');
      strengthMessage.classList.add('error');
      strengthMessage.style.display = 'block';
    }

  } else {
    // Create a new ticket in Firestore
    try {
      const docRef = await addDoc(collection(db, 'tickets'), {
        title: title,
        description: description,
        issueType: issueType,
        priorityLevel: priorityLevel,
        customersName: customersName,
        email: userEmail // Save the user's email with the ticket
      });

      // Ticket successfully saved to Firestore

      // Add ticket to the table
      addTicketToTable(docRef.id, title, customersName, issueType, priorityLevel, description);

      // Display success message
      strengthMessage.textContent = 'Ticket Created Successfully!';
      strengthMessage.classList.remove('error');
      strengthMessage.classList.add('success');
      strengthMessage.style.display = 'block';

    } catch (error) {
      console.error("Error creating ticket:", error);
      strengthMessage.textContent = `Error: ${error.message}`;
      strengthMessage.classList.remove('success');
      strengthMessage.classList.add('error');
      strengthMessage.style.display = 'block';
    }
  }

  // Hide the success message after 1 second, then hide the popup and reset form
  setTimeout(() => {
    strengthMessage.style.display = 'none';
    popup.style.display = 'none';
    ticketForm.reset(); // Reset the form fields after submission
    editingTicketId = null; // Reset the editing state
  }, 1000);
});

// Function to add a ticket row to the table
function addTicketToTable(ticketId, title, customersName, issueType, priorityLevel, description) {
  const row = document.createElement('tr');
  row.setAttribute('data-id', ticketId); // Set a data attribute with the ticket's ID
  row.innerHTML = `
    <td>${title}</td>
    <td>${customersName}</td>
    <td>${issueType}</td>
    <td>${priorityLevel}</td>
    <td>
      <button class="edit-btn">Edit</button>
      <button class="view-btn">View</button>
      <button class="delete-btn">🗑️</button>
    </td>
  `;
  ticketRows.appendChild(row);

  // Attach click event to the edit button
  row.querySelector('.edit-btn').addEventListener('click', function() {
    editTicket(ticketId, title, customersName, issueType, priorityLevel, description);
  });

  // Attach click event to the view button
  row.querySelector('.view-btn').addEventListener('click', function() {
    showDetails(title, customersName, issueType, priorityLevel, description);
  });

  // Attach click event to the delete button
  row.querySelector('.delete-btn').addEventListener('click', function() {
    deleteTicket(ticketId, row); // Remove the ticket from Firestore and table
  });
}

// Function to edit a ticket (populate the form with ticket data)
function editTicket(ticketId, title, customersName, issueType, priorityLevel, description) {
  // Populate the form with the ticket's current details
  document.getElementById('title').value = title;
  document.getElementById('description').value = description;
  document.getElementById('issueType').value = issueType;
  document.getElementById('priorityLevel').value = priorityLevel;
  document.getElementById('customersname').value = customersName;

  // Set the editingTicketId to the current ticket's ID
  editingTicketId = ticketId;

  // Change the button text to "Update Ticket"
  createTicketBtn.textContent = 'Update Ticket';

  // Show the form popup for editing
  popup.style.display = 'block';
}

// Function to delete a ticket
async function deleteTicket(ticketId, row) {
  try {
    await deleteDoc(doc(db, 'tickets', ticketId));
    row.remove(); // Remove the ticket row from the table
  } catch (error) {
    console.error("Error deleting ticket:", error);
  }
}

// Logout functionality
logoutbtn.addEventListener('click', function() {
  signOut(auth).then(() => {
    console.log('User signed out successfully.');
    window.location.href = 'index.html'; // Redirect to login page after sign out
  }).catch((error) => {
    console.error('Error signing out:', error);
  });
});

// Show ticket details in a popup
function showDetails(title, customersName, issueType, priorityLevel, description) {
  const detailElement = document.getElementById('detail-content');
  if (detailElement) {
    detailElement.innerHTML = `
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Description:</strong> ${description}</p>
      <p><strong>Customer's Name:</strong> ${customersName}</p>
      <p><strong>Issue Type:</strong> ${issueType}</p>
      <p><strong>Priority Level:</strong> ${priorityLevel}</p>
    `;
    detailPopup.style.display = 'block';
  } else {
    console.error("Element with ID 'detail-content' not found.");
  }
}

// Close the detail popup when the close button is clicked
closeDetailPopup.addEventListener('click', function() {
  detailPopup.style.display = 'none';
});

// Use onAuthStateChanged to wait for the user authentication state to load
onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchTickets(user);
  } else {
    console.error("User is not authenticated.");
    window.location.href = 'login.html'; // Redirect to login page if not authenticated
  }
});

// Fetch and display tickets on page load
async function fetchTickets(user) {
  let ticketsQuery;

  if (user.email === 'eseoherobert15@gmail.com') {
    // If the user is eseoherobert@gmail.com, fetch all tickets
    ticketsQuery = query(collection(db, 'tickets'));
  } else {
    // Otherwise, fetch only tickets that belong to the current user
    ticketsQuery = query(collection(db, 'tickets'), where('email', '==', user.email));
  }

  try {
    const querySnapshot = await getDocs(ticketsQuery);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      addTicketToTable(doc.id, data.title, data.customersName, data.issueType, data.priorityLevel, data.description);
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
  }
}
