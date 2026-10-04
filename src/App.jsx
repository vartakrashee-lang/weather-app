import { useState, useEffect } from "react"
import "./App.css"

function App() {
  const [city, setCity] = useState("")
  const [places, setPlaces] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [weather, setWeather] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [lastUpdated, setLastUpdated] = useState("")

  async function searchCities(value) {
    setCity(value)
    setSelectedPlace(null)

    if (value.trim().length === 0) {
      setPlaces([])
      setShowDropdown(false)
      return
    }

    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        value
      )}&count=10&language=en&format=json`
    )

    const data = await response.json()

    if (data.results) {
      const uniqueCities = []
      const seen = new Set()

      data.results.forEach((place) => {
        const key = `${place.name}-${place.country}`

        if (!seen.has(key)) {
          seen.add(key)
          uniqueCities.push(place)
        }
      })

      setPlaces(uniqueCities.slice(0, 6))
      setShowDropdown(true)
    } else {
      setPlaces([])
      setShowDropdown(true)
    }
  }

  function selectCity(place) {
    setSelectedPlace(place)
    setCity(`${place.name}, ${place.country}`)
    setPlaces([])
    setShowDropdown(false)
  }

  async function getWeather() {
    if (!selectedPlace) {
      alert("Please select a city from the dropdown")
      return
    }
const response = await fetch(
  `https://weather-app-ax7f.onrender.com/weather?latitude=${selectedPlace.latitude}&longitude=${selectedPlace.longitude}`
)

    const data = await response.json()

    let condition = "Clear"
    let icon = "☀️"

    if (data.current.weather_code >= 1 && data.current.weather_code <= 3) {
      condition = "Cloudy"
      icon = "☁️"
    } else if (data.current.weather_code >= 51) {
      condition = "Rainy"
      icon = "🌧️"
    }

    setWeather({
      name: selectedPlace.name,
      country: selectedPlace.country,
      latitude: selectedPlace.latitude,
      longitude: selectedPlace.longitude,
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      wind: data.current.wind_speed_10m,
      condition: condition,
      icon: icon
    })

    setLastUpdated(new Date().toLocaleTimeString())
  }

  useEffect(() => {
    if (!weather) return

    const interval = setInterval(() => {
      getWeather()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [weather])

  return (
    <div className="app">

      <div className="weather-container">

        <h1>☀️Weather App </h1>

        <p className="subtitle">
          Search and select a city
        </p>

        <div className="city-dropdown">

          <div className="dropdown-input">

            <input
              type="text"
              value={city}
              placeholder="Search or select a city"
              onFocus={() => {
                if (places.length > 0) {
                  setShowDropdown(true)
                }
              }}
              onChange={(e) => searchCities(e.target.value)}
            />

            <span className="arrow">▼</span>

          </div>

          {showDropdown && (
            <div className="dropdown-menu">

              {places.length > 0 ? (
                places.map((place, index) => (
                  <div
                    className="dropdown-option"
                    key={index}
                    onClick={() => selectCity(place)}
                  >
                    <strong>{place.name}</strong>
                    <small>{place.country}</small>
                  </div>
                ))
              ) : (
                <div className="no-result">
                  No cities found
                </div>
              )}

            </div>
          )}

        </div>

        <button className="search-button" onClick={getWeather}>
          Search
        </button>

        {weather && (
          <div className="weather-card">

            <div className="location">
              📍 {weather.name}, {weather.country}
            </div>

            <div className="weather-icon">
              {weather.icon}
            </div>

            <h2>{weather.temperature}°C</h2>

            <h3>{weather.condition}</h3>

            <div className="details">

              <div>
                <span>💧</span>
                <p>Humidity</p>
                <strong>{weather.humidity}%</strong>
              </div>

              <div>
                <span>💨</span>
                <p>Wind</p>
                <strong>{weather.wind} km/h</strong>
              </div>

            </div>

            <p className="updated">
              Last updated: {lastUpdated}
            </p>

           

          </div>
        )}

      </div>

    </div>
  )
}

export default App