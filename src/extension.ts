import * as vscode from 'vscode';

import { ValidateMenuProvider } from './validateMenu';
import { DataMenuProvider } from './dataMenu';

export async function activate(context: vscode.ExtensionContext) {

    const VMP = new ValidateMenuProvider();
    vscode.window.registerTreeDataProvider('validateMenu', VMP);
    vscode.commands.registerCommand('validateMenu.refreshList', () => VMP.refresh());

    const dataMenuProvider = new DataMenuProvider();
    vscode.window.registerTreeDataProvider('dataMenu', dataMenuProvider);
    vscode.commands.registerCommand('dataMenu.refreshList', () => dataMenuProvider.refresh());
    vscode.commands.registerCommand('dataMenu.toggleSelection', () => vscode.window.showInformationMessage(`Clicked a tree item: ${this}`));
}

export function deactivate() {}
