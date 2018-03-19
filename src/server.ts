'use strict';

import WebSocket = require('ws');
import { Automata, Session, Message } from "automata";
import { UserInGame, UserMessage } from './models';
import Game from "./game";

export default class GameServer {
    lastId: number;
    currentValue: number;
    port: number;
    server: WebSocket.Server;
    currentPlayer: UserInGame;
    currentGame: Game;
    allowedClients: Array<UserInGame>;

    constructor() {
        this.lastId = 0;
        this.currentValue = -1;
        this.port = 3000;
        this.allowedClients = [];
        this.server = new WebSocket.Server({ port: this.port });
        this.server.on('connection', ws => this.initWebSocket(ws));

        console.log('Server is running on port: ', this.port);
    }

    initWebSocket(ws: WebSocket): void {
        if (this.allowedClients.length == 6) {
            console.log('qwe');
            this.sendTo(ws, JSON.stringify({ messageType: 'error', message: "You cannot be a participant. User count limit reached." }));
            ws.close();
            return;
        }
        ws.on('error', error => this.onError(error));
        ws.on('close', (code, reason) => this.onClose(code, reason));
        ws.on('message', msg => this.onMessage(msg));
        this.lastId++;
        this.allowedClients.push(new UserInGame(this.lastId, ws));
        ws.send(JSON.stringify({ messageType: 'accepted', userId: this.lastId, message: "You are in!" }));
        console.log('Got clients:' + this.allowedClients.length);
        if (this.allowedClients.length == 6) {
            this.startGame();
        }
    }


    onMessage(message: WebSocket.Data) {
        try {
            console.log(message);
            var userMessage: UserMessage = new UserMessage(message.toString());
            this.retrieveMessage(userMessage);
        } catch (e) {
            console.error(e.message);
        }
    }

    onError(error: Error) {
        this.removeDisconnected();
    }

    onClose(code: number, reason: string) {
        this.removeDisconnected();
    }

    retrieveMessage(message: UserMessage) {
        if (message.userId == 0 || !message.messageType)
            return;
        switch (message.messageType) {
            case "bcast":
            case "broadcast":
                this.broadcast(JSON.stringify(message));
                break;
            case "choose":
                this.checkAnswer(message.message);
                break;
            case "close":
                let toRemove = this.allowedClients.filter(client => client.userId == message.userId)[0];
                if (toRemove) {
                    toRemove.ws.close();
                    this.allowedClients.splice(this.allowedClients.indexOf(toRemove), 1);
                }
                break;
        }
    }

    removeDisconnected() {
        this.finishGame();
    }

    sendTo(client: WebSocket, data: string): void {
        client.send(data);
    }

    broadcast(data: string): void {
        this.allowedClients.forEach(client => {
            console.log("userId: " + client.userId);
            client.ws.send(data);
        });
    };

    checkAnswer(message) {
        if (!message)
            return;
        if (this.currentValue == parseInt(message)) {
            let msg = JSON.stringify({ messageType: 'finish', userId: this.currentPlayer.userId, message: "got correct answer" });
            this.sendTo(this.currentPlayer.ws, msg);
            this.broadcast(msg);
            this.currentGame.FinishSession();
        } else {
            this.sendTo(this.currentPlayer.ws, JSON.stringify({ messageType: 'finish', message: 'Timeout', userId: -1 }));
            this.currentGame.NextStep();
        }
    }

    startGame() {
        this.currentValue = this.getRandomInt(1, 10);
        console.log('Game started. number is: ' + this.currentValue);
        this.broadcast(JSON.stringify({ messageType: "start", message: "Game started" }));
        this.currentGame = new Game();
        this.currentGame.Next.on(step => { this.stepChanged(step); });
        this.currentGame.Finish.on(() => { this.finishGame(); });
        Automata.CreateSession(this.currentGame, "AutomataGame");
    }

    finishGame() {
        console.log("Game finished");
        this.allowedClients = [];
        this.currentPlayer = null;
        if (this.currentGame) {
            this.currentGame.FinishSession();
        }
    }

    stepChanged(step: string) {
        console.log("Current step is: " + step);
        if (this.currentPlayer) {
            this.sendTo(this.currentPlayer.ws, JSON.stringify({ messageType: 'finish', message: 'Timeout', userId: -1 }));
        }
        let pIndex = this.getRandomInt(0, this.allowedClients.length - 1);
        this.currentPlayer = this.allowedClients[pIndex];
        if (this.currentPlayer) {
            console.log('Current user: ' + this.currentPlayer.userId);
            this.allowedClients.splice(pIndex, 1);
            this.sendTo(this.currentPlayer.ws, JSON.stringify({ messageType: 'yourturn', userId: this.currentPlayer.userId, message: 'It is time to choose' }));
        }
    }

    getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}