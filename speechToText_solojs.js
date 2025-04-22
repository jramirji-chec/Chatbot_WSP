const { downloadMediaMessage } = require("@adiwajshing/baileys");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
//const { transcribirAudio } = require("./speech_recognition"); // Importar la función desde speech_recognition.js
const { transcribirAudioContinuo } = require("./speech_recognition");

ffmpeg.setFfmpegPath(ffmpegPath);

// Función para convertir OGG a WAV (Azure necesita WAV en 16 kHz)
const convertOggToWav = async (inputFile, outputFile) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputFile)
            .output(outputFile)
            .audioFrequency(16000) // 16 kHz requerido por Azure
            .audioChannels(1)
            .toFormat("wav")
            .on("end", () => resolve(true))
            .on("error", (err) => reject(err))
            .run();
    });
};

//Llamada a la función y retorno del resultado
const handlerAI = async (ctx) => {
    const buffer = await downloadMediaMessage(ctx, "buffer");
    const pathTmpOgg = `${process.cwd()}/tmp/voice-note-${Date.now()}.ogg`;
    const pathTmpWav = `${process.cwd()}/tmp/voice-note-${Date.now()}.wav`;

    // Guardar archivo OGG
    await fs.writeFileSync(pathTmpOgg, buffer);

    // Convertir a WAV
    await convertOggToWav(pathTmpOgg, pathTmpWav);

    try {
        // Llamar a la función transcribirAudio y obtener el texto transcrito
        //const text = await transcribirAudio(pathTmpWav);
        const text = await transcribirAudioContinuo(pathTmpWav);
        //console.log("Texto transcrito:", text);

        // Eliminar archivos temporales
        fs.unlink(pathTmpOgg, (err) => { if (err) console.error(err); }); // Eliminar el archivo OGG
        fs.unlink(pathTmpWav, (err) => { if (err) console.error(err); }); // Eliminar el archivo WAV

        return text; // Retornar el texto transcrito
    } catch (error) {
        console.error("Error al transcribir el audio:", error);

        // Eliminar archivos temporales en caso de error
        fs.unlink(pathTmpOgg, (err) => { if (err) console.error(err); });
        fs.unlink(pathTmpWav, (err) => { if (err) console.error(err); });

        throw error; // Propagar el error
    }
};

// const handlerAI = async (path) => {
//     try {
//         const texto = await transcribirAudioContinuo(path);
//         console.log("Texto transcrito:", texto);
//         return texto;
//     } catch (error) {
//         console.error("Error en la transcripción:", error);
//         throw error;
//     }
// };


module.exports = { handlerAI };