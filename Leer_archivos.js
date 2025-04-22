const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const rutaCompartida = "\\\\chec-apd09\\Ejecutables\\DA"; // Ruta de la carpeta compartida
const archivo1 = path.join(rutaCompartida, "Usuarios_CHEC.csv"); // Primer archivo CSV
const archivo2 = path.join(rutaCompartida, "Contratistas_CHEC.csv"); // Segundo archivo CSV
const archivo3 = path.join(rutaCompartida, "Directivos_CHEC.csv"); // Tercer archivo CSV



// Función para leer un archivo CSV y extraer los campos deseados
function leerArchivoCSV(rutaArchivo) {
    return new Promise((resolve, reject) => {
        const datos = [];
        fs.createReadStream(rutaArchivo, { encoding: "utf8" })
            .pipe(csv())
            .on("data", (row) => {
                // Filtrar solo los campos Nombre, Cedula y Usuario
                const nombre = row["DisplayName"];
                const cedula = row["EmployeeID"];
                const usuario = row["SamAccountName"];
                const correo = row["UserPrincipalName"];
                datos.push({ nombre, cedula, usuario, correo });
            })
            .on("end", () => {
                resolve(datos);
            })
            .on("error", (error) => {
                reject(error);
            });
    });
}


// Función para buscar datos por nombre
async function buscarPorNombre(nombreBuscado) {
    try {
        const datosArchivo1 = await leerArchivoCSV(archivo1);
        const datosArchivo2 = await leerArchivoCSV(archivo2);
        const datosArchivo3 = await leerArchivoCSV(archivo3);

        // Concatenar los datos de ambos archivos
        const datosCombinados = [...datosArchivo1, ...datosArchivo2, ...datosArchivo3];

        // Filtrar los datos por nombre
        const resultados = datosCombinados.filter((dato) =>
            dato.nombre.toLowerCase().includes(nombreBuscado.toLowerCase())
        );

        return resultados;
    } catch (error) {
        console.error("Error al buscar por nombre:", error);
        throw error;
    }
}

module.exports = { buscarPorNombre };

// Función para buscar datos por cédula
async function buscarPorCedula(cedulaBuscada) {
    try {
        const datosArchivo1 = await leerArchivoCSV(archivo1);
        const datosArchivo2 = await leerArchivoCSV(archivo2);
        const datosArchivo3 = await leerArchivoCSV(archivo3);

        // Concatenar los datos de ambos archivos
        const datosCombinados = [...datosArchivo1, ...datosArchivo2, ...datosArchivo3];

        // Filtrar los datos por cédula
        const resultados = datosCombinados.filter((dato) =>
            dato.cedula === cedulaBuscada
        );

        return resultados;
    } catch (error) {
        console.error("Error al buscar por cédula:", error);
        throw error;
    }
}

module.exports = { buscarPorCedula };

// // Leer y concatenar los datos de ambos archivos
// async function procesarArchivos() {
//     try {
//         const datosArchivo1 = await leerArchivoCSV(archivo1);
//         const datosArchivo2 = await leerArchivoCSV(archivo2);

//         // Concatenar los datos de ambos archivos
//         const datosCombinados = [...datosArchivo1, ...datosArchivo2];

//         // Mostrar los datos combinados
//         datosCombinados.forEach((dato, index) => {
//             console.log(`Registro ${index + 1}: Nombre: ${dato.nombre}, Cedula: ${dato.cedula}, Usuario: ${dato.usuario}, Correo: ${dato.correo}`);
//         });

//         console.log("Procesamiento de ambos archivos completado.");
//     } catch (error) {
//         console.error("Error al procesar los archivos CSV:", error);
//     }
// }

// // Ejecutar la función
// procesarArchivos();
