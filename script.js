//API key for the OpenweatherAPI
const API_KEY ='API_KEY';

//Accessing Input and Submit 
const input = document.getElementById('citySearch');
const submit = document.getElementById('searchBtn');

input.addEventListener("input",(e)=>{
    const value = e.target.value.trim();
    // Only allow letters, spaces and hyphens
    if (!/^[a-zA-Z\s-]*$/.test(value)) {
        input.value = value.replace(/[^a-zA-Z\s-]/g, '');
    }
    // Disable submit button if input is empty
    submit.disabled = value.length === 0;
})
//Submit button functionality 
submit.addEventListener('click', async (e) => {
    e.preventDefault(); // This prevents the default form submission
    const city = input.value;
    try {
        const coordinates = await getCoordinates(city);
        if (coordinates) {
            const weatherData = await getWeatherData(coordinates.lat, coordinates.lon); //This function is used for getting weather data
            const forecastData = await getForecastData(coordinates.lat, coordinates.lon); //This function is used for getting forecast data
            displayWeather(weatherData);
            displayForecast(forecastData);
            saveRecentSearch(city); //For the recent search cities list updation
        }
    } catch (error) {
       alert(error.message);
    }
});

//To get the coordinates of a city by using geo API provided by openweatherAPI
async function getCoordinates(city) {
    try {
        const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
        const data = await response.json();
        if (data.length > 0) {
            return { lat: data[0].lat, lon: data[0].lon };
        } else {
            throw new Error('City not found');
        }
    } catch (error) {
        throw new Error('Error fetching coordinates');
    }
}

//To get the weather of particular searched city based on the Lat Long
async function getWeatherData(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('Error fetching weather data');
    }
}

//To get the forecast of particular searched city based on the Lat Long
async function getForecastData(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('Error fetching forecast data');
    }
}

