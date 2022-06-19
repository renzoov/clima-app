require("dotenv").config();
const {
  leerInput,
  inquirerMenu,
  pausa,
  listarLugares,
} = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async () => {
  const busquedas = new Busquedas();
  let opt;

  do {
    opt = await inquirerMenu();

    switch (opt) {
      case 1:
        // Mostrar mensaje
        const termino = await leerInput("Ciudad: ");

        // Buscar los lugares
        const lugares = await busquedas.ciudad(termino);

        // Seleccionar un lugar
        const id = await listarLugares(lugares);
        if (id === "0") continue;
        const lugarSel = lugares.find((lugar) => lugar.id === id);

        // Guardar en DB
        busquedas.agregarHistorial(lugarSel.nombre);

        // Clima
        const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng);

        // Mostrar el lugar seleccionado
        console.clear();
        const { nombre, lng, lat } = lugarSel;
        const { desc, min, max, temp } = clima;
        console.log("\nInformación de la ciudad\n".green);
        console.log("Ciudad:", nombre.green);
        console.log("Lat:", lat.yellow);
        console.log("Lng:", lng.yellow);
        console.log("Temperatura:", temp);
        console.log("Mínima:", min);
        console.log("Máxima:", max);
        console.log("Clima:", desc.green);
        break;
      case 2:
        busquedas.historialCapitalizado.forEach((lugar, i) => {
          const idx = `${i + 1}`.green;
          console.log(`${idx} ${lugar}`);
        });
        break;
    }

    if (opt !== 0) await pausa();
  } while (opt !== 0);
};

main();
