
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