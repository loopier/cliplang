'use babel';

class ConsoleView {
    constructor(serializeState) {
        this.clipConsole = null;
        this.log = null;
    }

    initUI() {
        this.clipConsole = document.createElement('div');
        this.clipConsole.classList.add('cliplang', 'console');

        this.log = document.createElement('div');
        this.clipConsole.appendChild(this.log);

        atom.workspace.addBottomPanel({
            item: this.clipConsole
        });
    }

    serialize() {

    }

    destroy() {
        this.clipConsole.remove();
    }

    logStdout(text) {
        this.logText(text);
    }

    logStderr(text) {
        this.logText(text);
    }
    logText(text) {
        if (!text) return;
        this.clipConsole.scrollTop = this.clipConsole.scrollHeight;
        var textNode = document.createElement("span");
        textNode.innerHTML = text.replace('\n', '<br/>');
        this.log.appendChild(textNode);
    }
}

export default ConsoleView;
