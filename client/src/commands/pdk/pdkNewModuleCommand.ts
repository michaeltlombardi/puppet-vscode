'use strict';

import * as vscode from 'vscode';
import * as cp from 'child_process';
import ChildProcess = cp.ChildProcess;
import { Logger } from '../../logging';
import { reporter } from '../../telemetry/telemetry';
import * as messages from '../../messages';
import * as path from "path";
import * as os from "os";

export class PdkTerminal{

  private terminal: vscode.Terminal = undefined;

  constructor() {
    
  }

  public start() {
    this.terminal.show(true);
    this.terminal.processId.then(
      pid => {
        console.log("powershell.exe started, pid: " + pid);
      });
  }

  public dispose() {
    this.terminal.dispose();
    this.terminal = undefined;
  }
}

export class pdkNewModuleCommand {
  private logger: Logger = undefined;
  private terminal: vscode.Terminal = undefined;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public run() {
    let nameOpts: vscode.QuickPickOptions = {
      placeHolder: "Enter a name for the new Puppet module",
      matchOnDescription: true,
      matchOnDetail: true
    };
    let dirOpts: vscode.QuickPickOptions = {
      placeHolder: "Enter a path for the new Puppet module",
      matchOnDescription: true,
      matchOnDetail: true
    };

    vscode.window.showInputBox(nameOpts).then(moduleName => {
      vscode.window.showInputBox(dirOpts).then(dir => {
        this.terminal = vscode.window.createTerminal('pdk');
        this.terminal.sendText(`pdk new module --skip-interview ${moduleName} ${dir} && code ${dir} `);
        this.terminal.show();
        if (reporter) {
          reporter.sendTelemetryEvent('command', {
            command: messages.PDKCommandStrings.PdkNewModuleCommandId
          });
        }
      })
    })
  }

  public dispose(): any {
    this.terminal.dispose();
    this.terminal = undefined;
  }
}


// export class pdkNewModuleCommand {
//   private logger: Logger = undefined;
//   private terminal: vscode.Terminal = undefined;

//   constructor(logger: Logger, terminal: vscode.Terminal) {
//     this.logger = logger;
//     this.terminal = terminal;
//   }

//   public run() {
//     let nameOpts: vscode.QuickPickOptions = {
//       placeHolder: "Enter a name for the new Puppet module",
//       matchOnDescription: true,
//       matchOnDetail: true
//     };
//     let dirOpts: vscode.QuickPickOptions = {
//       placeHolder: "Enter a path for the new Puppet module",
//       matchOnDescription: true,
//       matchOnDetail: true
//     };

//     vscode.window.showInputBox(nameOpts).then(moduleName => {
//       vscode.window.showInputBox(dirOpts).then(dir => {
//         let command = "pdk";
//         let args = ["new", "module", "--skip-interview", moduleName, dir];
//         let options = {
//           shell: true,
//         };
//         args.concat

//         let proc = cp.spawn(command, args, options);
//         if (!proc.pid) return;

//         proc.stdout.on('data', (data: Buffer) => {
//           this.logger.debug("OUTPUT: " + data.toString());
//         })
//         proc.stderr.on('data', (err: Buffer) => {
//           this.logger.error(err.toString());
//         })

//         proc.stdout.on('end', () => {
//           this.openWorkspacePath(dir);
//           vscode.window.showInformationMessage(`Your new Puppet module is created at '{dir}'`)
//           if (reporter) {
//             reporter.sendTelemetryEvent('command', {
//               command: messages.PDKCommandStrings.PdkNewModuleCommandId
//             });
//           }
//         });
//       })
//     })
//   }
  
//   private openWorkspacePath(workspacePath: string) {
//     let v = os.homedir()
//     let f = path.resolve(workspacePath);
//     let dir = vscode.Uri.parse(workspacePath);
//     vscode.Uri.parse
//     vscode.commands.executeCommand("vscode.openFolder", dir, false);
//   }

//   public dispose(): any {
//   }
// }
