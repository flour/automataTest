'use strict';

export { UserInGame, UserMessage };

interface Message {
	userId: number;
	messageType: string,
	name: string;
	message: string;
}

class UserMessage implements Message {
	private data: { userId: number, messageType: string, name: string; message: string };

	constructor(payload: string) {
		var data = JSON.parse(payload);

		if (!data.message) {
			throw new Error('Invalid message payload received: ' + payload);
		}
		if (!data.userId)
			data.userId == 0;
		this.data = data;
	}

	get userId(): number {
		return this.data.userId;
	}

	get messageType(): string {
		return this.data.messageType;
	}

	get name(): string {
		return this.data.name;
	}

	get message(): string {
		return this.data.message;
	}
}

class UserInGame {
	private data: { userId: number, ws: any /*socket*/ }

	constructor(userId: number, ws: any) {
		let data = { userId: userId, ws: ws}
		this.data = data;
	}

	get userId(): number {
		return this.data.userId;
	}

	get ws(): any {
		return this.data.ws;
	}
}