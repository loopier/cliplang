'use babel';

import ConsoleView from './console-view'
import Repl from './repl';
import { CompositeDisposable } from 'atom';

export default {
  consoleView: null,
  cliplangRepl: null,

  activate(state) {
    consoleView = new ConsoleView(state.consoleViewState);
    cliplangRepl = new Repl(consoleView);
  },

  deactivate() {
    consoleView.destroy();
    cliplangRepl.destroy();
  },

  serialize() {
    return {
      consoleViewState: consoleView.serialize()
    };
  }

};
