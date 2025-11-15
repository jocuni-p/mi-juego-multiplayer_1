

// //=============Migracion a TypeScript==========

// // ---------
// // 1. DEFINICIÓN DE TIPOS (INTERFACES)
// // ---------

// // Importamos el tipo 'WebSocket' de la librería 'ws' para poder extenderlo
// //import type { WebSocket } from 'ws';

// // Plantilla para un Jugador
// interface Player {
//   id: string;
//   x: number;
//   y: number;
//   color: string;
// }

// // Plantilla para el estado del juego
// interface GameState {
//   players: {
//     // Esto es un "diccionario" donde la clave (key) es un string (el ID)
//     // y el valor (value) es un objeto 'Player'
//     [key: string]: Player;
//   };
// }

// // Plantilla para NUESTRO WebSocket
// // Extendemos el tipo 'WebSocket' de la librería y le añadimos 'playerId'
// interface PlayerWebSocket extends WebSocket {
//   playerId: string;
// }


// // ---------
// // 2. IMPORTACIONES (¡Modernizadas a ES Modules!)
// // ---------
// import Fastify from 'fastify'; // 'fastify' ya incluye sus tipos
// import path from 'path';
// import staticPlugin from '@fastify/static';
// import cors from '@fastify/cors';
// import { WebSocket, WebSocketServer } from 'ws'; // <-- ¡LA MAGIA!

// // TS-FIX: Importamos 'WebSocket' para los tipos y 'WebSocketServer' para la clase
// // Esto resuelve tu conflicto de nombres.

// // TS-FIX: ¡Creamos la instancia del servidor!
// const fastify = Fastify({ logger: true });

// // ---------
// // 3. CONFIGURACIÓN DE FASTIFY Y CORS
// // ---------
// fastify.register(cors, {
//   origin: 'http://localhost:5173',
// });

// fastify.register(staticPlugin, {
//   root: path.join(__dirname, '..', 'client', 'dist'),
//   prefix: '/',
// });

// // ---------
// // 4. ESTADO DEL JUEGO
// // ---------

// // TS-FIX: Le decimos a 'gameState' que DEBE seguir la plantilla 'GameState'
// const gameState: GameState = {
//   players: {},
// };

// function getRandomColor(): string { // TS-FIX: Especificamos que esta función devuelve un 'string'
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
// //const wss = new WebSocket.Server({ server: fastify.server });
// const wss = new WebSocketServer({ server: fastify.server });

// // Función de "Broadcast"
// // TS-FIX: 'data' debe ser un 'string' (porque usamos JSON.stringify)
// function broadcast(data: string) {
//   // TS-FIX: 'client' debe ser de tipo 'WebSocket' (el que importamos)
//   wss.clients.forEach((client: WebSocket) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(data);
//     }
//   });
// }

// // Lógica de conexión
// // TS-FIX: 'ws' es de tipo 'WebSocket' (el que importamos)
// wss.on('connection', (ws: WebSocket) => {
//   console.log('Cliente conectado');

//   // TS-FIX: ¡LA CLAVE! Le decimos a TS que 'ws' es de tipo 'PlayerWebSocket'
//   // Esto nos permite añadirle 'playerId' sin que se queje.
//   const playerWS = ws as PlayerWebSocket;

//   // 1. Crear y añadir jugador
//   const playerId = Date.now().toString();
//   // TS-FIX: 'newPlayer' debe seguir la plantilla 'Player'
//   const newPlayer: Player = {
//     id: playerId,
//     x: Math.floor(Math.random() * 750),
//     y: Math.floor(Math.random() * 550),
//     color: getRandomColor(),
//   };
//   gameState.players[playerId] = newPlayer;

//   // 2. Asociar ID con la conexión
//   playerWS.playerId = playerId; // Ahora podemos hacer esto sin error

//   // 3. Enviar estado a todos
//   broadcast(JSON.stringify(gameState));

//   // Lógica de mensajes (movimiento)
//   // TS-FIX: 'message' es un objeto 'Buffer'. Debemos convertirlo.
//   ws.on('message', (message: Buffer) => {
//     const command = message.toString();
    
//     // TS-FIX: Usamos 'playerWS.playerId' para acceder al ID
//     const player = gameState.players[playerWS.playerId];

//     if (player) {
//       const moveSpeed = 10;
//       switch (command) {
//         case 'up': player.y -= moveSpeed; break;
//         case 'down': player.y += moveSpeed; break;
//         case 'left': player.x -= moveSpeed; break;
//         case 'right': player.x += moveSpeed; break;
//       }
//       broadcast(JSON.stringify(gameState));
//     }
//   });

