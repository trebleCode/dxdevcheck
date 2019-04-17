"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const validateMenu_1 = require("./validateMenu");
const dataMenu_1 = require("./dataMenu");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const VMP = new validateMenu_1.ValidateMenuProvider();
        vscode.window.registerTreeDataProvider('validateMenu', VMP);
        vscode.commands.registerCommand('validateMenu.refreshList', () => VMP.refresh());
        const dataMenuProvider = new dataMenu_1.DataMenuProvider();
        vscode.window.registerTreeDataProvider('dataMenu', dataMenuProvider);
        vscode.commands.registerCommand('dataMenu.refreshList', () => dataMenuProvider.refresh());
        vscode.commands.registerCommand('dataMenu.toggleSelection', () => vscode.window.showInformationMessage(`Clicked a ree item: ${this}`));
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map