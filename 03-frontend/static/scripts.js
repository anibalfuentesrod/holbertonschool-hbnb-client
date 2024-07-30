document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();

    const loginForm = document.getElementById('login-form');
    const logoutLink = document.getElementById('logout-link'); // Get the logout link

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                await loginUser(email, password);
            } catch (error) {
                console.error('Error during login:', error);
                alert('Login failed: ' + error.message);
            }
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            logoutUser();
        });
    }

    const countryFilter = document.getElementById('country-filter');
    if (countryFilter) {
        countryFilter.addEventListener('change', (event) => {
            filterPlaces(event.target.value);
        });
    }
});

async function loginUser(email, password) {
    const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        const data = await response.json();
        document.cookie = `token=${data.access_token}; path=/`;
        window.location.href = 'http://127.0.0.1:5000/';
    } else {
        const errorData = await response.json();
        alert('Login failed: ' + errorData.message);
    }
}

function getCookie(name) {
    let cookieArr = document.cookie.split(";");

    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");

        if (name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }

    return null;
}

function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');

    console.log('Checking authentication...');
    console.log('Token:', token);
    console.log('Login link:', loginLink);
    console.log('Logout link:', logoutLink);

    if (!token) {
        if (loginLink) loginLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
    } else {
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
        fetchPlaces(token);
    }
}

// Fetch places data
async function fetchPlaces(token) {
    try {
        const response = await fetch('http://127.0.0.1:5000/places', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const places = await response.json();
            displayPlaces(places);
            populateCountryFilter(places);
        } else {
            console.error('Failed to fetch places:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching places:', error);
    }
}

// Populate places list
function displayPlaces(places) {
    const placesList = document.getElementById('places-list');
    placesList.innerHTML = '';

    places.forEach(place => {
        const placeCard = document.createElement('div');
        placeCard.className = 'place-card';

        placeCard.innerHTML = `
            <img src="static/place1.jpg" class="place-image" alt="Place Image">
            <h3>${place.description}</h3>
            <p>Price per night: $${place.price_per_night}</p>
            <p>Location: ${place.city_name}, ${place.country_name}</p>
            <button class="details-button">View Details</button>
        `;

        placesList.appendChild(placeCard);
    });
}

// Populate country filter options
function populateCountryFilter(places) {
    const countryFilter = document.getElementById('country-filter');
    const countries = [...new Set(places.map(place => place.country_name))];

    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
}

// Filter places based on selected country
function filterPlaces(selectedCountry) {
    const placeCards = document.querySelectorAll('.place-card');

    placeCards.forEach(card => {
        const location = card.querySelector('p').innerText.split(': ')[1];
        if (location.includes(selectedCountry) || selectedCountry === 'All') {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Logout user
function logoutUser() {
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = 'login.html';
}