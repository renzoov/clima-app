const fs = require("fs");
const axios = require("axios");

class Busquedas {
  historial = [];
  dbPath = "./db/database.json";

  constructor() {
    this.leerDB();
  }

  get historialCapitalizado() {
    return this.historial.map((lugar) => {
      let palabras = lugar.split(" ");
      palabras = palabras.map(
        (palabra) => palabra[0].toUpperCase() + palabra.substring(1)
      );
      return palabras.join(" ");
    });
  }

  get paramsLocationIQ() {
    return {
      key: process.env.LOCATIONIQ_KEY,
      format: "json",
    };
  }

  get paramsClima() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: "metric",
      lang: "es",
    };
  }

  async ciudad(lugar = "") {
    // petición http
    try {
      const instance = axios.create({
        baseURL: `https://us1.locationiq.com/v1/search.php?q=${lugar}`,
        params: this.paramsLocationIQ,
      });

      const resp = await instance.get();
      return resp.data.map((lugar) => ({
        id: lugar.place_id,
        nombre: lugar.display_name,
        lng: lugar.lon,
        lat: lugar.lat,
      }));
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async climaLugar(lat, lon) {
    // petición http
    try {
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: { ...this.paramsClima, lat, lon },
      });

      const resp = await instance.get();
      const { weather, main } = resp.data;

      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
      };
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  agregarHistorial(lugar = "") {
    if (this.historial.includes(lugar.toLowerCase())) {
      return;
    }

    this.historial = this.historial.splice(0, 5);
    this.historial.unshift(lugar.toLowerCase());

    // Grabar en DB
    this.guardarDB();
  }

  guardarDB() {
    const payload = {
      historial: this.historial,
    };
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  leerDB() {
    if (!fs.existsSync(this.dbPath)) return;

    const info = fs.readFileSync(this.dbPath);
    const data = JSON.parse(info);

    this.historial = data.historial;
  }
}

module.exports = Busquedas;
