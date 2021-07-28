const { DB_HOST, DB_PORT, WS_HOST, WS_PORT } = process.env;
console.log({ DB_HOST, DB_PORT, WS_HOST, WS_PORT });

/**
 * Setup Redis Database Connection:
 */
const redis = require('redis');
const rdb = redis.createClient({
    host: DB_HOST || 'localhost',
    port: DB_PORT || 6379
});

/**
 * WebSocket Server:
 */
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

// to handle ssl directly, uncomment below and provide the paths
// const { createServer } = require('https');
// const { readFileSync } = require('fs');
// const httpsServer = createServer({
//     cert: readFileSync('/path/to/cert.pem'),
//     key: readFileSync('/path/to/key.pem')
// });

const ws = new WebSocketServer({
    // when using ssl
    // server: httpsServer,
    port: WS_PORT || 8000,
    perMessageDeflate: {
        zlibDeflateOptions: { chunkSize: 1024, memLevel: 7, level: 3 },
        zlibInflateOptions: { chunkSize: 10 * 1024 },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
    }
});
const socketConnections = new Map();
var status = {
    websockets: false,
    redis : false
};
ws.on('connection', (socket) => {
    console.log('websocket: on connection');
    
    const broadcast = (data) => {
        console.log('<-', data);
        if (!data) return;
        
        if (typeof data === 'object') {
            socket.send(JSON.stringify(data, null, 4), (err) => {
                console.error('websocket send error:', err);
            });
        } else {
            socket.send(JSON.stringify({ time: Date.now(), args: [data] }, null, 4), (err) => {
                console.error('websocket send error:', err);
            });
        }
    }

    broadcast(`websocket connection success`);
    broadcast(`redis is ${status.redis ? 'is' : 'is not'} ready`);
    rdb.on('ready', () => {
        status.redis = true;
        broadcast(`redis is ${status.redis ? 'is' : 'is not'} ready`);
    });

    rdb.monitor((err, res) => {
        if (err) {
            console.error('ERROR', err);
            broadcast(err?.message || err);
        } else {
            broadcast('redis monitor mode enabled');
        }
    });

    rdb.on("monitor", (time, args, rawReply) => {
        const record = {
            time: time,
            args: args,
            raw: rawReply
        };
        broadcast(record);
    });

    rdb.on("error", (err) => {
        console.error('REDIS Error:', err);
        broadcast(err);
    })

    rdb.on('message', (channel, message) => {
        console.log('redis on message:', channel, message)
    });

    socket.on('message', (message) => {
        console.log('->', message);
        broadcast(`received message: "${message}"`);
    });

    socket.on('close', (e) => {
        console.log('close', e);
        // TODO: see if we need to close redis connection or something.
    });
    
    socket.on('error', (err) => {
        console.error('WebSocket ERROR', err);
        broadcast('WebSocket ERROR' + err);
    });

    
});

