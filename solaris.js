// Function to fetch the API key
async function getApiKey() {
  try {
    // Make a POST request to the API endpoint to retrieve the API key
    const response = await fetch('https://n5n3eiyjb0.execute-api.eu-north-1.amazonaws.com/keys', {
      method: 'POST',
    });
    // Check if the response status is not OK, and throw an error if so
    if (!response.ok) {
      throw new Error(`Failed to fetch API key: ${response.status}`);
    }
    // Parse the JSON response into a JavaScript object
    const data = await response.json();
    console.log('API Key Response:', data); 
    // Check if the 'key' property exists in the response data
    if (data && data.key) {
      return data.key; // Using 'key' insead of 'apiKey'
    } else {
      throw new Error("API key not found in response");
    }
  } catch (error) {
    console.error('Error fetching API key:', error);
    throw error;
  }
}

// Global variable to cache the API key to avoid redundant API requests
let cachedApiKey;
// Function to fetch the API key with caching
async function getApiKey() {
    if (cachedApiKey) return cachedApiKey; // Return cached key if already fetched
    // Fetch API key if not cached
    const response = await fetch('https://n5n3eiyjb0.execute-api.eu-north-1.amazonaws.com/keys', { method: 'POST' });
    const data = await response.json();
    cachedApiKey = data.key; // Store the fetched key in the cache
    return cachedApiKey;
}

// Function to fetch celestial bodies data from the API
async function getBodies() {
  try {
    const apiKey = await getApiKey(); // Fetch the API key using the getApiKey function
    // Ensure the API key is not null or undefined
    if (!apiKey) {
      throw new Error("API key is missing.");
    }

    console.log('Using API key:', apiKey);

    // Make a GET request to fetch celestial bodies
    const response = await fetch('https://n5n3eiyjb0.execute-api.eu-north-1.amazonaws.com/bodies', {
      method: 'GET',
      headers: {
        'x-zocom': apiKey, // Pass the API key in the request headers
      },
    });
    // Check if the response status is OK
    if (!response.ok) {
      throw new Error(`Failed to fetch bodies: ${response.status}`);
    }
    // Parse the response into a JavaScript object
    const data = await response.json();
    console.log('Fetched data:', data);
    console.log('Fetched celestial bodies:', data);
    // Ensure the response contains a valid array of celestial bodies
    if (data && Array.isArray(data.bodies)) {
      return data.bodies; // Return the celestial bodies array
    } else {
      throw new Error("API-svaret innehåller inte 'bodies' fältet eller är inte en array");
    }
  } catch (error) {
    console.error('Error fetching celestial bodies:', error); // Log any errors and re-throw them for the caller to handle
    throw error;
  }
}

// Call the function and handle the result, NEW CODE
getBodies()
    .then(bodies => {
        localStorage.setItem('bodies', JSON.stringify(bodies)); // Save as an array
        console.log('Bodies:', bodies);
    })
    .catch(error => {
        console.error('Error:', error);
    });

/* Call the function and handle the result, OLD CODE KEPT FOR COMPARISON REASONS AND FUTURE REFERENCE
getBodies()
  .then(bodies => {
    console.log('Bodies:', bodies);
  })
  .catch(error => {
    console.error('Error:', error);
  }); */

