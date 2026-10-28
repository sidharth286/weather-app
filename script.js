
const API_KEY = "6b48093729187049e465c9fee7027e87";

let currentCity = "";


async function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("City not found!");
    }

    const data = await response.json();

    return data;
}


async function searchWeather() {
    const city = document.getElementById("city").value.trim();

    if (city === "") {
        document.getElementById("error").textContent =
            "Please enter a city name";
        return;
    }

    document.getElementById("loading").textContent = "Loading...";
    document.getElementById("error").textContent = "";

    try {
        const data = await getWeather(city);

        currentCity = data.name;

        document.getElementById("cityName").textContent = data.name;
        document.getElementById("temperature").textContent =
            Math.round(data.main.temp) + "°C";

        document.getElementById("description").textContent =
            data.weather[0].description;

        document.getElementById("details").textContent =
            "Humidity: " + data.main.humidity +
            "% | Wind: " + data.wind.speed + " m/s";

        document.getElementById("loading").textContent = "";

     
        await getForecast(city);

    } catch (error) {
        document.getElementById("error").textContent = error.message;
        document.getElementById("loading").textContent = "";
    }
}


async function getForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Forecast unavailable");
        }

        const data = await response.json();
        const forecast = document.getElementById("forecast");

        forecast.innerHTML = "";

        
        const days = {};

        data.list.forEach(item => {
            const date = item.dt_txt.split(" ")[0];

            if (!days[date] || item.dt_txt.includes("12:00:00")) {
                days[date] = item;
            }
        });

        Object.values(days).slice(0, 5).forEach(item => {
            const day = document.createElement("div");
            day.className = "day";

            day.innerHTML = `
                <p>${item.dt_txt.split(" ")[0]}</p>
                <p>${Math.round(item.main.temp)}°C</p>
                <p>${item.weather[0].description}</p>
            `;

            forecast.appendChild(day);
        });

    } catch (error) {
        document.getElementById("error").textContent = error.message;
    }
}

function addFavorite() {
    if (currentCity === "") {
        return;
    }

    let favorites = JSON.parse(
        localStorage.getItem("favorites") || "[]"
    );

    if (favorites.includes(currentCity)) {
        return;
    }

    favorites.push(currentCity);

    localStorage.setItem("favorites", JSON.stringify(favorites));

    loadFavorites();
}


function loadFavorites() {
    const favorites = JSON.parse(
        localStorage.getItem("favorites") || "[]"
    );

    const list = document.getElementById("favorites");
    list.innerHTML = "";

    favorites.forEach(city => {
        const item = document.createElement("div");
        item.className = "favorite";

        const button = document.createElement("button");
        button.textContent = city;

        button.onclick = () => {
            document.getElementById("city").value = city;
            searchWeather();
        };

        const remove = document.createElement("button");
        remove.textContent = "Remove";

        remove.onclick = () => {
            let updated = favorites.filter(name => name !== city);

            localStorage.setItem(
                "favorites",
                JSON.stringify(updated)
            );

            loadFavorites();
        };

        item.append(button, remove);
        list.appendChild(item);
    });
}


document.getElementById("searchBtn").addEventListener("click", searchWeather);


document.getElementById("favoriteBtn").addEventListener("click", addFavorite);


document.getElementById("themeBtn").addEventListener("click", function() {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        this.textContent = "Light Mode";
    } else {
        this.textContent = "Dark Mode";
    }
});


loadFavorites();
