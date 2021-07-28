var WEBSOCKET_API_URL = 'ws://localhost:8080/live';
// var WEBSOCKET_API_URL = 'ws://localhost:8090';
// var WEBSOCKET_API_URL = 'ws://localhost:8000';

var ws = openStream();
var table = document.querySelector('table tbody');
var connect = document.querySelector('button#connect');
var disconnect = document.querySelector('button#disconnect');

connect.addEventListener('click', (e) => {
    if (ws && ws.CLOSED) ws = openStream();
});

disconnect.addEventListener('click', (e) => {
    ws && ws.close(1000, 'user disconnected');
});

function openStream() {
    var connection = new WebSocket(WEBSOCKET_API_URL);

    connection.addEventListener('open', () => {
        connect.disabled = true;
        disconnect.disabled = false;

        connection.send(`hello from browser`);
    });

    connection.addEventListener('message', (e) => {
        var rec;
        try {
            rec = JSON.parse(e.data);
        } catch (err) {
            console.log(e);
            rec = {
                time: Date.now(),
                args: [ e.data ],
            };
        }

        let row = table.insertRow(0);
        
        let argsTable = document.createElement('table');
        let argsTableBody = argsTable.createTBody();
        
        let a = row.insertCell(0);
        a.innerText = rec.time;

        let b = row.insertCell(1);
        
        if (typeof rec === 'string') {
            b.innerText = rec;
        } else {
            rec.args.forEach((arg, index) => {

                let rowIndex = argsTableBody.rows.length;
                let row = argsTableBody.insertRow(rowIndex);

                let a = row.insertCell(0);
                a.innerText = index;
    
                let b = row.insertCell(1);
                b.innerText = arg;
            });
            b.appendChild(argsTable);
        }

        // handle inevitable memory leak
        if (table.rows.length > 100) {
            table.deleteRow(table.rows.length-1);
        }
    })
    
    connection.addEventListener('error', (e) => {
        console.error('error', e);
    })
    
    connection.addEventListener('close', () => {
        console.log('close');
        
        connect.disabled = false;
        disconnect.disabled = true;
        
        ws = openStream();
    })

    return connection;
}