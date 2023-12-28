// Constants
const apiKey = "07990665a4fcd6b5ff1bda4694aeda80";
const searchHistoryContainer = $("#search-history-container");
const currentTitle = $("#current-title");
const currentIcon = $("#current-weather-icon");
const currentTemperature = $("#current-temperature");
const currentHumidity = $("#current-humidity");
const currentWindSpeed = $("#current-wind-speed");
const currentUvIndex = $("#current-uv-index");
const currentNumber = $("#current-number");
const futureForecastTitle = $("#future-forecast-title");

let savedSearches = [];

// Create a search history entry
const createSearchHistoryEntry = (cityName) => {
  const searchHistoryEntry = $('<p>')
    .addClass("past-search")
    .text(cityName);
  const searchEntryContainer = $('<div>')
    .addClass("past-search-container")
    .append(searchHistoryEntry);
  searchHistoryContainer.append(searchEntryContainer);
};

// Save the search history
const saveSearchHistory = () => {
  localStorage.setItem("savedSearches", JSON.stringify(savedSearches));
};

// Load the search history from local storage
const loadSearchHistory = () => {
  const savedSearchHistory = localStorage.getItem("savedSearches");
  if (savedSearchHistory) {
    savedSearches = JSON.parse(savedSearchHistory);
    savedSearches.forEach(createSearchHistoryEntry);
  }
};

// Display current weather conditions
const displayCurrentWeather = ({ current }, cityName) => {
  currentTitle.text(`${cityName} (${moment().format("M/D/YYYY")})`);
  currentIcon.attr("src", `https://openweathermap.org/img/wn/${current.weather[0].icon}.png`);
  currentTemperature.text(`Temperature: ${current.temp} °F`);
  currentHumidity.text(`Humidity: ${current.humidity}%`);
  currentWindSpeed.text(`Wind Speed: ${current.wind_speed} MPH`);
  currentUvIndex.text("UV Index: ");
  currentNumber.text(current.uvi);
  
  currentNumber.removeClass("favorable moderate severe"); // Reset class

  if (current.uvi <= 2) {
    currentNumber.addClass("favorable");
  } else if (current.uvi >= 3 && current.uvi <= 7) {
    currentNumber.addClass("moderate");
  } else {
    currentNumber.addClass("severe");
  }
};

// Display the 5-day forecast
const displayFiveDayForecast = ({ daily }) => {
  futureForecastTitle.text("5-Day Forecast:");

  const dailyForecasts = daily.slice(1, 6); // Only take next 5 days

  dailyForecasts.forEach((forecast, i) => {
    $(`#future-date-${i + 1}`).text(moment.unix(forecast.dt).format("M/D/YYYY"));
    $(`#future-icon-${i + 1}`).attr("src", `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`);
    $(`#future-temp-${i + 1}`).text(`Temp: ${forecast.temp.day} °F`);
    $(`#future-humidity-${i + 1}`).text(`Humidity: ${forecast.humidity}%`);
  });
};

// Fetch current weather data and display it
const fetchAndDisplayCurrentWeather = (cityName) => {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
    .then(response => response.json())
    .then(({ coord }) => fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`))
    .then(response => response.json())
    .then(data => {
      displayCurrentWeather(data, cityName);
      createSearchHistoryEntry(cityName);
      saveSearchHistory();
      displayFiveDayForecast(data);
    })
    .catch(() => {
      alert("We could not find the city you searched for. Try searching for a valid city.");
    });
};

// Event listener for the search form submission
$("#search-form").on("submit", function (event) {
  event.preventDefault();
  const cityName = $("#search-input").val().trim();

  if (cityName === "") {
    alert("Please enter the name of a city.");
  } else {
    fetchAndDisplayCurrentWeather(cityName);
    $(this)[0].reset(); // Clear the input field after submission
  }
});

// Event listener for the search history entries
searchHistoryContainer.on("click", "p", function () {
  const cityName = $(this).text();
  fetchAndDisplayCurrentWeather(cityName);
  $(this).remove();
});

loadSearchHistory();
