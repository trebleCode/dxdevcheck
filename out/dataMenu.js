"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
class DataMenuProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this._workspaceRoot = vscode.workspace.rootPath;
        this._workspaceFolders = fs.readdirSync(this._workspaceRoot);
        let workspaceFolders = this._workspaceFolders;
        for (let folder in workspaceFolders) {
            if (workspaceFolders[folder] === "Data") {
                let checkIsDirectory = fs.statSync(`${this._workspaceRoot}\\Data`).isDirectory();
                if (checkIsDirectory === true) {
                    this._dataFolder = `${this._workspaceRoot}\\Data`;
                }
                else {
                    vscode.window.showErrorMessage("Workspace root does not contain a folder named 'Data'");
                }
            }
        }
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return element.children;
        }
        else {
            let jsonChildren = this.getJSONFiles(this._dataFolder);
            let listParent = new DataMenu("Objects", vscode.TreeItemCollapsibleState.Expanded, this._workspaceRoot, null, null, []);
            let dataMenu = this.createDataMenu(listParent, jsonChildren);
            return [dataMenu];
        }
    }
    createDataMenu(parent, children) {
        let menuChildren = [];
        let myCommand = { command: 'dataMenu.toggleSelection', title: 'Toggle Selection' };
        for (let item in children) {
            let childMenuItem = new DataMenu(children[item], vscode.TreeItemCollapsibleState.None, vscode.Uri.file(`${this._workspaceRoot}\\${children[item]}`), vscode.FileType.File, false, null, myCommand, {
                light: path.join(__filename, "..", "..", "resources", "light", "check-empty.svg"),
                dark: path.join(__filename, "..", "..", "resources", "dark", "check-empty.svg")
            });
            menuChildren.push(childMenuItem);
        }
        parent.children = menuChildren;
        return parent;
    }
    getJSONFiles(source) {
        let children = fs.readdirSync(source, 'utf-8');
        let extensionType = ".json";
        let targetChildren = [];
        for (let child in children) {
            if (typeof children[child] === "string") {
                let currentChild = children[child].toString();
                if (path.extname(currentChild).toLowerCase() === extensionType) {
                    targetChildren.push(currentChild);
                }
            }
        }
        if (targetChildren.length > 0) {
            return targetChildren;
        }
        else {
            return null;
        }
    }
}
exports.DataMenuProvider = DataMenuProvider;
class DataMenu extends vscode.TreeItem {
    constructor(label, collapsibleState, uri, type, isSelected, children, command, iconPath) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.uri = uri;
        this.type = type;
        this.isSelected = isSelected;
        this.children = children;
        this.command = command;
        this.iconPath = iconPath;
    }
    toggleSelectedIcon() {
        let newLightUncheckedIcon;
        let newLightCheckedIcon;
        let newDarkUncheckedIcon;
        let newDarkCheckedIcon;
        newLightUncheckedIcon = path.join(__filename, "..", "..", "resources", "light", "check-empty.svg");
        newLightCheckedIcon = path.join(__filename, "..", "..", "resources", "light", "check.svg");
        newDarkUncheckedIcon = path.join(__filename, "..", "..", "resources", "dark", "check-empty.svg");
        newDarkCheckedIcon = path.join(__filename, "..", "..", "resources", "dark", "check-empty.svg");
        if (this.iconPath === undefined) {
            this.iconPath = {
                light: newLightUncheckedIcon, dark: newDarkUncheckedIcon
            };
            this.isSelected = false;
        }
        else if (this.iconPath.light === newLightUncheckedIcon || this.iconPath.dark === newDarkUncheckedIcon) {
            this.iconPath = { light: newLightCheckedIcon, dark: newDarkCheckedIcon };
            this.isSelected = true;
        }
        else if (this.iconPath.light === newLightCheckedIcon || this.iconPath.dark === newDarkCheckedIcon) {
            this.iconPath = { light: newLightUncheckedIcon, dark: newDarkUncheckedIcon };
            this.isSelected = false;
        }
    }
}
exports.DataMenu = DataMenu;
//# sourceMappingURL=dataMenu.js.map