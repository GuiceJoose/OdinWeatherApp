import "./assets/style.css";

const userInput = document.querySelector("input");
const form = document.querySelector("form");

form.addEventListener("submit", handleSubmit);
initializePage();

function handleSubmit(e) {
  e.preventDefault();
  showLocation();
  showWeatherData();
  userInput.value = "";
}

async function getCoords(location) {
  try {
    let locationName = location.replaceAll(" ", "%20");
    let coordsUrl =
      "http://api.openweathermap.org/geo/1.0/direct?q=" +
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
    const coords = await getCoords(userInput.value);
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
    let currentTemp = Math.round(convertKtoF(newData.current.temp));
    let highTemp = Math.round(convertKtoF(newData.daily[0].temp.max));
    let lowTemp = Math.round(convertKtoF(newData.daily[0].temp.min));
    let feelsLikeTemp = Math.round(convertKtoF(newData.current.feels_like));
    let humidity = Math.round(newData.current.humidity);
    let currentConditions = newData.current.weather[0].description;
    let windSpeed = Math.round(newData.current.wind_speed);
    let windDirection = newData.current.wind_deg;

    let weeklyForcast = getWeeklyForcast(newData.daily);
    let processedWeeklyForecast = weeklyForcast.map((x) => {
      let high = Math.round(convertKtoF(x.high));
      let low = Math.round(convertKtoF(x.low));
      let conditions = x.conditions;
      return { high, low, conditions };
    });

    return {
      currentTemp,
      highTemp,
      lowTemp,
      feelsLikeTemp,
      humidity,
      currentConditions,
      windSpeed,
      windDirection,
      processedWeeklyForecast,
    };
  } catch (err) {
    console.log(err);
  }
}

async function showWeatherData() {
  try {
    let dataToShow = await processWeatherData();

    const currentTempDisplay = document.getElementById("current-temp");
    currentTempDisplay.textContent = ` Current Temperature: ${dataToShow.currentTemp}°F`;

    const highTempDisplay = document.getElementById("high-temp");
    highTempDisplay.textContent = `High: ${dataToShow.highTemp}°F`;

    const lowTempDisplay = document.getElementById("low-temp");
    lowTempDisplay.textContent = `Low: ${dataToShow.lowTemp}°F`;

    const feelsLikeTempDisplay = document.getElementById("feels-like");
    feelsLikeTempDisplay.textContent = `Feels Like: ${dataToShow.feelsLikeTemp}°F`;

    const humidityDisplay = document.getElementById("humidity");
    humidityDisplay.textContent = `Humidity: ${dataToShow.humidity}%`;

    const currentConditionsDisplay =
      document.getElementById("current-conditions");
    currentConditionsDisplay.textContent = `Current Conditions ${dataToShow.currentConditions}`;

    const windSpeedDisplay = document.getElementById("wind-speed");
    windSpeedDisplay.textContent = `Wind Speed: ${dataToShow.windSpeed}`;

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
    const locationData = await getCoords(userInput.value);
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
  userInput.value = "Chicago";
  showWeatherData();
  showLocation();
  userInput.value = "";
}

function getWeeklyForcast(weeksWeather) {
  let weeklyForcast = weeksWeather.map((day) => {
    let high = day.temp.max;
    let low = day.temp.min;
    let conditions = day.weather[0].description;
    return { high, low, conditions };
  });
  return weeklyForcast;
}

function showWeeklyForecast(weeksForecast) {
  let weeklyForecastDisplay = document.getElementById("weekly-forecast");
  weeksForecast.forEach((day) => {
    let dayCard = makeWeekForcastCard(day);
    weeklyForecastDisplay.appendChild(dayCard);
  });
}

function makeWeekForcastCard(daysForecast) {
  const dayForecastDisplay = document.createElement("div");
  dayForecastDisplay.classList.add("day-card");
  const forecastedHighTempDisplay = document.createElement("div");
  const forecastedLowTempDisplay = document.createElement("div");
  const forecastedConditionsDisplay = document.createElement("div");

  forecastedHighTempDisplay.textContent = daysForecast.high;
  forecastedLowTempDisplay.textContent = daysForecast.low;
  forecastedConditionsDisplay.textContent = daysForecast.conditions;

  dayForecastDisplay.append(
    forecastedHighTempDisplay,
    forecastedLowTempDisplay,
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
