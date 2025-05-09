import React, { useState, useEffect } from "react";
import { FaCloudSun, FaTemperatureHigh, FaWind, FaTint, FaSun, FaCloud, FaCloudRain } from "react-icons/fa";
import Heading from "../../components/heading/Heading";
import { useSelector } from "react-redux";

function WeatherPredictions() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userLocation = useSelector((state) => state.userLocationReducer);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        const API_KEY = "02f85c5bf12e400fa7d121519250905"; 
        const response = await fetch(
          `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${userLocation[1]},${userLocation[0]}&days=7&aqi=no&alerts=no`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        setWeatherData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load weather data. Please try again later.');
        console.error('Error fetching weather:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userLocation && userLocation.length === 2) {
      fetchWeatherData();
    }
  }, [userLocation]);

  const getWeatherIcon = (condition) => {
    const conditionText = condition.toLowerCase();
    if (conditionText.includes('sunny') || conditionText.includes('clear')) {
      return <FaSun className="text-4xl text-yellow-500" />;
    } else if (conditionText.includes('rain') || conditionText.includes('drizzle')) {
      return <FaCloudRain className="text-4xl text-blue-500" />;
    } else if (conditionText.includes('cloud')) {
      return <FaCloud className="text-4xl text-gray-500" />;
    }
    return <FaCloudSun className="text-4xl text-yellow-500" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="text-center text-gray-600 p-4">
        No weather data available. Please check your location settings.
      </div>
    );
  }

  return (
    <div className="p-4">
      <Heading text="Weather Predictions" textAlign="text-left" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {weatherData.forecast.forecastday.map((day) => (
          <div key={day.date} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>
            <div className="flex items-center justify-center mb-4">
              {getWeatherIcon(day.day.condition.text)}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <FaTemperatureHigh className="text-red-500 mr-2" />
                <span>{Math.round(day.day.maxtemp_c)}°C / {Math.round(day.day.mintemp_c)}°C</span>
              </div>
              <div className="flex items-center">
                <FaWind className="text-blue-500 mr-2" />
                <span>{Math.round(day.day.maxwind_kph)} km/h</span>
              </div>
              <div className="flex items-center">
                <FaTint className="text-blue-400 mr-2" />
                <span>{day.day.daily_chance_of_rain}%</span>
              </div>
              <div className="text-sm text-gray-600">
                {day.day.condition.text}
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>UV Index: {day.day.uv}</p>
              <p>Humidity: {day.day.avghumidity}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeatherPredictions; 