//   // Lógica de desconexión
//   ws.on('close', () => {
//     console.log('Cliente desconectado');
//     // TS-FIX: Usamos 'playerWS.playerId' de nuevo
//     delete gameState.players[playerWS.playerId];
//     broadcast(JSON.stringify(gameState));
//   });
// });

// // ---------
// // 6. INICIAR EL SERVIDOR
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

// ---------
// 1. IMPORTACIONES
// ---------
import Fastify from 'fastify';
import path from 'path';
import staticPlugin from '@fastify/static';
import cors from '@fastify/cors';
import { WebSocketServer, WebSocket } from 'ws'; // Usamos import ES6

// ---------
// 2. DEFINICIÓN DE TIPOS (SERVIDOR)
// ---------

interface Player {
  id: string;
  x: number;
  y: number;
  color: string;
  // ¡NUEVO! Estado de movimiento del jugador
  movement: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
}

interface GameState {
  players: { [key: string]: Player };
}

interface PlayerWebSocket extends WebSocket {
  playerId: string;
}

// Mensajes que el SERVIDOR recibe del CLIENTE
type ServerMessage =
  | { type: 'start_move'; direction: string }
  | { type: 'stop_move'; direction: string };

// ---------
// 3. CONFIGURACIÓN DE FASTIFY Y CORS
// ---------
const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: '*', // O 'http://localhost:5173' si quieres ser estricto
});

fastify.register(staticPlugin, {
  root: path.join(__dirname, '..', 'client', 'dist'),
  prefix: '/',
});

// ---------
// 4. ESTADO DEL JUEGO
// ---------
const gameState: GameState = {
  players: {},
};

function getRandomColor(): string {
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
const wss = new WebSocketServer({ server: fastify.server });

function broadcast(data: string) {
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on('connection', (ws: WebSocket) => {
  console.log('Cliente conectado');
  const playerWS = ws as PlayerWebSocket;

  // 1. Crear y añadir jugador
  const playerId = Date.now().toString();
  const newPlayer: Player = {
    id: playerId,
    x: Math.floor(Math.random() * 750),
    y: Math.floor(Math.random() * 550),
    color: getRandomColor(),
    // ¡NUEVO! Inicializamos el estado de movimiento
    movement: {
      up: false,
      down: false,
      left: false,
      right: false,
    },
  };
  gameState.players[playerId] = newPlayer;
  playerWS.playerId = playerId;

  // Ya no transmitimos aquí, el bucle de juego lo hará

  // Lógica de mensajes (¡NUEVA!)
  ws.on('message', (message: Buffer) => {
    try {
      const player = gameState.players[playerWS.playerId];
      if (!player) return;

      // Parseamos el mensaje del cliente
      const data: ServerMessage = JSON.parse(message.toString());

      // Actualizamos el estado del jugador, NO lo movemos
      switch (data.type) {
        case 'start_move':
          if (data.direction in player.movement) {
            player.movement[data.direction as keyof typeof player.movement] = true;
          }
          break;
        case 'stop_move':
          if (data.direction in player.movement) {
            player.movement[data.direction as keyof typeof player.movement] = false;
          }
          break;
      }
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
    }
    // ¡YA NO TRANSMITIMOS EL ESTADO AQUÍ!
  });

  // Lógica de desconexión
  ws.on('close', () => {
    console.log('Cliente desconectado');
    delete gameState.players[playerWS.playerId];
    // Ya no transmitimos aquí, el bucle de juego lo hará
  });
});

// ---------
// 6. BUCLE DE JUEGO (¡LA CLAVE DEL MOVIMIENTO FLUIDO!)
// ---------

const TICK_RATE_MS = 1000 / 60; // 60 veces por segundo
const MOVE_SPEED = 5; // Píxeles por tick

function updateGame() {
  // 1. Mover cada jugador según su estado de 'movement'
  for (const playerId in gameState.players) {
    const player = gameState.players[playerId];

    if (player.movement.up) player.y -= MOVE_SPEED;
    if (player.movement.down) player.y += MOVE_SPEED;
    if (player.movement.left) player.x -= MOVE_SPEED;
    if (player.movement.right) player.x += MOVE_SPEED;
    
    // (Opcional: añadir límites de pantalla)
    // player.x = Math.max(0, Math.min(player.x, 800 - 50)); // 800=width, 50=player size
    // player.y = Math.max(0, Math.min(player.y, 600 - 50)); // 600=height, 50=player size
  }

  // 2. Transmitir el NUEVO estado a TODOS los jugadores
  broadcast(JSON.stringify(gameState));
}

// Iniciamos el bucle de juego
setInterval(updateGame, TICK_RATE_MS);

// ---------
// 7. INICIAR EL SERVIDOR
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