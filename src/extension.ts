import * as vscode from 'vscode';

import { ValidateMenuProvider } from './validateMenu';

export async function activate(context: vscode.ExtensionContext) {

    const VMP = new ValidateMenuProvider();
    vscode.window.registerTreeDataProvider('validateMenu', VMP);
    vscode.commands.registerCommand('validateMenu.refreshList', () => VMP.refresh());
}