
const API_KEY = 'acf1b95965b4e7cb78a53a9b404bf797';

const input = document.getElementById("Input");
const btn = document.getElementById("Btn");
const weatherResult = document.getElementById("weatherResult");
const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const STORAGE_KEY = "weatherSearchHistory";
const MAX_HISTORY = 3;

window.addEventListener("DOMContentLoaded", () => {
  loadSearchHistory();
});

btn.addEventListener("click", getWeather);

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    getWeather();
  }
});

clearHistoryBtn.addEventListener("click", clearHistory);

function saveToHistory(city) {
  let history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  history = history.filter(c => c.toLowerCase() !== city.toLowerCase());
  history.unshift(city);
  history = history.slice(0, MAX_HISTORY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  loadSearchHistory();
}

function loadSearchHistory() {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  historyList.innerHTML = "";
  
  if (history.length === 0) {
    historySection.style.display = "none";
    return;
  }
  
  history.forEach(city => {
    const historyBtn = document.createElement("button");
    historyBtn.className = "history-item";
    historyBtn.textContent = city;
    historyBtn.addEventListener("click", () => {
      input.value = city;
      getWeather();
    });
    historyList.appendChild(historyBtn);
  });
  
  historySection.style.display = "block";
}

function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
  loadSearchHistory();
}

async function getWeather() {
  const city = input.value.trim();

  if (!city) {
    weatherResult.innerHTML = '<p style="color: #764ba2; font-weight: bold; padding: 10px; margin: 10px 0; background: #f5f7fa; border-radius: 8px;">Please enter a city name!</p>';
    return;
  }


  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error("City not found!");
    }

    const data = await response.json();
    console.log(JSON.stringify(data));

    saveToHistory(city);
    displayWeather(data); 
  } catch (error) {
    weatherResult.innerHTML = `<p style="color: #f5576c; border: 2px solid #f5576c; font-weight: bold; padding: 10px; margin: 10px 0; background: #fff5f7; border-radius: 8px;">Error: ${error.message}</p>`;
  }
}

function displayWeather(data) {
  const { name, sys, main, weather, wind } = data;

  const weatherHTML = `
    <div class="weather-card">
      <h4>${name}, ${sys.country}</h4>

      <div class="weather-main">
        <div class="temperature" >${Math.round(main.temp)}°C</div>
      </div>

      <div class="location" style="margin:3px;"> 
        <span>coordinates: ${data.coord.lat}, ${data.coord.lon}</span>
      </div>

        <p class="description">${weather[0].description.toUpperCase()}</p>
      
        <div class="weather-details">
        <div class="detail" style="margin:3px;">
          <span>Feels Like: ${Math.round(main.feels_like)}°C</span>
        </div>

        <div class="detail" style="margin:3px;">
          <span>Humidity: ${main.humidity}%</span>
        </div>

        <div class="detail" style="margin:3px;">
          <span>Pressure: ${main.pressure} hPa</span>
        </div>

        <div class="detail" style="margin:3px;">
          <span>Wind Speed: ${wind.speed} m/s</span>
        </div>
           
      </div>
    </div>
  `;

  weatherResult.innerHTML = weatherHTML;
}