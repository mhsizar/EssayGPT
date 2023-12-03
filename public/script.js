// Function to handle user registration
function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('currentUsername', username); // Set the current user
            displayUserProfile(username);
            document.getElementById('profileButton').style.display = 'block';
            showNavbar(true); // Make sure to show the navbar
            showEssayContainer();
            // Clear the text areas for the new user
            document.getElementById('essayInput').value = '';
            document.getElementById('essayOutput').value = '';
        } else {
            alert('Registration failed: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Function to handle user login
function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('currentUsername', username); // Store the currently logged in user
            showNavbar(true);
            displayUserProfile(username);
            document.getElementById('profileButton').style.display = 'block';
            // Populate the fields with the last data if available
            document.getElementById('essayInput').value = localStorage.getItem(username + '_prompt') || '';
            document.getElementById('essayOutput').value = localStorage.getItem(username + '_essay') || '';
            showEssayContainer(); // Make sure to display the essay container
        } else {
            alert('Login failed: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}


// Function to generate an essay based on user input
function generateEssay() {
    const username = localStorage.getItem('currentUsername');
    const prompt = document.getElementById('essayInput').value;
    const outputTextArea = document.getElementById('essayOutput');

    if (!prompt) {
        outputTextArea.value = 'Error: No prompt provided.';
        return;
    }

    // Start pseudo-animation
    let loadingText = 'Generating essay ';
    outputTextArea.value = loadingText;
    const loadingAnimation = setInterval(() => {
        loadingText = loadingText.length < 25 ? (loadingText + '.') : 'Generating essay ';
        outputTextArea.value = loadingText;
    }, 500); // Update every 500ms

    fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({ prompt }),
    })
    .then(response => {
        if (!response.ok) {
            clearInterval(loadingAnimation); // Stop the animation
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        clearInterval(loadingAnimation); // Stop the animation
        if (data.essay) {
            outputTextArea.value = data.essay;
            localStorage.setItem(username + '_prompt', prompt);
            localStorage.setItem(username + '_essay', data.essay);
        } else {
            outputTextArea.value = 'Error: No essay returned from the server.';
        }
    })
    .catch(error => {
        clearInterval(loadingAnimation); // Stop the animation
        console.error('Error:', error);
        outputTextArea.value = `Error: ${error.message}`;
    });
}


// Function to show the essay container and hide login/register forms
function showEssayContainer() {
    document.getElementById('loginRegisterContainer').style.display = 'none';
    document.getElementById('essayContainer').style.display = 'block';
}

// Function to toggle the profile section
function toggleProfile() {
    const profileSection = document.getElementById('profileSection');
    const isDisplayed = profileSection.style.display === 'block';
    profileSection.style.display = isDisplayed ? 'none' : 'block';
}

// Function to display the profile section with user info
function displayUserProfile(username) {
    document.getElementById('profileUsername').innerHTML = `You are logged in as: <span class="username-style">${username}</span>`;
    showEssayContainer();
    document.getElementById('profileButton').style.display = 'block';
}

// Function to show the registration form
function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

// Function to show the login form
function showLogin() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

// Function to handle user logout
function logout() {
    localStorage.removeItem('token');
    document.getElementById('profileSection').style.display = 'none';
    document.getElementById('essayContainer').style.display = 'none';
    localStorage.removeItem('currentUsername');
    showLogin();
    showNavbar(false);
    document.getElementById('profileButton').style.display = 'none';
    document.getElementById('loginRegisterContainer').style.display = 'block';
}

// Function to show the navbar
function showNavbar(visible) {
    const navbar = document.getElementById('navbar');
    navbar.style.display = visible ? 'flex' : 'none';
}

// Profile section display logic
const profileButton = document.getElementById('profileButton');
const profileSection = document.getElementById('profileSection');
const navbar = document.getElementById('navbar');

function showProfile() {
    profileSection.style.display = 'block';
}

function hideProfile(event) {
    if (!profileSection.contains(event.relatedTarget) && !profileButton.contains(event.relatedTarget)) {
        profileSection.style.display = 'none';
    }
}

profileButton.addEventListener('mouseenter', showProfile);
navbar.addEventListener('mouseleave', hideProfile);
profileSection.addEventListener('mouseleave', hideProfile);
