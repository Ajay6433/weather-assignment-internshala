# Weather Forecast App

This is a simple web application that displays current weather and a 5-day forecast for a given city or your current location.

## Features

*   **Current Weather**: Displays temperature, 'feels like' temperature, humidity, wind speed, and weather description.
*   **5-Day Forecast**: Provides a daily forecast including high/low temperatures and weather icons.
*   **Search by City**: Allows users to search for weather data by entering a city name.
*   **Current Location Weather**: Fetches weather data based on the user's current geographical location.
*   **Responsive Design**: Adapts to different screen sizes (desktop, iPad Mini, iPhone SE).
*   **Toggle Button**: Can be toggled between light and dark themes.

## Setup and Run

To run this project locally, follow these steps:

1.  **Clone the repository**:
    ```bash
    git clone <repository_url>
    ```

2.  **Get an API Key**: 
    This application uses the OpenWeatherMap API. You will need to obtain a free API key from their website:
    *   Go to [OpenWeatherMap](https://openweathermap.org/api)
    *   Sign up for a free account.
    *   Navigate to the 'API keys' tab to find your API key.

3.  **Update `script.js` with your API Key**:
    Open the `script.js` file and replace the `YOUR_API_KEY_HERE` placeholder with your actual OpenWeatherMap API key:
    ```javascript
    const API_KEY = "API_KEY"; // Replace with your OpenWeatherMap API key
    ```

4.  **Open `index.html`**: 
    Simply open the `index.html` file in your web browser. The application will automatically try to fetch weather data for your current location (if location services are enabled and permitted by your browser) or you can use the search bar to look up a city.