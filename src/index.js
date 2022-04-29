import "./assets/style.css";
import { format, fromUnixTime } from "date-fns";

const userInput = document.querySelector("input");
const form = document.querySelector("form");
const imperialButton = document.getElementById("imperial");
const metricButton = document.getElementById("metric");
let lastSearch = "Chicago";
let changeUnits = false;

imperialButton.addEventListener("click", switchToImperial);
metricButton.addEventListener("click", switchToMetric);
form.addEventListener("submit", handleSubmit);

initializePage();

function handleSubmit(e) {
  lastSearch = userInput.value;
  e.preventDefault();
  showLocation();
  showWeatherData();
  userInput.value = "";
  animateForecast();
  animateMainContent();
}

async function getCoords(location) {
  try {
    let locationName = location.replaceAll(" ", "%20");
    let coordsUrl =
      "https://api.openweathermap.org/geo/1.0/direct?q=" +
      locationName +
      "&limit=1&appid=151004f44b0dc03bef1221eb4dff0ac0";

    const response = await fetch(coordsUrl, { mode: "cors" });
    const coordsData = await response.json();

    const lat = coordsData[0].lat;
    const lon = coordsData[0].lon;
    const country = coordsData[0].country;
    const state = coordsData[0].state;
    const name = coordsData[0].name;

    console.log(coordsData);

    return { lat, lon, country, state, name };
  } catch (err) {
    console.log(err);
  }
}

async function getWeather() {
  try {
    const coords = await getCoords(lastSearch);
    const lat = coords.lat;
    const lon = coords.lon;

    let weatherUrl =
      "https://api.openweathermap.org/data/2.5/onecall?lat=" +
      lat +
      "&lon=" +
      lon +
      "&appid=151004f44b0dc03bef1221eb4dff0ac0";

    const response = await fetch(weatherUrl, { mode: "cors" });
    const weatherData = await response.json();
    console.log(weatherData);
    return weatherData;
  } catch (err) {
    console.log(err);
  }
}

async function processWeatherData() {
  try {
    let newData = await getWeather();
    if (imperialButton.classList.contains("active")) {
      let currentTemp = Math.round(convertKtoF(newData.current.temp)) + "°F";
      let highTemp = Math.round(convertKtoF(newData.daily[0].temp.max)) + "°F";
      let lowTemp = Math.round(convertKtoF(newData.daily[0].temp.min)) + "°F";
      let feelsLikeTemp =
        Math.round(convertKtoF(newData.current.feels_like)) + "°F";
      let humidity = Math.round(newData.current.humidity);
      let currentConditions = newData.current.weather[0].description;
      let currentConditionsIcon = newData.current.weather[0].icon;
      let windSpeed =
        Math.round(
          convertMetersPerSecondToMilesPerHour(newData.current.wind_speed)
        ) + "mph";
      let windDirection = newData.current.wind_deg;

      let weeklyForcast = getWeeklyForcast(newData.daily);
      let processedWeeklyForecast = weeklyForcast.map((x) => {
        let time = format(fromUnixTime(x.time), "EEEE");
        let high = Math.round(convertKtoF(x.high)) + "°F";
        let low = Math.round(convertKtoF(x.low)) + "°F";
        let conditionsIcon = x.conditionsIcon;
        let conditions = x.conditions;

        return { time, high, low, conditionsIcon, conditions };
      });
      return {
        currentTemp,
        highTemp,
        lowTemp,
        feelsLikeTemp,
        humidity,
        currentConditions,
        currentConditionsIcon,
        windSpeed,
        windDirection,
        processedWeeklyForecast,
      };
    } else if (metricButton.classList.contains("active")) {
      let currentTemp = Math.round(convertKtoC(newData.current.temp)) + "°C";
      let highTemp = Math.round(convertKtoC(newData.daily[0].temp.max)) + "°C";
      let lowTemp = Math.round(convertKtoC(newData.daily[0].temp.min)) + "°C";
      let feelsLikeTemp =
        Math.round(convertKtoC(newData.current.feels_like)) + "°C";
      let humidity = Math.round(newData.current.humidity);
      let currentConditions = newData.current.weather[0].description;
      let currentConditionsIcon = newData.current.weather[0].icon;
      let windSpeed =
        Math.round(
          convertMetersPerSecondToKilometersPerHours(newData.current.wind_speed)
        ) + "kph";
      let windDirection = newData.current.wind_deg;

      let weeklyForcast = getWeeklyForcast(newData.daily);
      let processedWeeklyForecast = weeklyForcast.map((x) => {
        let time = format(fromUnixTime(x.time), "EEEE");
        let high = Math.round(convertKtoC(x.high)) + "°C";
        let low = Math.round(convertKtoC(x.low)) + "°C";
        let conditionsIcon = x.conditionsIcon;
        let conditions = x.conditions;

        return { time, high, low, conditionsIcon, conditions };
      });
      return {
        currentTemp,
        highTemp,
        lowTemp,
        feelsLikeTemp,
        humidity,
        currentConditions,
        currentConditionsIcon,
        windSpeed,
        windDirection,
        processedWeeklyForecast,
      };
    }
  } catch (err) {
    console.log(err);
  }
}