//To Display the weather data on the webpage using DOM
function displayWeather(data) {
    const { name, main, weather, wind, sys } = data; //Destructuring data
    const { temp, feels_like, humidity } = main;
    const { description } = weather[0];
    const { speed } = wind;
    const { sunrise, sunset } = sys;

    document.getElementById('cityName').textContent = name;
    document.getElementById('temperature').textContent = `${Math.round(temp)}°`;
    document.getElementById('weatherDescription').textContent = description;
    document.getElementById('feelsLike').textContent = `Feels like: ${Math.round(feels_like)}°`;
    document.getElementById('humidity').textContent = `${humidity}%`;
    document.getElementById('windSpeed').textContent = `${Math.round(speed * 3.6)} km/h`; // Convert m/s to km/h

    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('lastUpdated').textContent = `Last updated: ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    document.getElementById('weatherAlert').textContent = ''; // Clear previous alerts
    document.getElementById('sunriseSunset').textContent = `${new Date(sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} / ${new Date(sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    document.getElementById('location').textContent = `Lat: ${data.coord.lat.toFixed(2)}, Lon: ${data.coord.lon.toFixed(2)}`;
}

function displayForecast(data) {
    const weeklyForecastContainer = document.getElementById('weeklyForecast');
    weeklyForecastContainer.innerHTML = ''; // Clear previous forecast cards
    const dailyForecasts = {};
    data.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        //To get the day of the week
        if (!dailyForecasts[day]) {
            dailyForecasts[day] = {
                temp: 0,
                icon: '',
                wind: 0,
                humidity: 0,
                date: date
            };
        }

        if (!dailyForecasts[day].icon) {
            dailyForecasts[day].temp = Math.round(forecast.main.temp);
            dailyForecasts[day].icon = forecast.weather[0].icon;
            dailyForecasts[day].wind = Math.round(forecast.wind.speed * 3.6); // Convert m/s to km/h
            dailyForecasts[day].humidity = forecast.main.humidity;
        }
    });

    // Display the next 5 days
    const sortedDays = Object.keys(dailyForecasts).sort((a, b) => dailyForecasts[a].date - dailyForecasts[b].date);
    sortedDays.slice(0, 5).forEach(day => {
        const forecast = dailyForecasts[day];
        const iconUrl = `http://openweathermap.org/img/wn/${forecast.icon}.png`;
        const forecastCard = `
            <div class="bg-white/5 rounded-xl p-4 text-center">
                <p class="text-sm text-gray-400">${day}</p>
                <img src="${iconUrl}" alt="weather icon" class="w-12 h-12 mx-auto mb-2">
                <p class="text-lg font-semibold">${forecast.temp}°</p>
                <p class="text-xs text-gray-400">Wind: ${forecast.wind} km/h</p>
                <p class="text-xs text-gray-400">Humidity: ${forecast.humidity}%</p>
            </div>
        `;
        weeklyForecastContainer.insertAdjacentHTML('beforeend', forecastCard);
    });
}

//Code for the recent search cities.

// Maximum number of recent searches to store
const MAX_RECENT_SEARCHES = 5;

// Function to get recent searches from localStorage
function getRecentSearches() {
    const searches = localStorage.getItem('recentSearches');
    return searches ? JSON.parse(searches) : [];
}

// Function to save recent searches to localStorage
function saveRecentSearch(city) {
    let searches = getRecentSearches();
    // Remove the city if it already exists (to avoid duplicates)
    searches = searches.filter(search => search.toLowerCase() !== city.toLowerCase());
    // Add the new city at the beginning
    searches.unshift(city);
    // Keep only the most recent searches
    searches = searches.slice(0, MAX_RECENT_SEARCHES);
    // Save to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(searches));
    // Update the UI
    displayRecentSearches();
}

// Function to delete a city from recent searches
function deleteRecentSearch(city) {
    let searches = getRecentSearches();
    searches = searches.filter(search => search !== city);
    localStorage.setItem('recentSearches', JSON.stringify(searches));
    displayRecentSearches();
}

// Function to display recent searches in the UI
function displayRecentSearches() {
    const searches = getRecentSearches();
    const recentSearchesContainer = document.getElementById('recentSearches');
    recentSearchesContainer.innerHTML = `
        <h3 class="text-sm font-semibold text-gray-400 mb-2">Recent Searches</h3>
        ${searches.length === 0 ? '<p class="text-sm text-gray-500">No recent searches</p>' : ''}
        <ul class="space-y-2">
            ${searches.map(city => `
                <li class="flex justify-between items-center bg-white/5 rounded-lg p-2">
                    <button class="text-sm text-gray-300 hover:text-white" onclick="searchCity('${city}')">${city}</button>
                    <button class="text-red-400 hover:text-red-300" onclick="deleteRecentSearch('${city}')">×</button>
                </li>
            `).join('')}
        </ul>
    `;
}

// Function to search city (to be used by recent searches)
function searchCity(city) {
    input.value = city;
    submit.click();
}

//For the initial data loading on the weather app
onload = async () => {
    displayRecentSearches(); //Invoking Recent searched cities from the Local Storage.
    const coordinates = await getCoordinates('Delhi');
    if (coordinates) {
        const weatherData = await getWeatherData(coordinates.lat, coordinates.lon);
        const forecastData = await getForecastData(coordinates.lat, coordinates.lon);
        displayWeather(weatherData);
        displayForecast(forecastData);
    }
} 

//Code for the current location weather.
const locationBtn = document.getElementById("locationBtn");
// Add click event listener for current location button
locationBtn.addEventListener('click', (e) => {
    e.preventDefault();
    getCurrentLocationWeather();
});

// Function to get current location weather
async function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            
            const { latitude: lat, longitude: lon } = position.coords;
            
            // Get and display weather data for current location
            const weatherData = await getWeatherData(lat, lon);
            const forecastData = await getForecastData(lat, lon);
            displayWeather(weatherData);
            displayForecast(forecastData);
            
            
            // Save the location name to recent searches
            if (weatherData.name) {
                console.log(weatherData.name);
                saveRecentSearch(weatherData.name);
            }
            
        } catch (error) {
            console.error("Error getting current location:", error);
            alert("Unable to get your current location. Please check your browser permissions.");
        }
    } else {
        alert("Geolocation is not supported by your browser");
    }
}

//Code for the dark mode.
const darkModeBtn = document.getElementById('darkModeBtn');

darkModeBtn.addEventListener("click", (e) => {
    if (document.body.style.backgroundColor === '') {
        document.body.style.backgroundColor = '#141414';
        darkModeBtn.innerHTML = '☀️'; // Sun emoji for light mode
    } else {
        document.body.style.backgroundColor = '';
        darkModeBtn.innerHTML = '🌙'; // Moon emoji for dark mode
    }
});
