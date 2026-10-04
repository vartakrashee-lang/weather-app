const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("Weather Backend is running")
})

app.get("/weather", async (req, res) => {
  const { latitude, longitude } = req.query

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
    )

    const data = await response.json()

    res.json(data)
  } catch (error) {
    res.status(500).json({
      error: "Unable to fetch weather data"
    })
  }
})
app.listen(process.env.PORT || 5000, () => {
  console.log("Backend running on http://localhost:5000")
})