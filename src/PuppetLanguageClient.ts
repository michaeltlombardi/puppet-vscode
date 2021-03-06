import { ConnectionStatus } from "./interfaces";
import { LanguageClient } from "vscode-languageclient/lib/main";
import { PuppetStatusBar } from "./PuppetStatusBar";
import { ILogger } from "./logging";
import { LanguageClientOptions } from "vscode-languageclient/lib/client";
import { ServerOptions } from "vscode-languageclient";
import { PuppetVersionDetails, PuppetVersionRequest } from "./messages";
import { ConnectionManager } from "./connection";

export class PuppetLanguageClient {
  connectionStatus: ConnectionStatus;
  connectionManager:ConnectionManager;
  clientOptions: LanguageClientOptions;
  serverOptions: ServerOptions;
  port: number;
  host: string;
  languageServerClient: LanguageClient;
  statusBarItem: PuppetStatusBar;
  logger:ILogger;

  constructor(
    host: string,
    port: number,
    connectionManager:ConnectionManager,
    serverOptions: ServerOptions,
    clientOptions: LanguageClientOptions,
    statusBarItem: PuppetStatusBar,
    logger:ILogger
  ) {
    this.host = host;
    this.port = port;
    this.connectionManager = connectionManager;
    this.serverOptions = serverOptions;
    this.clientOptions = clientOptions;
    this.connectionStatus = ConnectionStatus.NotStarted;
    this.statusBarItem = statusBarItem;
    this.logger = logger;

    const title:string = 'Puppet Editor Service';

    this.languageServerClient = new LanguageClient(title, this.serverOptions, this.clientOptions);
    this.languageServerClient.onReady().then(
      () => {
        logger.debug('Language server client started, setting puppet version');
        this.setConnectionStatus('Loading Puppet', ConnectionStatus.Starting, '');
        this.queryLanguageServerStatus();
      },
      reason => {
        this.setConnectionStatus('Starting Error', ConnectionStatus.Failed, '');
      }
    );

  }

  public setConnectionStatus(statusText: string, status: ConnectionStatus, toolTip: string): void {
    this.connectionStatus = status;
    this.connectionManager.status = status;
    this.statusBarItem.setConnectionStatus(statusText, status, toolTip);
  }

  private queryLanguageServerStatus() {

    return new Promise((resolve, reject) => {
      let count = 0;
      let lastVersionResponse: PuppetVersionDetails;
      let handle = setInterval(() => {
        count++;

        // After 30 seonds timeout the progress
        if (count >= 30 || this.languageServerClient === undefined) {
          clearInterval(handle);
          this.setConnectionStatus(lastVersionResponse.puppetVersion, ConnectionStatus.RunningLoaded, '');
          resolve();
          return;
        }

        this.languageServerClient.sendRequest(PuppetVersionRequest.type).then(versionDetails => {
          lastVersionResponse = versionDetails;
          if (
            versionDetails.factsLoaded &&
            versionDetails.functionsLoaded &&
            versionDetails.typesLoaded &&
            versionDetails.classesLoaded
          ) {
            clearInterval(handle);
            this.setConnectionStatus(lastVersionResponse.puppetVersion, ConnectionStatus.RunningLoaded, '');
            resolve();
          } else {
            let toolTip: string = "";

            toolTip += (versionDetails.classesLoaded ? "✔ Classes: Loaded\n" : "⏳ Classes: Loading...\n");
            toolTip += (versionDetails.factsLoaded ? "✔ Facts: Loaded\n" : "⏳ Facts: Loading...\n");
            toolTip += (versionDetails.functionsLoaded ? "✔ Functions: Loaded\n" : "⏳ Functions: Loading...\n");
            toolTip += (versionDetails.typesLoaded ? "✔ Types: Loaded" : "⏳ Types: Loading...");

            this.setConnectionStatus(lastVersionResponse.puppetVersion, ConnectionStatus.RunningLoading, toolTip);
          }
        });

      }, 1000);

    });
  }
}