// Function to display celestial bodies on the page
function displayBodies(bodies) {
    console.log('Displaying bodies:', bodies);
    const bodyList = document.getElementById('body-list');
    bodyList.innerHTML = bodies.length ? '' : '<p>Inga himlakroppar att visa.</p>';
    // Iterate over the list of celestial bodies
    bodies.forEach((body) => {
      const bodyCard = document.createElement('section');
      bodyCard.classList.add('body-card');
      const bodySymbol = document.createElement('section');
      bodySymbol.classList.add('body-symbol', body.name.toLowerCase());

      // Add the right CSS-class based on the planets name
      const bodyClass = bodyClasses[body.name] || 'default'; 
      bodySymbol.classList.add(bodyClass);

      // Combine all content into a single string to set innerHTML only once
      const bodyContent = `
        <h2>${body.name}</h2>
        <p><strong>Latinska namnet:</strong> ${body.latinName || 'Ej tillgängligt'}</p>
        <p>${body.desc || 'Ingen beskrivning tillgänglig.'}</p>
        <p><strong>Typ:</strong> ${body.type || 'Ej specificerat'}</p>
        <p><strong>Omkrets:</strong> ${body.circumference ? body.circumference + ' km' : 'Ej tillgänglig'}</p>
        <p><strong>Temperatur dag:</strong> ${body.temp?.day ? body.temp.day + '°C' : 'Ej tillgänglig'}</p>
        <p><strong>Temperatur natt:</strong> ${body.temp?.night ? body.temp.night + '°C' : 'Ej tillgänglig'}</p>
        <p><strong>Rotation:</strong> ${body.rotation || 'Ej tillgänglig'} jorddygn</p>
        <p><strong>Avstånd från solen:</strong> ${body.distance || 'Ej tillgänglig'} km</p>
        <p><strong>Omloppstid:</strong> ${body.orbitalPeriod || 'Ej tillgänglig'} jorddygn</p>
        <p><strong>Månar:</strong> ${body.moons?.length > 0 ? body.moons.join(', ') : 'Inga månar'}</p>
        <p>
            <a href="https://sv.wikipedia.org/wiki/${body.name}" target="_blank">Wikipedia</a> |
            <a href="https://solarsystem.nasa.gov/planets/${body.name.toLowerCase()}" target="_blank">NASA</a>
        </p>
      `;

      bodyCard.appendChild(bodySymbol);
      bodyCard.innerHTML += bodyContent;
      bodyList.appendChild(bodyCard);
    });
}

// Function to display a message on the page
function displayMessage(message) {
    const bodyList = document.getElementById('body-list');
    bodyList.innerHTML = `<p>${message}</p>`;
}

// Initialize the application on page load
document.addEventListener('DOMContentLoaded', async () => {
  displayMessage('Laddar himlakroppar, vänligen vänta...');
  try {
    const bodies = await getBodies();
    displayBodies(bodies); 
  } catch (error) {
    displayMessage('Ett fel inträffade. Försök igen senare.');
  }
});

// Handle click events on planet cards
document.addEventListener('click', event => {
    if (event.target.closest('.body-card')) {
        const bodyName = event.target.closest('.body-card').querySelector('h2').textContent;
        localStorage.setItem('selectedBody', bodyName);
        // Navigate to the details page, however I haven't made specific pages for the planets so this will not work
        window.location.href = 'body.html'; 
    }
});

// Handle page-specific logic for selected planets
document.addEventListener('DOMContentLoaded', () => {
    const selectedBody = localStorage.getItem('selectedBody');
    if (selectedBody) {
        displayMessage(`Vald planet: ${selectedBody}`);
    }
});

// Object with planet classes
const bodyClasses = {
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

// Handle search functionality
document.getElementById('search-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim().toLowerCase().replace(/\s+/g, ' ');
  
    if (!searchTerm) {
      displayMessage('Ange ett sökord för att filtrera planeter.');
      return;
    }
  
    if (['pluto', 'månen'].includes(searchTerm)) {
      displayMessage(`${searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)} är inte en planet.`);
      return;
    }
  
    /* OLD CODE KEPT FOR COMPARISON REASONS AND FUTURE REFERENCE
         try {
      const cachedBodies = localStorage.getItem('bodies');
      const bodies = cachedBodies ? JSON.parse(cachedBodies) : await getBodies(); 
      END OF OLD CODE */

      // NEW CODE
      try {
        let bodies = JSON.parse(localStorage.getItem('bodies')); // Fetch from localStorage
        if (!bodies) {
            // If there isn't anything in localStorage, Fetch from API
            bodies = await getBodies();
            localStorage.setItem('bodies', JSON.stringify(bodies)); // Save as an array
        }

      const filteredBodies = bodies.filter((body) => // Changed to bodies.filter() instead of bodies.bodies.filter() for proper functionality
        body.name.toLowerCase().includes(searchTerm) ||
        (body.latinName && body.latinName.toLowerCase().includes(searchTerm)) ||
        (body.type && body.type.toLowerCase().includes(searchTerm))
      );

      if (filteredBodies.length) {
        displayBodies(filteredBodies);
    } else {
        displayMessage('Inga planeter matchade din sökning.');
    }

       /* OLD CODE KEPT FOR COMPARISON REASONS
        displayBodies(filteredBodies.length ? filteredBodies : []);
      if (!filteredBodies.length) {
        displayMessage('Inga planeter matchade din sökning.');
      } 
        END OF OLD CODE */
     
    } catch (error) {
      console.error('Sökningen misslyckades:', error);
      displayMessage('Ett fel inträffade vid sökning.');
    }
});
