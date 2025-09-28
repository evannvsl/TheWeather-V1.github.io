const cityinput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');

const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');

const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');

const forecastItemsContainer = document.querySelector('.forecast-items-container');

const apiKey = '77650043b0f0506c859c7b8b4a801422';

searchBtn.addEventListener('click', () => {
    if (cityinput.value.trim() != '') {
        updateWeatherInfo(cityinput.value);
        cityinput.value = '';
        cityinput.blur();
    }
});

cityinput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && cityinput.value.trim() != '') {
        updateWeatherInfo(cityinput.value);
        cityinput.value = '';
        cityinput.blur();
    }
});

async function getFetchData(endPoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric&lang=id`;
    const response = await fetch(apiUrl);
    return response.json();
}

function getWeatherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg';
    if (id <= 321) return 'drizzle.svg';
    if (id <= 531) return 'rain.svg';
    if (id <= 622) return 'snow.svg';
    if (id <= 781) return 'atmosphere.svg';
    if (id === 800) return 'clear.svg';
    return 'clouds.svg';
}

function currentDate() {
    const currentDate = new Date();
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
    };
    return currentDate.toLocaleDateString('en-GB', options);
}

async function updateWeatherInfo(city) {
    // fade out dulu
    weatherInfoSection.classList.remove("show");
    weatherInfoSection.classList.add("fade");

    const weatherData = await getFetchData('weather', city);

    if (weatherData.cod != 200) {
        showDisplaySection(notFoundSection);
        return;
    }

    const {
        name: country,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed }
    } = weatherData;

    // tunggu biar animasi keluar dulu
    setTimeout(() => {
        countryTxt.textContent = country;
        tempTxt.textContent = Math.round(temp) + '°C';
        conditionTxt.textContent = main;
        humidityValueTxt.textContent = humidity + '%';
        windValueTxt.textContent = speed + 'm/s';

        currentDateTxt.textContent = currentDate();
        weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

        // tampilkan + animasi fade in
        showDisplaySection(weatherInfoSection);
        setTimeout(() => {
            weatherInfoSection.classList.add("show");
        }, 50);
    }, 300);

    await updateForecastInfo(city);
}

async function updateForecastInfo(city) {
    const forecastData = await getFetchData('forecast', city);

    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];

    forecastItemsContainer.innerHTML = '';
    forecastData.list.forEach((forecastWeather, index) => {
        if (forecastWeather.dt_txt.includes(timeTaken) &&
            !forecastWeather.dt_txt.includes(todayDate)) {
            updateForecastItems(forecastWeather, index);
        }
    });
}

function updateForecastItems(weatherData, index) {
    const {
        dt_txt,
        weather: [{ id }],
        main: { temp }
    } = weatherData;

    const date = new Date(dt_txt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short'
    });

    const forecastItem = `
        <div class="forecast-item" style="animation-delay:${index * 0.09}s">
            <h5 class="forecast-item-date reguler-txt">${date}</h5>
            <img src="assets/weather/${getWeatherIcon(id)}" class="forecast-item-img" alt="forecast icon">
            <h5 class="forecast-item-temp reguler-txt">${Math.round(temp)}°C</h5>
        </div>
    `;

    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
    const lastItem = forecastItemsContainer.lastElementChild;
    lastItem.classList.add("show");
}

function showDisplaySection(section) {
    [weatherInfoSection, notFoundSection, searchCitySection]
        .forEach(sec => {
            sec.style.display = 'none';
            sec.classList.remove('show-animation');
        });

    section.style.display = 'flex';
    void section.offsetWidth; // retrigger animasi
    section.classList.add('show-animation');
}

// Parallax efek background (ikut mouse)
document.addEventListener("mousemove", (e) => {
    let x = (e.clientX / window.innerWidth) * 20;
    let y = (e.clientY / window.innerHeight) * 20;
    document.body.style.backgroundPosition = `${50 - x}% ${50 - y}%`;
});
 