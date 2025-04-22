
//////   OK FUNCIONA PERFECTAMENTE

// const sql = require('mssql');

// const config = {
//   user: 'adminjorge@servidorchatbot',
//   password: 'Azuresql2025*',
//   server: 'servidorchatbot.database.windows.net',
//   database: 'bdincidentes',
//   options: {
//     encrypt: true, // Requerido para Azure
//     trustServerCertificate: false
//   }
// };

// async function testConexion() {
//   try {
//     await sql.connect(config);
//     console.log('✅ Conexión exitosa a Azure SQL');

//     const result = await sql.query`SELECT * FROM incidentes`;
//     console.log('🧾 Resultado:', result.recordset);

//     await sql.close();
//   } catch (err) {
//     console.error('❌ Error en la conexión:', err);
//   }
// }

// testConexion();


/////////////////////////

// insertarTranscripciones.js
const fs = require('fs');
const sql = require('mssql');

// Configuración de conexión
const config = {
  user: 'adminjorge@servidorchatbot',
  password: 'Azuresql2025*',
  server: 'servidorchatbot.database.windows.net',
  database: 'bdincidentes',
  options: {
    encrypt: true, // Requerido para Azure
    trustServerCertificate: false
  }
};

async function testConexion() {
  try {
    await sql.connect(config);
    console.log('✅ Conexión exitosa a Azure SQL');

    const result = await sql.query`SELECT * FROM dbo.incidentes`;
    console.log('🧾 Resultado:', result.recordset);

    await sql.close();
  } catch (err) {
    console.error('❌ Error en la conexión:', err);
  }
}

// Leer archivo JSON
function leerArchivoJSON(ruta) {
  const contenido = fs.readFileSync(ruta, 'utf8');
  return JSON.parse(contenido);
}

// Función para insertar datos
async function insertarDatos() {
  const datos = leerArchivoJSON('reportes.json'); // Asegúrate de que este archivo exista en el mismo directorio

  try {
    let pool = await sql.connect(config);

    for (let d of datos) {
      await pool.request()
        .input('nombre', sql.NVarChar(150), d.nombre)
        .input('cedula', sql.NVarChar(20), d.cedula)
        .input('telefono', sql.NVarChar(20), d.telefono)
        .input('codigo', sql.NVarChar(50), d.codigo)
        .input('texto', sql.NVarChar(sql.MAX), d.texto)
        .input('fechaHora', sql.NVarChar(50), d.fechaHora)
        .query(`
          INSERT INTO incidentes
          (nombre, cedula, telefono,codigo,texto,fechaHora)
          VALUES (@nombre, @cedula, @telefono, @codigo, @texto, @fechaHora)
        `);
    }

    console.log("✅ Todos los datos han sido insertados en Azure SQL.");
    await sql.close();
  } catch (error) {
    console.error("❌ Error al insertar los datos:", error);
    await sql.close();
  }
}


insertarDatos();

testConexion();
