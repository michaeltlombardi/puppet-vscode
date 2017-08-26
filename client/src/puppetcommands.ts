import * as vscode from 'vscode';
import { puppetResourceCommand } from '../src/commands/puppetResourceCommand';
import { pdkNewModuleCommand } from '../src/commands/pdk/pdkNewModuleCommand';
import { pdkNewClassCommand } from '../src/commands/pdk/pdkNewClassCommand';
import { pdkValidateCommand } from '../src/commands/pdk/pdkValidateCommand';
import { pdkTestUnitCommand } from '../src/commands/pdk/pdkTestCommand';
import * as messages from '../src/messages';
import { PuppetNodeGraphContentProvider, isNodeGraphFile, getNodeGraphUri, showNodeGraph } from '../src/providers/previewNodeGraphProvider';
import { IConnectionManager } from './connection';
import { Logger } from './logging';

export function setupPuppetCommands(langID:string, connManager:IConnectionManager, ctx:vscode.ExtensionContext, logger: Logger){

  let resourceCommand = new puppetResourceCommand(connManager, logger);
  ctx.subscriptions.push(resourceCommand);
  ctx.subscriptions.push(vscode.commands.registerCommand(messages.PuppetCommandStrings.PuppetResourceCommandId, () => {
    resourceCommand.run();
  }));

  ctx.subscriptions.push(vscode.commands.registerCommand(messages.PuppetCommandStrings.PuppetNodeGraphToTheSideCommandId,
    uri => showNodeGraph(uri, true))
  );
  
  const contentProvider = new PuppetNodeGraphContentProvider(ctx, connManager);
  const contentProviderRegistration = vscode.workspace.registerTextDocumentContentProvider(langID, contentProvider);

  ctx.subscriptions.push(vscode.workspace.onDidSaveTextDocument(document => {
    if (isNodeGraphFile(document)) {
      const uri = getNodeGraphUri(document.uri);
      contentProvider.update(uri);
    }
  }));
}

export function setupPDKCommands(langID: string, connManager: IConnectionManager, ctx: vscode.ExtensionContext, logger: Logger, terminal: vscode.Terminal) {
  let newModuleCommand = new pdkNewModuleCommand(logger, terminal);
  ctx.subscriptions.push(newModuleCommand);
  ctx.subscriptions.push(vscode.commands.registerCommand(messages.PDKCommandStrings.PdkNewModuleCommandId, () => {
    newModuleCommand.run();
  }));

  let newClassCommand = new pdkNewClassCommand(logger, terminal);
  ctx.subscriptions.push(newClassCommand);
  ctx.subscriptions.push(vscode.commands.registerCommand(messages.PDKCommandStrings.PdkNewClassCommandId, () => {
    newClassCommand.run();
  }));

  let validateCommand = new pdkValidateCommand(logger, terminal);
  ctx.subscriptions.push(validateCommand);
  ctx.subscriptions.push(vscode.commands.registerCommand(messages.PDKCommandStrings.PdkValidateCommandId, () => {
    validateCommand.run();
  }));

  let testUnitCommand = new pdkTestUnitCommand(logger, terminal);
  ctx.subscriptions.push(testUnitCommand);
  ctx.subscriptions.push(vscode.commands.registerCommand(messages.PDKCommandStrings.PdkTestUnitCommandId, () => {
    testUnitCommand.run();
  }));
}
