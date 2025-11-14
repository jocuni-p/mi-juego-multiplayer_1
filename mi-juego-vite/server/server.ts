
// // ---------
// // 1. IMPORTACIONES
// // ---------
// const fastify = require('fastify')({ logger: true });
// const path = require('path');
// const static = require('@fastify/static');
// const cors = require('@fastify/cors');
// const WebSocket = require('ws');

// // ---------
// // 2. CONFIGURACIÓN DE FASTIFY Y CORS (¡Clave!)
// // ---------

// // Registramos el plugin de CORS
// fastify.register(cors, {
//   origin: 'http://localhost:5173', // Permite conexiones SOLO desde el servidor de Vite
// });

// // Servimos archivos estáticos para PRODUCCIÓN
// // Esto le dice a Fastify que, cuando construyamos el juego,
// // los archivos finales estarán en la carpeta '../client/dist'
// fastify.register(static, {
//   root: path.join(__dirname, '..', 'client', 'dist'),
//   prefix: '/',
// });

// // ---------
// // 3. ESTADO DEL JUEGO 
// // ---------
// const gameState = {
//   players: {},
// };

// function getRandomColor() {
//   const letters = '0123456789ABCDEF';
//   let color = '#';
//   for (let i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 16)];
//   }
//   return color;
// }

// // ---------
// // 4. CONFIGURACIÓN DE WEBSOCKETS 
// // ---------
// const wss = new WebSocket.Server({ server: fastify.server });

// // Función de "Broadcast"
// function broadcast(data) {
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(data);
//     }
//   });
// }

// // Lógica de conexión
// wss.on('connection', (ws) => {
//   console.log('Cliente conectado');

//   // 1. Crear y añadir jugador
//   const playerId = Date.now().toString();
//   const newPlayer = {
//     id: playerId,
//     x: Math.floor(Math.random() * 750),
//     y: Math.floor(Math.random() * 550),
//     color: getRandomColor(),
//   };
//   gameState.players[playerId] = newPlayer;

//   // 2. Asociar ID con la conexión
//   ws.playerId = playerId;

//   // 3. Enviar estado a todos
//   broadcast(JSON.stringify(gameState));

//   // Lógica de mensajes (movimiento)
//   ws.on('message', (message) => {
//     const command = message.toString();
//     const player = gameState.players[ws.playerId];

//     if (player) {
//       const moveSpeed = 10;
//       switch (command) {
//         case 'up': player.y -= moveSpeed; break;
//         case 'down': player.y += moveSpeed; break;
//         case 'left': player.x -= moveSpeed; break;
//         case 'right': player.x += moveSpeed; break;
//       }
//       // Transmitir el nuevo estado después del movimiento
//       broadcast(JSON.stringify(gameState));
//     }
//   });

//   // Lógica de desconexión
//   ws.on('close', () => {
//     console.log('Cliente desconectado');
//     // Eliminar jugador y transmitir estado
//     delete gameState.players[ws.playerId];
//     broadcast(JSON.stringify(gameState));
//   });
// });

// // ---------
// // 5. INICIAR EL SERVIDOR 
// // ---------
// const start = async () => {
// 	try {
// 	  //await fastify.listen({ port: 3000 }); // acepta conexiones solo en localhost
// 		await fastify.listen({ port: 3000, host: '0.0.0.0' }) //acepta conexiones de cualquier maquina y desde cualquier interface de red 
// 		console.log('Servidor escuchando en el puerto 3000');
//   	} catch (err) {
//     	fastify.log.error(err);
//     	process.exit(1);
//   	}
// };

// start();


//=============Migracion a TypeScript==========

// ---------
// 1. DEFINICIÓN DE TIPOS (INTERFACES)
// ---------

// Importamos el tipo 'WebSocket' de la librería 'ws' para poder extenderlo
import type { WebSocket } from 'ws';

// Plantilla para un Jugador
interface Player {
  id: string;
  x: number;
  y: number;
  color: string;
}

