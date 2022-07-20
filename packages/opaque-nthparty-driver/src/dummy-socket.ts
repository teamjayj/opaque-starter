export class DummySocket {
    private listeners: Record<string, Function | undefined>;
    private mailbox: Record<string, string | undefined>;

    constructor(private computationId: string) {
        this.listeners = {};
        this.mailbox = {};
    }

    public get(opId: string, tag: string): Promise<string> {
        return new Promise((resolve) => {
            const fullTag = this.formatTag(opId, tag);
            const message = this.mailbox[fullTag];

            if (message == null) {
                this.listeners[fullTag] = resolve;
            } else {
                resolve(message);
                this.mailbox[fullTag] = undefined;
            }
        });
    }

    public give(opId: string, tag: string, message: string): void {
        const fullTag = this.formatTag(opId, tag);
        const listenerFunction = this.listeners[fullTag];

        if (listenerFunction == null) {
            this.mailbox[fullTag] = message;
        } else {
            listenerFunction(message);
            this.listeners[fullTag] = undefined;
        }
    }

    public listen(
        get: Function,
        tag: string,
        callback: Function,
        opId: string
    ): void {
        get = get.bind(null, opId);

        (function thunk(f) {
            get(tag).then((message) => {
                f(message);
                thunk(f);
            });
        })(callback);
    }

    private formatTag(opId: string, tag: string): string {
        return `${this.computationId}:${opId}:${tag}`;
    }
}
