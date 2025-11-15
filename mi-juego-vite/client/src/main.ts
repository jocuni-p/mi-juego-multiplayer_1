// // ---------
// // 1. OBTENER EL LIENZO (CANVAS)
// // ---------
// // Buscamos el elemento <canvas> que pusimos en el index.html
// // usando su 'id'.
// const canvas = document.getElementById('gameCanvas');

// // Obtenemos el "contexto" 2D. Esta es la herramienta que
// // nos permite dibujar formas, líneas y colores en el lienzo.
// const ctx = canvas.getContext('2d');


// // ---------
// // 2. CONEXIÓN AL SERVIDOR WEBSOCKET
// // ---------

// // URL para producción (usará la misma dirección de la página)
// const PROD_URL = `ws://${location.host}`;

// // URL para desarrollo (apunta al puerto 3000 "cableado")
// const DEV_URL = 'ws://localhost:3000';

// // Vite nos da 'import.meta.env.DEV'
// // Será 'true' cuando ejecutas 'npm run dev'
// const wsUrl = import.meta.env.DEV ? DEV_URL : PROD_URL;

// console.log(`Conectando a WebSocket en: ${wsUrl}`); // Este log te confirmará que funciona

// const ws = new WebSocket(wsUrl);

// // ---------
// // 3. DEFINIR FUNCIONES DE DIBUJADO
// // ---------

// /**
//  * Dibuja un solo jugador en el lienzo.
//  * @param {object} player - Un objeto de jugador (ej: {x: 10, y: 20, color: '#FF0000'})
//  */
// function drawPlayer(player) {
//   // Le decimos al "pincel" (ctx) de qué color queremos dibujar
//   ctx.fillStyle = player.color;
  
//   // Dibujamos un rectángulo relleno en la posición (x, y) del jugador
//   // con un tamaño de 50x50 píxeles.
//   ctx.fillRect(player.x, player.y, 50, 50);
// }

// /**
//  * La función principal de renderizado (dibujado) del juego.
//  * @param {object} gameState - El objeto completo del estado del juego
//  * (ej: { players: { "id1": {...}, "id2": {...} } })
//  */
// function renderGame(gameState) {
//   // 1. Borrar todo el lienzo
//   // Esto es crucial para la animación. Borramos el fotograma anterior
//   // antes de dibujar el nuevo.
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   // 2. Obtener la lista de jugadores
//   // gameState.players es un OBJETO. Usamos Object.values()
//   // para convertirlo en una LISTA (Array) de jugadores.
//   const players = Object.values(gameState.players);

//   // 3. Dibujar cada jugador
//   // Recorremos la lista y llamamos a nuestra función de dibujo
//   // para cada uno de los jugadores.
//   for (const player of players) {
//     drawPlayer(player);
//   }
// }

// // ---------
// // 4. ESCUCHAR EVENTOS DEL WEBSOCKET
// // ---------

// // Evento: 'open' (Se ejecuta 1 vez cuando la conexión es exitosa)
// ws.addEventListener('open', () => {
//   console.log('¡Conectado al servidor WebSocket en el puerto 3000!');
//   // Ya no necesitamos enviar un "hola" manual.
//   // El servidor nos añadirá al 'gameState' y nos enviará la lista.
// });

// // Evento: 'message' (Se ejecuta CADA VEZ que el servidor nos envía datos)
// ws.addEventListener('message', (event) => {
//   // 'event.data' contiene el mensaje del servidor.
//   // Viene como un texto en formato JSON (ej: '{"players":{...}}')
  
//   // 1. Convertimos el texto JSON de vuelta a un objeto JavaScript
//   const gameState = JSON.parse(event.data);
  
//   // 2. Llamamos a nuestra función para dibujar este nuevo estado
//   renderGame(gameState);
// });

// // Evento: 'close' (Se ejecuta si la conexión se cierra)
// ws.addEventListener('close', () => {
//   console.log('Desconectado del servidor WebSocket');
// });

// // Evento: 'error' (Se ejecuta si hay un error de conexión)
// ws.addEventListener('error', (err) => {
//   console.error('Error en WebSocket:', err);
// });

// // ---------
// // 5. ESCUCHAR TECLAS DEL JUGADOR
// // ---------
// // Añadimos un "escuchador" al navegador para la tecla 'keydown' (tecla presionada)
// window.addEventListener('keydown', (event) => {
//   // 'event.key' nos dice qué tecla se presionó (ej: "ArrowUp")
  
