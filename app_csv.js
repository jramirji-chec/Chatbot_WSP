const { createBot, createProvider, createFlow, addKeyword,EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const fs = require("fs") // para poder leer el archivo del path
const path = require("path");
const csv = require("csv-parser");
const { spawn } = require('child_process');
//const { handlerAI } = require("./speechToText") // para poder usar la función de transcripción
const { handlerAI } = require("./speechToText_solojs") // para poder usar la función de transcripción
const { delay } = require('@whiskeysockets/baileys')
//const { buscarPorNombre } = require("./Leer_archivos"); // Importar la función desde Leer_archivos.js
const { buscarPorCedula } = require("./Leer_archivos"); // Importar la función desde Leer_archivos.js

// const usersData = {}; // Almacén temporal de datos de usuarios
// const csvFilePath = "reportes.csv"; // Ruta del archivo CSV

const csvFilePath = path.join(__dirname, "reportes.csv");
const usersData = {}; // Almacén temporal de datos de usuarios

// prueba
// FUNCION PARA ELIMINAR ACENTOS
function eliminarAcentos(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
// FUNCION PARA DAR ESPERA ENTRE ACCIONES
function espera(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Flujo principal
const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
    .addAnswer("¡Hola, estamos validando tu información, por favor espera un momento...🔄", null, async (ctx, ctxFn) => {
        // Esperar 5 segundos antes de continuar
        await espera(5000);

        const userId = ctx.from;
        let encontrado = false;
        let Nnombre = "";
        let Ncedula = "";
        let Ntelefono = "";
        let Ncodigo = "";

        // Leer el archivo CSV y buscar el número de teléfono
        fs.createReadStream(csvFilePath, { encoding: "utf8" })
            .pipe(csv())
            .on("data", (row) => {
                if (row.Telefono === userId && !encontrado) {
                    encontrado = true;
                    Nnombre = row.Nombre;
                    Ncedula = row.Cedula;
                    Ntelefono = row.Telefono;
                    Ncodigo = row.Codigo;
                    console.log("El nombre es:", Nnombre);
                    console.log("La cedula es:", Ncedula);
                    console.log("El teléfono es:", Ntelefono);
                    console.log("El código es:", Ncodigo);
                    const fechaHora = new Date().toLocaleString("es-ES"); // Obtiene la fecha en formato "21/3/2025, 12:56:28"
                    const fechaHoraFormateada = fechaHora.replace(",", ""); // Elimina la coma
                    usersData[userId] = { nombre: Nnombre, cedula: Ncedula, telefono: Ntelefono, codigo: Ncodigo, fechaHora: fechaHoraFormateada }; // Guardar datos
                }
            })
            .on("end", async () => {
                if (encontrado) {
                    await ctxFn.flowDynamic(`¡Bienvenido de nuevo, *${Nnombre}*! 😊`);
                    await espera(2000);
                    //await ctxFn.flowDynamic(`Tu Código es: *${Ncodigo}*`);
                    //await espera(2000);
                    await ctxFn.flowDynamic("Por favor, envíame una nota de voz que sea clara y pausada, describiendo tu reporte o incidente.");
                } else {
                    // Redirigir al flujo `flujoInicial` si el número no existe
                    await ctxFn.gotoFlow(flujoInicial);
                }
            })
            .on("error", async (error) => {
                console.error("Error al leer el archivo CSV:", error);
                await ctxFn.flowDynamic("Lo siento, ocurrió un error al verificar tu información. Por favor, intenta más tarde.");
            });
    });

// const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
const flujoInicial = addKeyword(['hola', 'ole', 'alo'])
    .addAnswer("¡Bienvenido! Soy *ChatbotCHEC*.", { delay: 2000 })
    .addAnswer("Acá puedes reportar incidentes, a través de notas de voz.", { delay: 500 })
    .addAnswer("Para comenzar, dime cuál es tu número de cédula:", { delay: 2000, capture: true }, async (ctx, ctxFn) => {
        const userId = ctx.from;
        const fechaHora = new Date().toLocaleString("es-ES").replace(",", ""); // Formatear fecha y hora
        const nombrepersona = ctx.body;
        const nombreSinAcento = eliminarAcentos(nombrepersona);
        
        await ctxFn.flowDynamic(`¡Estamos validando tu información, por favor espera un momento...🔄`);
        await espera(5000);
        console.log(`Datos recibidos del número: '${userId}'`);
        //console.log(`Nombre: ${ctx.body}`);
        //const nombreBuscado = ctx.body; // Capturar el nombre proporcionado por el usuario
        const cedulaBuscada = ctx.body; // Capturar la cédula proporcionada por el usuario

        try {
            //const resultados = await buscarPorNombre(nombreBuscado); // Consultar los datos por nombre
            const resultados = await buscarPorCedula(cedulaBuscada); // Consultar los datos por cédula

            if (resultados.length > 0) {
                // Capturar el primer resultado (o manejar múltiples resultados si es necesario)
                const resultado = resultados[0];
                const nombreSinAcento = eliminarAcentos(resultado.nombre);

                // Almacenar los datos en usersData
                usersData[userId] = {
                    nombre: nombreSinAcento,
                    cedula: resultado.cedula,
                    usuario: resultado.usuario,
                    telefono: userId,
                    fechaHora: new Date().toLocaleString("es-ES").replace(",", ""), // Formatear fecha y hora
                };
                
                // Mostrar los datos encontrados al usuario
                console.log(`Nombre: ${resultado.nombre}`);
                await ctxFn.flowDynamic(`¡Hola, *${resultado.nombre}*! 😊`);
                console.log(`Cedula: ${resultado.cedula}`);
                await ctxFn.flowDynamic(`¡Tu usuario es: *${resultado.usuario}*`);
                console.log(`Usuario: ${resultado.usuario}`);
                usersData[userId].codigo = resultado.usuario; // Guardar el código de usuario
                await espera(2000); 
                
                await ctxFn.flowDynamic("Ahora, envíame una nota de voz que sea clara y pausada, describiendo tu reporte o incidente:");

            } else {
                await ctxFn.flowDynamic("No se encontraron datos para la cédula proporcionada.");
                await ctxFn.flowDynamic("Por favor valida con tu jefe inmediato o la persona encargada.");
                await ctxFn.flowDynamic("Te esperamos pronto! 👋.");
            }
        } catch (error) {
            console.error("Error al buscar datos:", error);
            await ctxFn.flowDynamic("Ocurrió un error al buscar los datos. Por favor, intenta más tarde.");
        }
    })

// Flujo para manejar la nota de voz 
const flowVoice = addKeyword(EVENTS.VOICE_NOTE).addAnswer("Procesando nota de voz...🔄", null, async (ctx, ctxFn) => {
    try {
        const userId = ctx.from;
        const text = await handlerAI(ctx); // Convertir la nota de voz a texto

        // Reemplazar comas por puntos
        const textoSinComas = text.replace(/,/g, "."); // Reemplaza todas las comas por puntos
        const textoSinAcentos = eliminarAcentos(textoSinComas); // Elimina los acentos del texto

        console.log(`Texto procesado: ${textoSinAcentos}`);

        if (!usersData[userId]) usersData[userId] = {}; // Asegurar que el objeto existe
        usersData[userId].texto = textoSinAcentos; // Guardar el texto procesado sin las comas

        await ctxFn.flowDynamic(`*Transcripción*: ${textoSinAcentos}`); // Mostrar texto procesado con comas
        await espera(4000);
        await ctxFn.flowDynamic(
                        "Si estás de acuerdo con la transcripción, responde con:\n1️⃣ Sí, estoy de acuerdo.\n2️⃣ No, quiero volver a enviarla.",
                        { delay: 500 }
                    );

        
    } catch (error) {
        console.error("Error en el flujo de notas de voz:", error);
        await ctxFn.flowDynamic("Lo siento, no pude procesar tu nota de voz.");
    }
});

// Flujo para manejar la respuesta del usuario después de la transcripción
const flowWelcome = addKeyword(EVENTS.WELCOME)
.addAction(async (ctx, ctxFn) =>{
    const userId = ctx.from;
    //const respuesta = ctx.body.trim();
    if (ctx.body.includes("1")){
        if (usersData[userId].nombre && usersData[userId].cedula && usersData[userId].codigo && usersData[userId].texto) {
        writeToCSV(usersData[userId]); // Guardar en el CSV
        delete usersData[userId]; // Limpiar el almacenamiento del usuario
    }
        await ctxFn.flowDynamic("¡Gracias por utilizar *ChatbotCHEC*! Te esperamos pronto. 👋");
    }else if (ctx.body.includes("2")){
        await ctxFn.flowDynamic("Por favor, vuelve a enviar tu nota de voz para procesarla nuevamente.");
    }else if (["3", "4", "5", "6", "7", "8", "9", "0"].includes(ctx.body)) {
        await ctxFn.flowDynamic("Opción no válida. Por favor, responde con 1️⃣ o 2️⃣.");
    }else {
        await ctxFn.gotoFlow(flowPrincipal); // Vuelve a preguntar hasta que ingrese 1 o 2
    console.log("Valor capturado: ",ctx.body) // Con esta funcion, imprimimos lo que escribio el usuario en WSP en la consola PC
    // await ctxFn.flowDynamic(`Bienvenido: ${ctx.body}`);  
}
}
)

// 🔹 Función para escribir en el archivo CSV
const writeToCSV = (data) => {
    const headers = "Nombre,Cedula,Telefono,Codigo,Texto Procesado,Fecha y Hora\n";

    if (!fs.existsSync(csvFilePath)) {
        fs.writeFileSync(csvFilePath, headers); // Crear archivo con encabezados si no existe
    }

    // Insertar los datos en una sola línea
    const row = `${data.nombre},${data.cedula},${data.telefono},${data.codigo},${data.texto},${data.fechaHora}\n`;
    fs.appendFileSync(csvFilePath, row, "utf8");
};


const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal,flujoInicial,flowWelcome, flowVoice])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
