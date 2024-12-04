// API key for accessing the API
/* ! RIGHT NOW THE API KEY IS SHOWN IN PLAIN TEXT WHICH IS NOT SO GOOD IN
REGARDS TO SECURITY, IT SHOULD  BE FIXED IN THE FUTURE (IS HASHING POSSIBLE?) */
const apiKey = 'solaris-edVCa1E6zDZRztaq'; // Unique key for authentication
const baseURL = 'https://n5n3eiyjb0.execute-api.eu-north-1.amazonaws.com';  // Base URL for API endpoints

// Check if the API key is missing
if (!apiKey) {
    displayMessage('API-nyckeln saknas. Kontrollera din konfiguration.'); // Inform the user about the missing key
    throw new Error('API-nyckeln saknas.'); // Stop execution due to missing key
}

// Check if the `fetch` method is supported by the browser (and offer fallback if needed)
if (!window.fetch) {
    console.warn('Fetch stöds inte. En polyfill används.'); // Warn the user about missing fetch support
    window.fetch = fetchFallback; // Use a fallback function for fetch
} else {
    console.log('Fetch stöds.'); // Log that fetch is supported
}

// Fallback function for fetch using XMLHttpRequest
function fetchFallback(url, options = {}) {
    displayMessage('Din webbläsare stöder inte moderna funktioner. Vi använder en äldre metod.'); // Inform user about the fallback
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest(); // Create an XMLHttpRequest object
        xhr.open(options.method || 'GET', url); // Open a connection with specified method and URL
        
        // Set headers if provided in the options
        for (const header in options.headers) {
            xhr.setRequestHeader(header, options.headers[header]);
        }
        
        // Handle the response
        xhr.onload = () => resolve({ 
            ok: xhr.status >= 200 && xhr.status < 300, // Consider status codes 200-299 as successful
            status: xhr.status, // Include HTTP status code
            json: () => Promise.resolve(JSON.parse(xhr.responseText)) // Parse response as JSON (JavaScript Object Notation)
        });

        xhr.onerror = () => reject(new Error('Network error')); // Handle network errors
        xhr.send(); // Send the request
    });
}

// Fetch API key dynamically 
async function getApiKey() {
    try {
        const response = await fetch(`${baseURL}/apikey`, {
            method: 'POST',
        }); // Make a POST request to the API key endpoint
        if (!response.ok) throw new Error(`Error: ${response.status}`); // Handle non-2xx HTTP responses
        const { apiKey } = await response.json(); // Parse the JSON response to extract the API key
        console.log('API Key:', apiKey); // Log the received API key
        return apiKey; // Return the key
    } catch (error) {
        console.error('Failed to fetch API key:', error); // Log any errors encountered
    }
}

// Fetch planet data from the API
async function getBodies() {
    try {
        const response = await fetch(`${baseURL}/planets`, {
            method: 'GET',
        }); // Send a GET request to fetch planet data
        if (!response.ok) throw new Error(`Error: ${response.status}`); // Handle unsuccessful responses
        const planets = await response.json(); // Parse JSON response to get planet data
        console.log('Planet data:', planets); // Log the fetched data
        console.log(planets);
        return planets; // Return the planet data
    } catch (error) {
        console.error('Failed to fetch planets:', error); // Log any errors encountered
    }
}

// Function to display planets on the page
function displayPlanets(planets) {
    console.log('Displaying planets:', planets);  // Look for and swhow planet-data
    const planetList = document.getElementById('planet-list'); // Select the container for planet data
    planetList.innerHTML = planets.length ? '' : '<p>Inga planetdata att visa.</p>';  // Display a message if no planets are found

    planets.forEach(planet => {
        const planetCard = document.createElement('section'); // Create a container for each planet
        planetCard.classList.add('planet-card'); // Add a styling class

        // Create planet symbol
        const planetSymbol = document.createElement('div');
        planetSymbol.classList.add('planet-symbol', planet.name.toLowerCase());

         // Add the right CSS-class based on the planets name
        const planetClass = planetClasses[planet.name] || 'default'; // Hämta rätt klass
        planetSymbol.classList.add(planetClass); // Add the class
        
        /* Combine all content into a single string to set innerHTML only once and
           create planet details using a template literal */
        let planetContent = `
            <h2>${planet.name}</h2>
            <p><strong>Latinska namnet:</strong> ${planet.latinName || 'Ej tillgängligt'}</p>
            <p>${planet.desc || 'Ingen beskrivning tillgänglig.'}</p>
            <p><strong>Typ:</strong> ${planet.type || 'Ej specificerat'}</p>
            <p><strong>Omkrets:</strong> ${planet.circumference ? planet.circumference + ' km' : 'Ej tillgänglig'}</p>
            <p><strong>Temperatur dag:</strong> ${planet.temp?.day ? planet.temp.day + '°C' : 'Ej tillgänglig'}</p>
            <p><strong>Temperatur natt:</strong> ${planet.temp?.night ? planet.temp.night + '°C' : 'Ej tillgänglig'}</p>
            <p><strong>Rotation:</strong> ${planet.rotation || 'Ej tillgänglig'} jorddygn</p>
            <p><strong>Avstånd från solen:</strong> ${planet.distance || 'Ej tillgängligt'} km</p>
            <p><strong>Omloppstid:</strong> ${planet.orbitalPeriod || 'Ej tillgänglig'} jorddygn</p>
            <p><strong>Månar:</strong> ${planet.moons?.length > 0 ? planet.moons.join(', ') : 'Inga månar'}</p>
            <p>
                <a href="https://sv.wikipedia.org/wiki/${planet.name}" target="_blank">Wikipedia</a> | 
                <a href="https://solarsystem.nasa.gov/planets/${planet.name.toLowerCase()}" target="_blank">NASA</a> 
            </p>
        `; // Added a paragrahph with two hyperlinks for more info about the planet(s) in question
        
        planetCard.appendChild(planetSymbol); // Add the planet symbol
        planetCard.innerHTML += planetContent; // Add the rest of the content
        planetList.appendChild(planetCard); // Append the card to the container
    });
}

