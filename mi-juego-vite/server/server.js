// ---------
// 1. IMPORTACIONES
// ---------
const fastify = require('fastify')({ logger: true });
const path = require('path');
const static = require('@fastify/static');
const cors = require('@fastify/cors');
const WebSocket = require('ws');

// ---------
// 2. CONFIGURACIÓN DE FASTIFY Y CORS (¡Clave!)
// ---------

// Registramos el plugin de CORS
fastify.register(cors, {
  origin: 'http://localhost:5173', // Permite conexiones SOLO desde el servidor de Vite
});

// Servimos archivos estáticos para PRODUCCIÓN
// Esto le dice a Fastify que, cuando construyamos el juego,
// los archivos finales estarán en la carpeta '../client/dist'
fastify.register(static, {
  root: path.join(__dirname, '..', 'client', 'dist'),
  prefix: '/',
});

// ---------
// 3. ESTADO DEL JUEGO 
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
// 4. CONFIGURACIÓN DE WEBSOCKETS 
// ---------
const wss = new WebSocket.Server({ server: fastify.server });

// Función de "Broadcast"
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Lógica de conexión
wss.on('connection', (ws) => {
  console.log('Cliente conectado');

  // 1. Crear y añadir jugador
  const playerId = Date.now().toString();
  const newPlayer = {
    id: playerId,
    x: Math.floor(Math.random() * 750),
    y: Math.floor(Math.random() * 550),
    color: getRandomColor(),
  };
  gameState.players[playerId] = newPlayer;

  // 2. Asociar ID con la conexión
  ws.playerId = playerId;

  // 3. Enviar estado a todos
  broadcast(JSON.stringify(gameState));

  // Lógica de mensajes (movimiento)
  ws.on('message', (message) => {
    const command = message.toString();
    const player = gameState.players[ws.playerId];

    if (player) {
      const moveSpeed = 10;
      switch (command) {
        case 'up': player.y -= moveSpeed; break;
        case 'down': player.y += moveSpeed; break;
        case 'left': player.x -= moveSpeed; break;
        case 'right': player.x += moveSpeed; break;
      }
      // Transmitir el nuevo estado después del movimiento
      broadcast(JSON.stringify(gameState));
    }
  });

  // Lógica de desconexión
  ws.on('close', () => {
    console.log('Cliente desconectado');
    // Eliminar jugador y transmitir estado
    delete gameState.players[ws.playerId];
    broadcast(JSON.stringify(gameState));
  });
});

// ---------
// 5. INICIAR EL SERVIDOR 
// ---------
const start = async () => {
	try {
	  //await fastify.listen({ port: 3000 }); // acepta conexiones solo en localhost
		await fastify.listen({ port: 3000, host: '0.0.0.0' }) //acepta conexiones de cualquier maquina y desde cualquier interface de red 
		console.log('Servidor escuchando en el puerto 3000');
  	} catch (err) {
    	fastify.log.error(err);
    	process.exit(1);
  	}
};

start();