// Plantilla para el estado del juego
interface GameState {
  players: {
    // Esto es un "diccionario" donde la clave (key) es un string (el ID)
    // y el valor (value) es un objeto 'Player'
    [key: string]: Player;
  };
}

// Plantilla para NUESTRO WebSocket
// Extendemos el tipo 'WebSocket' de la librería y le añadimos 'playerId'
interface PlayerWebSocket extends WebSocket {
  playerId: string;
}

// ---------
// 2. IMPORTACIONES (require)
// ---------
// Mantenemos 'require' porque nuestro tsconfig.json usa "module": "CommonJS"
// TypeScript es lo bastante inteligente para entender esto.
const fastify = require('fastify')({ logger: true });
const path = require('path');
const staticPlugin = require('@fastify/static'); // Renombrado para evitar conflicto de nombre
const cors = require('@fastify/cors');
const WebSocket = require('ws'); // Este es el 'WebSocket' con mayúscula (la clase)

// ---------
// 3. CONFIGURACIÓN DE FASTIFY Y CORS
// ---------
fastify.register(cors, {
  origin: 'http://localhost:5173',
});

fastify.register(staticPlugin, {
  root: path.join(__dirname, '..', 'client', 'dist'),
  prefix: '/',
});

// ---------
// 4. ESTADO DEL JUEGO
// ---------

// TS-FIX: Le decimos a 'gameState' que DEBE seguir la plantilla 'GameState'
const gameState: GameState = {
  players: {},
};

function getRandomColor(): string { // TS-FIX: Especificamos que esta función devuelve un 'string'
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
const wss = new WebSocket.Server({ server: fastify.server });

// Función de "Broadcast"
// TS-FIX: 'data' debe ser un 'string' (porque usamos JSON.stringify)
function broadcast(data: string) {
  // TS-FIX: 'client' debe ser de tipo 'WebSocket' (el que importamos)
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Lógica de conexión
// TS-FIX: 'ws' es de tipo 'WebSocket' (el que importamos)
wss.on('connection', (ws: WebSocket) => {
  console.log('Cliente conectado');

  // TS-FIX: ¡LA CLAVE! Le decimos a TS que 'ws' es de tipo 'PlayerWebSocket'
  // Esto nos permite añadirle 'playerId' sin que se queje.
  const playerWS = ws as PlayerWebSocket;

  // 1. Crear y añadir jugador
  const playerId = Date.now().toString();
  // TS-FIX: 'newPlayer' debe seguir la plantilla 'Player'
  const newPlayer: Player = {
    id: playerId,
    x: Math.floor(Math.random() * 750),
    y: Math.floor(Math.random() * 550),
    color: getRandomColor(),
  };
  gameState.players[playerId] = newPlayer;

  // 2. Asociar ID con la conexión
  playerWS.playerId = playerId; // Ahora podemos hacer esto sin error

  // 3. Enviar estado a todos
  broadcast(JSON.stringify(gameState));

  // Lógica de mensajes (movimiento)
  // TS-FIX: 'message' es un objeto 'Buffer'. Debemos convertirlo.
  ws.on('message', (message: Buffer) => {
    const command = message.toString();
    
    // TS-FIX: Usamos 'playerWS.playerId' para acceder al ID
    const player = gameState.players[playerWS.playerId];

    if (player) {
      const moveSpeed = 10;
      switch (command) {
        case 'up': player.y -= moveSpeed; break;
        case 'down': player.y += moveSpeed; break;
        case 'left': player.x -= moveSpeed; break;
        case 'right': player.x += moveSpeed; break;
      }
      broadcast(JSON.stringify(gameState));
    }
  });

  // Lógica de desconexión
  ws.on('close', () => {
    console.log('Cliente desconectado');
    // TS-FIX: Usamos 'playerWS.playerId' de nuevo
    delete gameState.players[playerWS.playerId];
    broadcast(JSON.stringify(gameState));
  });
});

// ---------
// 6. INICIAR EL SERVIDOR
// ---------
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Servidor escuchando en el puerto 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();