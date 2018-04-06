'use babel'

var fs = require('fs');
var spawn = require('child_process').spawn;
var Range = require('atom').range;
var bootPythonPath = __dirname + "";
var CONST_LINE = 'line';
var CONST_MULTI_LINE = 'multi_line';

export default class REPL {

  repl: null
  consoleView: null

  constructor(consoleView) {
    this.consoleView = consoleView;

    atom.commands.add('atom-workspace', {
        "cliplang:boot": () => {
            if (this.editorIsClipLang()) {
                this.start();
                return;
            }
            console.error('Not a .clip file.');
        }
    });

    atom.commands.add('atom-text-editor', {
        'cliplang:eval': () => this.eval(CONST_LINE),
        'cliplang:eval-multi-line': () => this.eval(CONST_MULTI_LINE)
    });
  }

  getEditor() {
    return atom.workspace.getActiveTextEditor();
  }

  editorIsClipLang() {
    var editor = this.getEditor();
    if (!editor) return false;
    return editor.getGrammar().scopeName === 'source.cliplang';
  }

  initClip() {
    console.log('TODO: Initializing repl.js::initClip()');
  }

  start() {
    this.consoleView.initUI();
    this.initClip();
  }

  eval(evalType) {
    if (!this.editorIsClipLang()) return;
    if (!this.repl) this.start();

    console.log('Evaluating ' + evalType);

    var expressionAndRange = this.currentExpression(evalType);
    var expression = expressionAndRange[0];
    var range = expressionAndRange[1];
    this.evalWithRepl(expression, range);
  }

  currentExpression(evalType) {
    var editor = this.getEditor();
    if (!editor) return;

    var selection = editor.getLastSelection();
    var expression = selection.getText();

    if (expression) {
      var range = selection.getBufferRange();
      return [expression, range]
    } else {
      if (evalType === CONST_LINE) {
        return this.getLineExpression(editor);
      }
      return this.getMultiLineExpression(editor);
    }
  }

  getLineExpression(editor) {
    var cursor = editor.getCursors()[0];
    var range = cursor.getCurrentLineBufferRange();
    var expression = range && editor.getTextInBufferRange(range);
    return [expression, range];
  }

  getMultiLineExpression(editor) {
    var range = this.getCurrentParagraphIncludingComments(editor);
    var expression = editor.getTextInBufferRange(range);
    return [expression, range];
  }

  getCurrentParagraphIncludingComments(editor) {
    var cursor = editor.getLastCursor();
    var startRow = endRow = cursor.getBufferRow();
    var lineCount = editor.getLineCount();

    // lines must include non-whitespace characters
    // and not be outside editor bounds
    while (/\S/.test(editor.lineTextForBufferRow(startRow)) && startRow >= 0) {
        startRow--;
    }
    while (/\S/.test(editor.lineTextForBufferRow(endRow)) && endRow < lineCount) {
        endRow++;
    }
    return {
        start: { row: startRow + 1, column: 0 },
        end: { row: endRow, column: 0 },
    };
  }

  evalWithRepl( expression, range) {
    var self = this;
        if (!expression) return;

        function doIt() {
            var unflash;
            if (range) {
                unflash = self.evalFlash(range);
            }

            function onSuccess() {
                if (unflash) {
                    unflash('eval-success');
                }
            }

            self.sendOscMessage(expression);
            onSuccess();
        }

        doIt();
  }

  evalFlash(range) {
      var editor = this.getEditor();
      var marker = editor.markBufferRange(range, {
          invalidate: 'touch'
      });

      var decoration = editor.decorateMarker(
          marker, {
              type: 'line',
              class: "eval-flash"
          });

      // return fn to flash error / success and destroy the flash
      return function(cssClass) {
          decoration.setProperties({
              type: 'line',
              class: cssClass
          });
          var destroy = function() {
              marker.destroy();
          };
          setTimeout(destroy, 120);
      };
  }

  destory() {
    if (this.repl) {
      this.repl.kill();
    }
  }

  sendOscMessage(expression) {
    console.log("Send OSC:\n", expression, typeof(expression));

    let editor = this.getEditor();
    let path = __dirname + "/cliplang.py";
    this.repl = spawn('python', [path, "'"+expression+"'"], { shell: true });
    this.repl.stderr.on('data', (data) => {
      console.error(data.toString('utf8'));
      this.consoleView.logStderr();
      this.consoleView.logStderr(data.toString('utf8'));
      this.consoleView.logStderr();
    });
    this.repl.stdout.on('data', (data) => this.consoleView.logStdout(data.toString('utf8')));
  }


}
