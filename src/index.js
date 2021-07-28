console.log(process.env)
/**
 * Setup Redis Database Connection:
 */
const redis = require('redis');
const rdb = redis.createClient({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 6379
});

/**
 * WebSocket Server:
 * - Connect from browser: ws://localhost:8000
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
    port: 8000,
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

ws.on('connection', (socket) => {
    console.log('connection');
    socket.send('socket successful');
    
    rdb.on('ready', () => {
        socket.send('redis connection ready');
        rdb.rpush(['frameworks_list', 'ReactJS', 'Angular'], function(err, reply) {
            socket.send(reply); // 2
        });
    });

    rdb.monitor((err, res) => {
        if (err) {
            socket.send(err.message);
        } else {
            socket.send('redis monitor mode enabled');
        }
    });
    
    rdb.on("monitor", (time, args, rawReply) => {
        // TODO: learn more about monitor... or maybe redis
        const record = {
            time: time,
            args: args,
            raw: rawReply
        };
        socket.send(JSON.stringify(record, null, 4));
    });

    // rdb.on('message', (channel, message) => {});

    socket.on('message', (message) => {
        console.log('message:', message);
        
        rdb.set('LOGGER', message, (reply) => {
            reply.time = Date.now();
            socket.send(JSON.stringify(reply, null, 4));
        })
    });

    socket.on('close', (e) => {
        console.log('close', e);
        // TODO: see if we need to close redis connection or something.
    });
    
    socket.on('error', (err) => {
        console.error('ERROR', err.message);
        socket.send(err.message);
    });
});