// Function to display a message on the page
function displayMessage(message) {
    const planetList = document.getElementById('planet-list'); // Select the container for messages
    planetList.innerHTML = `<p>${message}</p>`; // Display the message
}

// Load planets on page load
document.addEventListener('DOMContentLoaded', async () => {
    displayMessage('Laddar planetdata, vänligen vänta...'); // Show a loading message
    const cachedPlanets = localStorage.getItem('planets'); // Check localStorage for cached data
    let planets = [];
    console.log(cachedPlanets);  // Check if there is cached data

    if (cachedPlanets) {
        console.log('Hämtar planetdata från cache.'); // Log usage of cached data
        planets = JSON.parse(cachedPlanets); // Parse cached data
    } else {
        console.log('Hämtar planetdata från API.'); // Log API fetch
        planets = await getBodies(); // Fetch from API
    }

    displayPlanets(planets); // Display planets on the page
});

// Handle click events on planet cards
document.addEventListener('click', event => {
    if (event.target.closest('.planet-card')) {
        const planetName = event.target.closest('.planet-card').querySelector('h2').textContent; // Get planet name
        localStorage.setItem('selectedPlanet', planetName); // Store selected planet in localStorage
        window.location.href = 'planet.html'; // Navigate to the details page
    }
});

// Handle page-specific logic for selected planets
document.addEventListener('DOMContentLoaded', () => {
    const selectedPlanet = localStorage.getItem('selectedPlanet'); // Get selected planet
    if (selectedPlanet) {
        displayMessage(`Vald planet: ${selectedPlanet}`); // Show the selected planet
    }
});

// Object with planet classes
const planetClasses = {
    Sun: 'sun',
    Mercury: 'mercury',
    Venus: 'venus',
    Earth: 'earth',
    Mars: 'mars',
    Jupiter: 'jupiter',
    Saturn: 'saturn',
    Uranus: 'uranus',
    Neptune: 'neptune',
};

// Handle search functionality (with Event listener)
document.getElementById('search-form').addEventListener('submit', async event => {
    event.preventDefault(); // Prevent default form submission
    const searchInput = document.getElementById('search-input'); // Get search input field
    const searchTerm = searchInput.value.trim().toLowerCase().replace(/\s+/g, ' '); // Normalize the search term

    if (!searchTerm) {
        displayMessage('Ange ett sökord för att filtrera planeter.'); // Show error for empty search
        return;
    }

    if (['pluto', 'månen'].includes(searchTerm)) {
        displayMessage(`${searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)} är inte en planet.`); // Handle non-planets
        return;
    }    

    try {
        const cachedPlanets = localStorage.getItem('planets'); // Use cached data if available
        const planets = cachedPlanets ? JSON.parse(cachedPlanets) : await getBodies(); // Fetch data if needed
        const filteredPlanets = planets.filter(planet =>
            planet.name.toLowerCase().includes(searchTerm) ||
            planet.latinName.toLowerCase().includes(searchTerm) ||
            planet.type.toLowerCase().includes(searchTerm)
        ); // Filter planets by search term

        displayPlanets(filteredPlanets.length ? filteredPlanets : []); // Display filtered planets
        if (!filteredPlanets.length) displayMessage('Inga planeter matchade din sökning.'); // No matches
    } catch (error) {
        console.error('Sökningen misslyckades:', error); // Log any errors
        displayMessage('Ett fel inträffade vid sökning.'); // Show error message
    }
});
