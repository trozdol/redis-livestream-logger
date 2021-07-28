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

If you have a Redis database running elsewhere, you can run the node server on it's own.

    NODE_ENV=development DB_HOST=localhost DB_PORT=6379 WS_HOST=localhost WS_PORT=8000 npm start