async function showWeatherData() {
  try {
    let dataToShow = await processWeatherData();

    const currentTempDisplay = document.getElementById("current-temp");
    currentTempDisplay.textContent = ` Current Temperature: ${dataToShow.currentTemp}`;

    const highTempDisplay = document.getElementById("high-temp");
    highTempDisplay.textContent = `High: ${dataToShow.highTemp}`;

    const lowTempDisplay = document.getElementById("low-temp");
    lowTempDisplay.textContent = `Low: ${dataToShow.lowTemp}`;

    const feelsLikeTempDisplay = document.getElementById("feels-like");
    feelsLikeTempDisplay.textContent = `Feels Like: ${dataToShow.feelsLikeTemp}`;

    const humidityDisplay = document.getElementById("humidity");
    humidityDisplay.textContent = `Humidity: ${dataToShow.humidity}%`;

    const currentConditionsIconDisplay = document.getElementById(
      "current-conditions-icon"
    );
    currentConditionsIconDisplay.src =
      "https://openweathermap.org/img/wn/" +
      dataToShow.currentConditionsIcon +
      "@4x.png";

    const currentConditionsDisplay =
      document.getElementById("current-conditions");
    currentConditionsDisplay.textContent = `Current Conditions: ${dataToShow.currentConditions}`;

    const windSpeedDisplay = document.getElementById("wind-speed");
    windSpeedDisplay.textContent = dataToShow.windSpeed;

    const windDirectionDisplay = document.getElementById("wind-direction");
    windDirectionDisplay.style.transform =
      "rotate(" + (180 + dataToShow.windDirection - 90) + "deg)";

    showWeeklyForecast(dataToShow.processedWeeklyForecast);
  } catch (err) {
    console.log(err);
  }
}

async function showLocation() {
  try {
    const locationData = await getCoords(lastSearch);
    const country = locationData.country;
    const state = locationData.state;
    const name = locationData.name;

    const countryDisplay = document.getElementById("location-country");
    countryDisplay.textContent = country;

    const stateDisplay = document.getElementById("location-state");
    stateDisplay.textContent = state;

    const nameDisplay = document.getElementById("location-name");
    nameDisplay.textContent = name;
  } catch (err) {
    console.log(err);
  }
}

function initializePage() {
  lastSearch = "Chicago";
  showWeatherData();
  showLocation();
}

function getWeeklyForcast(weeksWeather) {
  let weeklyForcast = weeksWeather.map((day) => {
    let time = day.dt;
    let high = day.temp.max;
    let low = day.temp.min;
    let conditionsIcon = day.weather[0].icon;
    let conditions = day.weather[0].description;
    return { time, high, low, conditionsIcon, conditions };
  });
  return weeklyForcast;
}

function showWeeklyForecast(weeksForecast) {
  let weeklyForecastDisplay = document.getElementById("weekly-forecast");
  weeklyForecastDisplay.innerHTML = "";
  weeksForecast.forEach((day, index) => {
    if (index != 0) {
      let dayCard = makeWeekForcastCard(day);
      weeklyForecastDisplay.appendChild(dayCard);
    }
  });
}

function makeWeekForcastCard(daysForecast) {
  const dayForecastDisplay = document.createElement("div");
  dayForecastDisplay.classList.add("day-card");
  const forecastDateDisplay = document.createElement("h4");
  const forecastedHighTempDisplay = document.createElement("div");
  const forecastedLowTempDisplay = document.createElement("div");
  const forecastedConditionsIconDisplay = document.createElement("img");
  const forecastedConditionsDisplay = document.createElement("div");

  forecastDateDisplay.textContent = daysForecast.time;
  forecastedHighTempDisplay.textContent = daysForecast.high;
  forecastedLowTempDisplay.textContent = daysForecast.low;
  forecastedConditionsIconDisplay.src =
    "https://openweathermap.org/img/wn/" +
    daysForecast.conditionsIcon +
    "@2x.png";
  forecastedConditionsDisplay.textContent = daysForecast.conditions;

  dayForecastDisplay.append(
    forecastDateDisplay,
    forecastedHighTempDisplay,
    forecastedLowTempDisplay,
    forecastedConditionsIconDisplay,
    forecastedConditionsDisplay
  );
  return dayForecastDisplay;
}

function convertKtoC(tempInK) {
  const tempInC = parseInt(tempInK) - 273.15;
  return tempInC;
}

function convertKtoF(tempInK) {
  const tempInC = convertKtoC(tempInK);
  const tempInF = convertCtoF(tempInC);
  return tempInF;
}

function convertCtoF(tempInC) {
  const tempInF = tempInC * (9 / 5) + 32;
  return tempInF;
}

function convertFtoC(tempInF) {
  const tempInC = (tempInF - 32) * (5 / 9);
  return tempInC;
}

function convertMetersPerSecondToMilesPerHour(mps) {
  const mph = mps * 2.23694;
  return mph;
}

function convertMetersPerSecondToKilometersPerHours(mps) {
  const kmph = mps * 3.6;
  return kmph;
}

function switchToImperial() {
  if (imperialButton.classList.contains("active")) {
    return;
  }
  metricButton.classList.remove("active");
  imperialButton.classList.add("active");
  showWeatherData();
}

function switchToMetric() {
  if (metricButton.classList.contains("active")) {
    return;
  }
  imperialButton.classList.remove("active");
  metricButton.classList.add("active");
  showWeatherData();
}

function animateForecast() {
  let forecastDisplay = document.getElementById("weekly-forecast");
  forecastDisplay.classList.add("slide");
  setTimeout(() => {
    forecastDisplay.classList.remove("slide");
  }, 2500);
}

function animateMainContent() {
  let mainContentDisplay = document.getElementById("main-content");
  mainContentDisplay.classList.add("slide");
  setTimeout(() => {
    mainContentDisplay.classList.remove("slide");
  }, 2500);
}
