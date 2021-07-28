# Redis Livestream Logger

Live stream Redis activity using WebSockets and Node.

## Dependencies:

What I used at the time of making this.

- node v16.5.0
- npm 7.19.1
- docker 20.10.7
- docker-compose 1.29.2

## Getting Started:

    git clone https://github.com/trozdol/redis-livestream-logger.git

    cd redis-livestream-logger

    npm install

## Using Docker:

    docker-compose up

| SERVICE     | URL                    |
|:------------|:-----------------------|
| application | https://localhost:8080 |
| websocket   | https://localhost:8090 |
| websocket   | https://localhost/live |
| redis       | https://localhost:6379 |

Changes made to in `./src` and `./www` will update in each docker container. The node api container is also running nodemon when it starts to automatically pick up changes.

## Using Outside of Docker

If you have a Redis database running elsewhere, you can run the node server on it's own. You can still use the example client app by updating the `./www/index.js` file like below.

#### `./www/index.js`
```javascript

// docker nginx proxy using a path
// var WEBSOCKET_API_URL = 'ws://localhost:8080/live';

// docker nginx proxy using a port open to node server
// var WEBSOCKET_API_URL = 'ws://localhost:8090';

// when running node standalone bringing your own redis db and webserver
var WEBSOCKET_API_URL = 'ws://localhost:8000';

// ...
```

Then start the node server.

```bash

NODE_ENV=development \
DB_HOST=localhost \
DB_PORT=6379 \
WS_HOST=localhost \
WS_PORT=8000 \
npm start

```

Then load up the `./wwww/index.html` file using whatever webserver you want to use.