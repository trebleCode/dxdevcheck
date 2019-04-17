import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export class DataMenuProvider implements vscode.TreeDataProvider<DataMenu> {
    private _onDidChangeTreeData: vscode.EventEmitter<DataMenu | undefined> = new vscode.EventEmitter<DataMenu | undefined>();
    readonly onDidChangeTreeData: vscode.Event<DataMenu | undefined> = this._onDidChangeTreeData.event;

    private _workspaceRoot;
    private _workspaceFolders;
    private _dataFolder;

    constructor() {

        this._workspaceRoot = vscode.workspace.rootPath;
        this._workspaceFolders = fs.readdirSync(this._workspaceRoot);
        let workspaceFolders: Array<string> = this._workspaceFolders;
        for (let folder in workspaceFolders) {
            if (workspaceFolders[folder] === "Data") {
                let checkIsDirectory = fs.statSync(`${this._workspaceRoot}\\Data`).isDirectory();

                if (checkIsDirectory === true) {
                    this._dataFolder = `${this._workspaceRoot}\\Data`;
                } else {
                    vscode.window.showErrorMessage("Workspace root does not contain a folder named 'Data'");
                }
            }
        }
    }

    refresh() {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element?: DataMenu): vscode.TreeItem {
        return element;
    }

    getChildren(element?: DataMenu): DataMenu[] {
        if (element) {
            return element.children;
        } else {
            let jsonChildren = this.getJSONFiles(this._dataFolder);
            let listParent = new DataMenu("Objects", vscode.TreeItemCollapsibleState.Expanded, this._workspaceRoot, null, null, []);
            let dataMenu = this.createDataMenu(listParent, jsonChildren);
            return [dataMenu];
        }
    }

    createDataMenu(parent: DataMenu, children: any[]) {
        let menuChildren: DataMenu[] = [];
        let myCommand: vscode.Command = { command: 'dataMenu.toggleSelection', title: 'Toggle Selection' };

        for (let item in children) {
            let childMenuItem = new DataMenu(children[item],
                vscode.TreeItemCollapsibleState.None,
                vscode.Uri.file(`${this._workspaceRoot}\\${children[item]}`),
                vscode.FileType.File,
                false,
                null, myCommand,
                {
                    light: path.join(__filename, "..", "..", "resources", "light", "check-empty.svg"),
                    dark: path.join(__filename, "..", "..", "resources", "dark", "check-empty.svg")
                });
                menuChildren.push(childMenuItem);
        }
        parent.children = menuChildren;
        return parent;
    }

    getJSONFiles(source: fs.PathLike) {
        let children = fs.readdirSync(source, 'utf-8');
        let extensionType = ".json";
        let targetChildren = [];

        for (let child in children) {
            if(typeof children[child] === "string") {
                let currentChild = children[child].toString();
                if(path.extname(currentChild).toLowerCase() === extensionType) {
                    targetChildren.push(currentChild);
                }
            }
        }

        if (targetChildren.length > 0) {
            return targetChildren;
        } else {
            return null;
        }
    }
}

export class DataMenu extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public uri: vscode.Uri,
        public type?: vscode.FileType,
        public isSelected?: boolean,
        public children?: DataMenu[],
        public readonly command?: vscode.Command,
        public iconPath?
    ) {
        super(label, collapsibleState);
    }

    toggleSelectedIcon(): void {
        let newLightUncheckedIcon: any;
        let newLightCheckedIcon: any;
        let newDarkUncheckedIcon: any;
        let newDarkCheckedIcon: any;

        newLightUncheckedIcon = path.join(__filename, "..", "..", "resources", "light", "check-empty.svg");
        newLightCheckedIcon = path.join(__filename, "..", "..", "resources", "light", "check.svg");
        newDarkUncheckedIcon = path.join(__filename, "..", "..", "resources", "dark", "check-empty.svg");
        newDarkCheckedIcon = path.join(__filename, "..", "..", "resources", "dark", "check-empty.svg");
    
        if (this.iconPath === undefined) {
            this.iconPath = {
                light: newLightUncheckedIcon, dark: newDarkUncheckedIcon
            };
            this.isSelected = false;
        } else if (this.iconPath.light === newLightUncheckedIcon || this.iconPath.dark === newDarkUncheckedIcon) {
            this.iconPath = { light: newLightCheckedIcon, dark: newDarkCheckedIcon };
            this.isSelected = true;
        } else if(this.iconPath.light === newLightCheckedIcon || this.iconPath.dark === newDarkCheckedIcon) {
            this.iconPath = { light: newLightUncheckedIcon, dark: newDarkUncheckedIcon};
            this.isSelected = false;
        }
    }
}