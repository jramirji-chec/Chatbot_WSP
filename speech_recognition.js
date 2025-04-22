// // npm install microsoft-cognitiveservices-speech-sdk
// // https://learn.microsoft.com/es-es/azure/ai-services/speech-service/how-to-recognize-speech?pivots=programming-language-javascript

// const fs = require("fs");
// const sdk = require("microsoft-cognitiveservices-speech-sdk");

// // Cargar las claves desde las variables de entorno
// require("dotenv").config();
// const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
// const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;

// if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
//     throw new Error("Azure Speech Key or Region is not set. Verifica tu archivo .env.");
// }

// // Configurar el servicio de Azure Speech
// const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
// speechConfig.speechRecognitionLanguage = "es-ES"; // Cambia el idioma si es necesario

// // Función para transcribir audio a texto
// const transcribirAudio = async (path) => {
//     return new Promise((resolve, reject) => {
//         try {
//             const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(path));
//             const speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

//             // Reconocer el audio una vez
//             speechRecognizer.recognizeOnceAsync((result) => {
//                 switch (result.reason) {
//                     case sdk.ResultReason.RecognizedSpeech:
//                         //console.log(`RECOGNIZED: Text=${result.text}`);
//                         resolve(result.text); // Retornar el texto reconocido
//                         break;
//                     case sdk.ResultReason.NoMatch:
//                         console.log("NOMATCH: Speech could not be recognized.");
//                         resolve("No se pudo reconocer el audio."); // Retornar un mensaje predeterminado
//                         break;
//                     case sdk.ResultReason.Canceled:
//                         const cancellation = sdk.CancellationDetails.fromResult(result);
//                         console.log(`CANCELED: Reason=${cancellation.reason}`);
//                         if (cancellation.reason === sdk.CancellationReason.Error) {
//                             console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
//                             console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
//                             console.log("CANCELED: Did you set the speech resource key and region values?");
//                         }
//                         reject(new Error("La transcripción fue cancelada."));
//                         break;
//                 }
//                 speechRecognizer.close();
//             });
//         } catch (error) {
//             console.error("Error al transcribir el audio:", error);
//             reject(error);
//         }
//     });
// };

// module.exports = { transcribirAudio };

// npm install microsoft-cognitiveservices-speech-sdk
// https://learn.microsoft.com/es-es/azure/ai-services/speech-service/how-to-recognize-speech?pivots=programming-language-javascript



// const fs = require("fs");
// const sdk = require("microsoft-cognitiveservices-speech-sdk");

// // Cargar las claves desde las variables de entorno
// require("dotenv").config();
// const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
// const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;

// if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
//     throw new Error("Azure Speech Key or Region is not set. Verifica tu archivo .env.");
// }

// // Configurar el servicio de Azure Speech
// const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
// speechConfig.speechRecognitionLanguage = "es-ES"; // Cambia el idioma si es necesario

// // Función para transcribir audio a texto de forma continua
// // Función para transcribir audio a texto de forma continua
// const transcribirAudioContinuo = async (path) => {
//     return new Promise((resolve, reject) => {
//         try {
//             const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(path));
//             const speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

//             let textoCompleto = ""; // Variable para acumular el texto reconocido

//             // Evento para texto reconocido parcialmente
//             speechRecognizer.recognizing = (s, e) => {
//                 console.log(`RECOGNIZING: Text=${e.result.text}`);
//             };

//             // Evento para texto reconocido completamente
//             speechRecognizer.recognized = (s, e) => {
//                 if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
//                     console.log(`RECOGNIZED: Text=${e.result.text}`);
//                     textoCompleto += e.result.text + " "; // Acumular el texto reconocido
//                 } else if (e.result.reason === sdk.ResultReason.NoMatch) {
//                     console.log("NOMATCH: Speech could not be recognized.");
//                 }
//             };

//             // Evento para manejar cancelaciones
//             speechRecognizer.canceled = (s, e) => {
//                 console.log(`CANCELED: Reason=${e.reason}`);
//                 if (e.reason === sdk.CancellationReason.Error) {
//                     console.log(`CANCELED: ErrorCode=${e.errorCode}`);
//                     console.log(`CANCELED: ErrorDetails=${e.errorDetails}`);
//                     console.log("CANCELED: Did you set the speech resource key and region values?");
//                     // Manejar errores críticos
//                     reject(new Error("La transcripción fue cancelada debido a un error crítico."));
//                 } else {
//                     console.log("CANCELED: La transcripción fue cancelada, pero no hubo errores críticos.");
//                     // Detener el reconocimiento continuo y resolver con el texto acumulado
//                     speechRecognizer.stopContinuousRecognitionAsync(() => {
//                         resolve(textoCompleto.trim()); // Retornar el texto acumulado
//                     });
//                 }
//             };

//             // Evento para manejar el final de la sesión
//             speechRecognizer.sessionStopped = (s, e) => {
//                 console.log("Session stopped event.");
//                 speechRecognizer.stopContinuousRecognitionAsync(() => {
//                     resolve(textoCompleto.trim()); // Retornar el texto acumulado
//                 });
//             };

//             // Iniciar el reconocimiento continuo
//             speechRecognizer.startContinuousRecognitionAsync();
//         } catch (error) {
//             console.error("Error al transcribir el audio:", error);
//             reject(error);
//         }
//     });
// };

// module.exports = { transcribirAudioContinuo };


//// chatGPT

const fs = require("fs");
const sdk = require("microsoft-cognitiveservices-speech-sdk");
require("dotenv").config();

const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;

if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
    throw new Error("Azure Speech Key or Region is not set. Verifica tu archivo .env.");
}

const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
speechConfig.speechRecognitionLanguage = "es-ES";

const transcribirAudioContinuo = async (path) => {
    return new Promise((resolve, reject) => {
        try {
            if (!fs.existsSync(path)) {
                return reject(new Error(`El archivo de audio no existe en la ruta: ${path}`));
            }

            const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(path));
            const speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

            let textoCompleto = "";

            speechRecognizer.recognizing = (s, e) => {
                //console.log(`RECOGNIZING: Text=${e.result.text}`);
            };

            speechRecognizer.recognized = (s, e) => {
                if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
                    //console.log(`RECOGNIZED: Text=${e.result.text}`);
                    textoCompleto += e.result.text + " ";
                } else if (e.result.reason === sdk.ResultReason.NoMatch) {
                    console.log("NOMATCH: Speech could not be recognized.");
                }
            };

            speechRecognizer.canceled = (s, e) => {
                //console.log(`CANCELED: Reason=${e.reason}`);
                if (e.reason === sdk.CancellationReason.Error) {
                    //console.log(`CANCELED: ErrorCode=${e.errorCode}`);
                    //console.log(`CANCELED: ErrorDetails=${e.errorDetails}`);
                    reject(new Error("La transcripción fue cancelada debido a un error crítico."));
                } else {
                    speechRecognizer.stopContinuousRecognitionAsync(() => {
                        resolve(textoCompleto.trim());
                    });
                }
            };

            speechRecognizer.sessionStopped = (s, e) => {
                console.log("Session stopped event.");
                speechRecognizer.stopContinuousRecognitionAsync(() => {
                    resolve(textoCompleto.trim());
                });
            };

            speechRecognizer.startContinuousRecognitionAsync();
        } catch (error) {
            console.error(`Error al transcribir el archivo ${path}:`, error);
            reject(error);
        }
    });
};

module.exports = { transcribirAudioContinuo };
