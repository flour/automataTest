'use strict';

import EventHandler from './eventListener';
import { Automata, Message, Session } from "automata";
const timeout = 100000;

Automata.RegisterFSM({
    name: "AutomataGame",
    state: ["step1", "step2", "step3", "step4", "step5", "step6", "finish"],
    initial_state: "step1",
    transition: [
        { event: "step12", from: "step1", to: "step2", timeout: { millis: timeout } },
        { event: "step23", from: "step2", to: "step3", timeout: { millis: timeout } },
        { event: "step34", from: "step3", to: "step4", timeout: { millis: timeout } },
        { event: "step45", from: "step4", to: "step5", timeout: { millis: timeout } },
        { event: "step56", from: "step5", to: "step6", timeout: { millis: timeout } },
        { event: "step1f", from: "step1", to: "finish" },
        { event: "step2f", from: "step2", to: "finish" },
        { event: "step3f", from: "step3", to: "finish" },
        { event: "step4f", from: "step4", to: "finish" },
        { event: "step5f", from: "step5", to: "finish" },
        { event: "step6f", from: "step6", to: "finish", timeout: { millis: timeout } }
    ]
});

export default class Game {
    private onNext = new EventHandler<string>();
    private onFinish = new EventHandler<void>();
    private gameSession: Session<Game>;

    public get Next() { return this.onNext.expose(); }
    public get Finish() { return this.onFinish.expose(); }

    public NextStep() {
        let transitions = this.gameSession.current_state._exit_transitions;
        let nextStep = Object.keys(transitions)[0];
        this.gameSession.dispatchMessage({ msgId: nextStep });
    }

    public FinishSession() {
        if (this.gameSession.current_state.name == 'finish')
            return;
        let transitions = this.gameSession.current_state._exit_transitions;
        let nextStep = Object.keys(transitions);
        this.gameSession.dispatchMessage({ msgId: nextStep[nextStep.length - 1] });
    }

    step1_enter(session: Session<Game>, state: string, msg: Message) {
        console.log(state + " enter 1 " + JSON.stringify(msg));
        this.gameSession = session;
        this.gameSession.postMessage = session.postMessage;
        this.onNext.trigger("step1");
    };

    step2_enter(session: Session<Game>, state: string, msg: Message) {
        console.log(state + " enter 2" + JSON.stringify(msg));
        this.onNext.trigger("step2");
    };

    step3_enter(session: Session<Game>, state: string, msg: Message) {
        console.log(state + " enter 3 " + JSON.stringify(msg));
        this.onNext.trigger("step3");
    };

    step4_enter(session: Session<Game>, state: string, msg: Message) {
        console.log(state + " enter 4 " + JSON.stringify(msg));
        this.onNext.trigger("step4");
    };

    step5_enter(session: Session<Game>, state: string, msg: Message) {
        console.log(state + " enter 5 " + JSON.stringify(msg));
        this.onNext.trigger("step5");
    };

    step6_enter(session: Session<Game>, state: string, msg: Message) {
        console.log(state + " enter 6 " + JSON.stringify(msg));
        this.onNext.trigger("step6");
    };

    finish_enter(session: Session<Game>, state: string, msg: Message) {
        console.log(state + " finish " + JSON.stringify(msg));
        this.onFinish.trigger();
    };
}