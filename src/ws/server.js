import {WebSocket, WebSocketServer} from 'ws';
import {wspArcjet} from "../../arcjet.js";

function sendJson(socket, payload) {

    if(socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));
}

function broadCast(wss, payload) {
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) {
            continue;
        }

        client.send(JSON.stringify(payload));
    }
}

export function attachWebSocketServer(server) {
    const wss = new WebSocketServer({
        server,
        path: '/ws',
        maxPayload: 1024 * 1024,
    })

    wss.on('connection', async (socket, req) => {

        if(wspArcjet){
            try{
                const decision = await wspArcjet.protect(req);

                if(decision.isDenied()){
                    const code = decision.reason.isRateLimit() ? 1013 : 1008;
                    const reason = decision.reason.isRateLimit() ? 'Rate limit reached' : 'Access Denied';

                    socket.close();
                    return;
                }
            } catch(e){
                console.error('Ws connection failed:', e);
                socket.close(1011, 'Server security Error');
                return;
            }
        }

        socket.isAlive = true;
        socket.on('pong', () => {socket.isAlive = true});


        sendJson(socket, {type: 'welcome'});

        socket.on('error', console.error);
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if(ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping();
        });
    }, 3000);

    wss.on('close', () => clearInterval(interval));

    function broadCastMatchCreated(match){
        broadCast(wss, {type: 'match_created', data: match})
    }

    return {broadCastMatchCreated}

}