"use strict";
// // //=============Migracion a TypeScript==========
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// // ---------
// // 1. IMPORTACIONES
// // ---------
// import Fastify from 'fastify';
// import path from 'path';
// import staticPlugin from '@fastify/static';
// import cors from '@fastify/cors';
// import { WebSocketServer, WebSocket } from 'ws'; // Usamos import ES6
// // ---------
// // 2. DEFINICIÓN DE TIPOS (SERVIDOR)
// // ---------
// interface Player {
//   id: string;
//   x: number;
//   y: number;
//   color: string;
//   // ¡NUEVO! Estado de movimiento del jugador
//   movement: {
//     up: boolean;
//     down: boolean;
//     left: boolean;
//     right: boolean;
//   };
// }
// interface GameState {
//   players: { [key: string]: Player };
// }
// interface PlayerWebSocket extends WebSocket {
//   playerId: string;
// }
// // Mensajes que el SERVIDOR recibe del CLIENTE
// type ServerMessage =
//   | { type: 'start_move'; direction: string }
//   | { type: 'stop_move'; direction: string };
// // ---------
// // 3. CONFIGURACIÓN DE FASTIFY Y CORS
// // ---------
// const fastify = Fastify({ logger: true });
// fastify.register(cors, {
//   origin: '*', // O 'http://localhost:5173' si quieres ser estricto
// });
// // SOLUCIÓN: Usamos process.cwd() para que la ruta sea siempre relativa
// // a la carpeta raíz del servidor, sin importar si ejecutamos .ts o .js
// fastify.register(staticPlugin, {
// 	//root: path.join(__dirname, '..', 'client', 'dist'),
// 	root: path.join(process.cwd(), '../client/dist'),
//   prefix: '/',
// });
// // ---------
// // 4. ESTADO DEL JUEGO
// // ---------
// const gameState: GameState = {
//   players: {},
// };
// function getRandomColor(): string {
//   const letters = '0123456789ABCDEF';
//   let color = '#';
//   for (let i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 16)];
//   }
//   return color;
// }
// // ---------
// // 5. CONFIGURACIÓN DE WEBSOCKETS
// // ---------
// const wss = new WebSocketServer({ server: fastify.server });
// function broadcast(data: string) {
//   wss.clients.forEach((client: WebSocket) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(data);
//     }
//   });
// }
// wss.on('connection', (ws: WebSocket) => {
//   console.log('Cliente conectado');
//   const playerWS = ws as PlayerWebSocket;
//   // 1. Crear y añadir jugador
//   const playerId = Date.now().toString();
//   const newPlayer: Player = {
//     id: playerId,
//     x: Math.floor(Math.random() * 750),
//     y: Math.floor(Math.random() * 550),
//     color: getRandomColor(),
//     // ¡NUEVO! Inicializamos el estado de movimiento
//     movement: {
//       up: false,
//       down: false,
//       left: false,
//       right: false,
//     },
//   };
//   gameState.players[playerId] = newPlayer;
//   playerWS.playerId = playerId;
//   // Ya no transmitimos aquí, el bucle de juego lo hará
//   // Lógica de mensajes (¡NUEVA!)
//   ws.on('message', (message: Buffer) => {
//     try {
//       const player = gameState.players[playerWS.playerId];
//       if (!player) return;
//       // Parseamos el mensaje del cliente
//       const data: ServerMessage = JSON.parse(message.toString());
//       // Actualizamos el estado del jugador, NO lo movemos
//       switch (data.type) {
//         case 'start_move':
//           if (data.direction in player.movement) {
//             player.movement[data.direction as keyof typeof player.movement] = true;
//           }
//           break;
//         case 'stop_move':
//           if (data.direction in player.movement) {
//             player.movement[data.direction as keyof typeof player.movement] = false;
//           }
//           break;
//       }
//     } catch (error) {
//       console.error('Error al procesar mensaje:', error);
//     }
//     // ¡YA NO TRANSMITIMOS EL ESTADO AQUÍ!
//   });
//   // Lógica de desconexión
//   ws.on('close', () => {
//     console.log('Cliente desconectado');
//     delete gameState.players[playerWS.playerId];
//     // Ya no transmitimos aquí, el bucle de juego lo hará
//   });
// });
// // ---------
// // 6. BUCLE DE JUEGO (¡LA CLAVE DEL MOVIMIENTO FLUIDO!)
// // ---------
// const TICK_RATE_MS = 1000 / 60; // 60 veces por segundo
// const MOVE_SPEED = 5; // Píxeles por tick
// function updateGame() {
//   // 1. Mover cada jugador según su estado de 'movement'
//   for (const playerId in gameState.players) {
//     const player = gameState.players[playerId];
//     if (player.movement.up) player.y -= MOVE_SPEED;
//     if (player.movement.down) player.y += MOVE_SPEED;
//     if (player.movement.left) player.x -= MOVE_SPEED;
//     if (player.movement.right) player.x += MOVE_SPEED;
//     // (Opcional: añadir límites de pantalla)
//     // player.x = Math.max(0, Math.min(player.x, 800 - 50)); // 800=width, 50=player size
//     // player.y = Math.max(0, Math.min(player.y, 600 - 50)); // 600=height, 50=player size
//   }
//   // 2. Transmitir el NUEVO estado a TODOS los jugadores
//   broadcast(JSON.stringify(gameState));
// }
// // Iniciamos el bucle de juego
// setInterval(updateGame, TICK_RATE_MS);
// // ---------
// // 7. INICIAR EL SERVIDOR
// // ---------
// const start = async () => {
//   try {
//     await fastify.listen({ port: 3000, host: '0.0.0.0' });
//     console.log('Servidor escuchando en el puerto 3000');
//   } catch (err) {
//     fastify.log.error(err);
//     process.exit(1);
//   }
// };
// start();
// ==========================================
// SERVER.TS - TECLADO FLUIDO + FIX PRODUCCIÓN
// ==========================================
// ---------
// 1. IMPORTACIONES
// ---------
const fastify_1 = __importDefault(require("fastify"));
const path_1 = __importDefault(require("path"));
const static_1 = __importDefault(require("@fastify/static"));
const cors_1 = __importDefault(require("@fastify/cors"));
const ws_1 = require("ws");
// ---------
// 3. CONFIGURACIÓN DE FASTIFY Y CORS
// ---------
const fastify = (0, fastify_1.default)({ logger: true });
fastify.register(cors_1.default, {
    origin: '*',
});
// --- SOLUCIÓN ROBUSTA PARA RUTAS (DEV vs PROD) ---
// Detectamos automáticamente dónde estamos para servir 'client/dist'
const currentDir = __dirname;
// Si la ruta termina en 'dist', es que estamos en producción (server/dist/)
const isProduction = currentDir.endsWith('dist');
// Si es producción, subimos 2 niveles. Si es desarrollo, subimos 1.
const relativePathToClient = isProduction ? '../../client/dist' : '../client/dist';
const staticPath = path_1.default.join(currentDir, relativePathToClient);
console.log(`📂 Sirviendo archivos estáticos desde: ${staticPath}`);
fastify.register(static_1.default, {
    root: staticPath,
    prefix: '/',
});
// ---------
// 4. ESTADO DEL JUEGO
// ---------
const gameState = {
    players: {},
};
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
// ---------
// 5. CONFIGURACIÓN DE WEBSOCKETS
// ---------
const wss = new ws_1.WebSocketServer({ server: fastify.server });
function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(data);
        }
    });
}
wss.on('connection', (ws) => {
    console.log('Cliente conectado');
    const playerWS = ws;
    // 1. Crear y añadir jugador
    const playerId = Date.now().toString();
    const newPlayer = {
        id: playerId,
        x: Math.floor(Math.random() * 750),
        y: Math.floor(Math.random() * 550),
        color: getRandomColor(),
        // Inicializamos el movimiento a falso
        movement: {
            up: false,
            down: false,
            left: false,
            right: false,
        },
    };
    gameState.players[playerId] = newPlayer;
    playerWS.playerId = playerId;
    // 2. Lógica de mensajes (TECLADO)
    ws.on('message', (message) => {
        try {
            const player = gameState.players[playerWS.playerId];
            if (!player)
                return;
            const data = JSON.parse(message.toString());
            // Actualizamos el estado de movimiento (start/stop)
            switch (data.type) {
                case 'start_move':
                    if (data.direction in player.movement) {
                        player.movement[data.direction] = true;
                    }
                    break;
                case 'stop_move':
                    if (data.direction in player.movement) {
                        player.movement[data.direction] = false;
                    }
                    break;
            }
        }
        catch (error) {
            console.error('Error al procesar mensaje:', error);
        }
    });
    // 3. Lógica de desconexión
    ws.on('close', () => {
        console.log('Cliente desconectado');
        delete gameState.players[playerWS.playerId];
    });
});
// ---------
// 6. BUCLE DE JUEGO
// ---------
const TICK_RATE_MS = 1000 / 60; // 60 FPS
const MOVE_SPEED = 5; // Velocidad de movimiento
function updateGame() {
    // 1. Mover cada jugador según sus teclas pulsadas
    for (const playerId in gameState.players) {
        const player = gameState.players[playerId];
        if (player.movement.up)
            player.y -= MOVE_SPEED;
        if (player.movement.down)
            player.y += MOVE_SPEED;
        if (player.movement.left)
            player.x -= MOVE_SPEED;
        if (player.movement.right)
            player.x += MOVE_SPEED;
        // (Opcional) Límites de pantalla
        player.x = Math.max(0, Math.min(player.x, 800 - 50));
        player.y = Math.max(0, Math.min(player.y, 600 - 50));
    }
    // 2. Transmitir el estado a todos
    broadcast(JSON.stringify(gameState));
}
// Iniciamos el bucle
setInterval(updateGame, TICK_RATE_MS);
// ---------
// 7. INICIAR EL SERVIDOR
// ---------
const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Servidor escuchando en el puerto 3000');
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
