// Global variables
const apiKey = "1b18ce13c84e21faafb19c931bb29331";
let savedSearches = [];

// Create a search history entry
const createSearchHistoryEntry = (cityName) => {
  const searchHistoryEntry = $('<p>').addClass("past-search").text(cityName);
  const searchEntryContainer = $('<div>').addClass("past-search-container").append(searchHistoryEntry);
  $("#search-history-container").append(searchEntryContainer);
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
    savedSearches.forEach(cityName => createSearchHistoryEntry(cityName));
  }
};

// Display current weather conditions
const displayCurrentWeather = (response, cityName) => {
  const { coord, current } = response;
  const { lon, lat } = coord;

  const currentTitle = $("#current-title");
  currentTitle.text(`${cityName} (${moment().format("M/D/YYYY")})`);

  const currentIcon = $("#current-weather-icon");
  currentIcon.attr("src", `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`);

  const currentTemperature = $("#current-temperature");
  currentTemperature.text(`Temperature: ${current.temp} °F`);

  const currentHumidity = $("#current-humidity");
  currentHumidity.text(`Humidity: ${current.humidity}%`);

  const currentWindSpeed = $("#current-wind-speed");
  currentWindSpeed.text(`Wind Speed: ${current.wind_speed} MPH`);

  const currentUvIndex = $("#current-uv-index");
  currentUvIndex.text("UV Index: ");

  const currentNumber = $("#current-number");
  currentNumber.text(current.uvi);

  if (current.uvi <= 2) {
    currentNumber.addClass("favorable");
  } else if (current.uvi >= 3 && current.uvi <= 7) {
    currentNumber.addClass("moderate");
  } else {
    currentNumber.addClass("severe");
  }
};

// Display the 5-day forecast
const displayFiveDayForecast = (response) => {
  const futureForecastTitle = $("#future-forecast-title");
  futureForecastTitle.text("5-Day Forecast:");

  for (let i = 1; i <= 5; i++) {
    const futureDate = $(`#future-date-${i}`);
    futureDate.text(moment().add(i, "d").format("M/D/YYYY"));

    const futureIcon = $(`#future-icon-${i}`);
    futureIcon.attr("src", `https://openweathermap.org/img/wn/${response.daily[i].weather[0].icon}@2x.png`);

    const futureTemp = $(`#future-temp-${i}`);
    futureTemp.text(`Temp: ${response.daily[i].temp.day} °F`);

    const futureHumidity = $(`#future-humidity-${i}`);
    futureHumidity.text(`Humidity: ${response.daily[i].humidity}%`);
  }
};

// Fetch current weather data and display it
const fetchAndDisplayCurrentWeather = (cityName) => {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
    .then(response => response.json())
    .then(response => {
      const { coord } = response;
      const { lon, lat } = coord;

      fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`)
        .then(response => response.json())
        .then(response => {
          displayCurrentWeather(response, cityName);
          createSearchHistoryEntry(cityName);
          saveSearchHistory();
          displayFiveDayForecast(response);
        });
    })
    .catch((err) => {
      alert("We could not find the city you searched for. Try searching for a valid city.");
    });
};

// Event listener for the search form submission
$("#search-form").on("submit", function (event) {
  event.preventDefault();
  const cityName = $("#search-input").val();

  if (cityName === "" || cityName == null) {
    alert("Please enter the name of a city.");
  } else {
    fetchAndDisplayCurrentWeather(cityName);
  }
});

// Event listener for the search history entries
$("#search-history-container").on("click", "p", function () {
  const cityName = $(this).text();
  fetchAndDisplayCurrentWeather(cityName);
  $(this).remove();
});

loadSearchHistory();
