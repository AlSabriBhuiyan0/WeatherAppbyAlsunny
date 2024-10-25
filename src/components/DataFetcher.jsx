/* eslint-disable no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Header from "./Header";
import Carousel from "./Carousel";
import Forecast from "./Forecast";
import axios from "axios";
import "../assets/styles/index.css";

// Fallback data in case of API failure
const fallbackData = {
  location: { name: "Dhaka", localtime: "2024-01-01 12:00" },
  current: {
    temp_c: 20,
    condition: {
      text: "Sunny",
      icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
    },
    feelslike_c: 22,
    humidity: 50,
    wind_kph: 10,
    uv: 5,
  },
  forecast: {
    forecastday: [
      // Add mock forecast data for 3 days
    ],
  },
};

function DataFetcher() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWithRetry = async (retries = 3, delay = 1000) => {
    try {
      const response = await axios.get(
        `https://api.weatherapi.com/v1/forecast.json?key=${
          import.meta.env.VITE_WEATHER_API_KEY
        }&q=Dhaka&days=3&aqi=no&alerts=no`
      );
      return response.data;
    } catch (error) {
      if (retries > 0 && error.response && error.response.status === 429) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      }
      throw error;
    }
  };

  useEffect(() => {
    localStorage.removeItem("weatherData");
    localStorage.removeItem("weatherDataTime");
    const fetchData = async () => {
      try {
        const data = await fetchWithRetry();
        setWeatherData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setError("Failed to fetch weather data. Using fallback data.");
        setWeatherData(fallbackData);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!weatherData) return null;

  //Data destructuring
  const { location, current, forecast } = weatherData;
  const { name: title, localtime: currentTime } = location;
  const {
    temp_c: temprature,
    condition,
    feelslike_f,
    heatindex_c,
    humidity,
    uv,
    wind_kph,
    windchill_c,
  } = current;
  const { text: conditionToday, icon: icon, is_day: is_day } = condition;
  const { forecastday } = forecast;

  const conatinerStyle = {
    backgroundColor: is_day ? "skyblue" : "black",
    color: is_day ? "black" : "white",
  };

  return (
    <div style={conatinerStyle} className="h-100">
      <Header
        title={title}
        time={currentTime}
        tempreture={temprature}
        condition={conditionToday}
        icon={icon}
        is_day={is_day}
        feelslike_c={feelslike_f}
        heatindex_c={heatindex_c}
        humidity={humidity}
        uv={uv}
        wind_kph={wind_kph}
        windchill_c={windchill_c}
        isDay={is_day}
      />

      <main className="container h-100">
        <div className="row">
          <div className="col-12">
            <Carousel eachHour={forecastday[0].hour} />
          </div>
          <div className="col-12 mt-3">
            <div className="overflow-auto">
              <Forecast forecast={forecastday} />
            </div>
          </div>
        </div>
        <p className="text-center fst-italic text-primary p-3">
          <a href="https://github.com/alsabribhuiyan0">
            @http://www.alsunny.live/
          </a>
        </p>
      </main>
    </div>
  );
}

export default DataFetcher;