//   // Comprobamos si es una de las teclas de flecha
//   // y enviamos el comando de texto correspondiente al servidor.
//   switch (event.key) {
//     case 'ArrowUp':
//       ws.send('up');
//       break;
//     case 'ArrowDown':
//       ws.send('down');
//       break;
//     case 'ArrowLeft':
//       ws.send('left');
//       break;
//     case 'ArrowRight':
//       ws.send('right');
//       break;
//   }
// });

import './style.css';

// ---------
// 1. DEFINICIÓN DE TIPOS (CLIENTE)
// ---------

interface Player {
  id: string;
  x: number;
  y: number;
  color: string;
}

interface GameState {
  players: { [key: string]: Player };
}

// Mensajes que el CLIENTE envía al SERVIDOR
type ClientMessage =
  | { type: 'start_move'; direction: string }
  | { type: 'stop_move'; direction: string };

// ---------
// 2. CONFIGURACIÓN DEL CANVAS
// ---------

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('No se encontró el elemento #gameCanvas');
}
const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('No se pudo obtener el contexto 2D');
}
canvas.width = 800;
canvas.height = 600;

// ---------
// 3. CONEXIÓN WEBSOCKET
// ---------

const PROD_URL = `ws://${location.host}`;
const DEV_URL = 'ws://localhost:3000';
const wsUrl = import.meta.env.DEV ? DEV_URL : PROD_URL;
console.log(`Conectando a WebSocket en: ${wsUrl}`);
const ws = new WebSocket(wsUrl);

// ---------
// 4. FUNCIONES DE DIBUJADO
// ---------

function drawPlayer(player: Player) {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, 50, 50); // Mantenemos tu tamaño de 50x50
}

function renderGame(gameState: GameState) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const players = Object.values(gameState.players);
  for (const player of players) {
    drawPlayer(player);
  }
}

// ---------
// 5. ESCUCHAR EVENTOS DEL WEBSOCKET
// ---------

ws.addEventListener('open', () => {
  console.log('¡Conectado al servidor WebSocket!');
});

ws.addEventListener('message', (event: MessageEvent) => {
  try {
    const gameState: GameState = JSON.parse(event.data);
    renderGame(gameState);
  } catch (err) {
    console.error('Error al parsear JSON del servidor:', err, event.data);
  }
});

ws.addEventListener('close', () => {
  console.log('Desconectado del servidor WebSocket');
});

ws.addEventListener('error', (event: Event) => {
  console.error('Error en WebSocket:', event);
});

// ---------
// 6. ESCUCHAR TECLAS DEL JUGADOR (¡NUEVA LÓGICA!)
// ---------

// Usamos un Set para rastrear qué teclas están *actualmente* pulsadas.
// Esto evita el "auto-repeat" del teclado.
const keysPressed = new Set<string>();

function keyToDirection(key: string): string | null {
  switch (key) {
    case 'ArrowUp': case 'w': return 'up';
    case 'ArrowDown': case 's': return 'down';
    case 'ArrowLeft': case 'a': return 'left';
    case 'ArrowRight': case 'd': return 'right';
    default: return null;
  }
}

// Evento: 'keydown' (tecla presionada)
window.addEventListener('keydown', (event: KeyboardEvent) => {
  const direction = keyToDirection(event.key);
  if (!direction) return; // No es una tecla de movimiento

  // Si la tecla NO estaba ya pulsada, enviamos el mensaje
  if (!keysPressed.has(direction)) {
    keysPressed.add(direction); // La añadimos al set
    
    const msg: ClientMessage = {
      type: 'start_move',
      direction: direction,
    };
    ws.send(JSON.stringify(msg));
  }
});

// Evento: 'keyup' (tecla soltada)
window.addEventListener('keyup', (event: KeyboardEvent) => {
  const direction = keyToDirection(event.key);
  if (!direction) return;

  // Si la tecla SÍ estaba en el set, la quitamos y enviamos el mensaje
  if (keysPressed.has(direction)) {
    keysPressed.delete(direction); // La quitamos del set
    
    const msg: ClientMessage = {
      type: 'stop_move',
      direction: direction,
    };
    ws.send(JSON.stringify(msg));
  }
});