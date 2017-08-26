'use strict';

import * as vscode from 'vscode';
import * as cp from 'child_process';
import ChildProcess = cp.ChildProcess;
import { Logger } from '../../logging';
import { reporter } from '../../telemetry/telemetry';
import * as messages from '../../messages';

export class pdkTestUnitCommand {
  private logger: Logger = undefined;
  private terminal: vscode.Terminal = undefined;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public run() {
    this.terminal = vscode.window.createTerminal('pdk');
    this.terminal.sendText(`pdk test unit`);
    this.terminal.show();
    if (reporter) {
      reporter.sendTelemetryEvent('command', {
        command: messages.PDKCommandStrings.PdkTestUnitCommandId
      });
    }
  }

  public dispose(): any {
    this.terminal.dispose();
    this.terminal = undefined;
  }
}