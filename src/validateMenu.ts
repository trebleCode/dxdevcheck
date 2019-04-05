import * as vscode from "vscode";
const validateMenuItems = require("./validateMenuItems.json");
import * as path from "path";
import * as customUtils from "./customUtils";

export class ValidateMenuProvider implements vscode.TreeDataProvider<ValidateMenu> {
    private _onDidChangeTreeData: vscode.EventEmitter<ValidateMenu | undefined> = new vscode.EventEmitter<ValidateMenu | undefined>();
    readonly onDidChangeTreeData: vscode.Event<ValidateMenu | undefined> = this._onDidChangeTreeData.event;

    constructor() {}

    refresh() {
        // Why does this not work to update icons?
        //return this.getValidateMenu(true);
        vscode.window.showInformationMessage('Refresh button clicked!');
    }

    getTreeItem(element?: ValidateMenu): vscode.TreeItem {
        return element;
    }

    getChildren(element?: any, withIcons?: boolean): ValidateMenu[] {
        if(element) {
            return element.children;
        }
        else {
            return this.getValidateMenu();
        }
    }

    getValidateMenu(withIcons?: boolean): ValidateMenu[] {
        const toChild = (label: string, icon?: any): ValidateMenu => { return new ValidateMenu(label,vscode.TreeItemCollapsibleState.None);};
    
        function getMenusFromParent(target: any) {
            let childrenArray: any = [];

            for(let i in target) {
                let currentChild: string = target[i].name;
                let currentConvertedChild = toChild(currentChild);

                if(withIcons === true) {
                    let configCheck = currentConvertedChild.isConfigured(target[i].name);

                    if(configCheck === true) {
                        currentConvertedChild.setConfiguredIcon();
                    }
                    else if(configCheck === false) {
                        currentConvertedChild.setErrorIcon();
                    }
                }
                childrenArray.push(currentConvertedChild);
            }

            return childrenArray;
        }

        function createMenu(label: string, target: any) {
            let childData = getMenusFromParent(target);
            return new ValidateMenu(label, vscode.TreeItemCollapsibleState.Expanded, childData);
        }

        let headings = Object(validateMenuItems.children);
        let child1 = headings['child1'];
        let child2 = headings['child2'];
        let child3 = headings['child3'];
        let child4 = headings['child4'];

        let menus: any = [];
    
        menus.push(createMenu('child1', child1));
        menus.push(createMenu('child2', child2));
        menus.push(createMenu('child3', child3));
        menus.push(createMenu('child4', child4));
    
        return menus;
    }
}


export class ValidateMenu extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public children?: ValidateMenu[],
        public readonly command?: vscode.Command,
        public iconPath?: { light: string, dark: string }
    ) {
        super(label,collapsibleState);
    }

    setConfiguredIcon(): void {
        let newLightIcon: any;
        let newDarkIcon: any;

        newLightIcon = path.join(__filename, '..', '..', 'resources', 'light', 'checkmark.svg');
        newDarkIcon = path.join(__filename, '..', '..', 'resources', 'dark', 'checkmark2.svg');

        if(this.iconPath === undefined) {
            this.iconPath = {light: newLightIcon, dark: newDarkIcon};
        }
        else {
            this.iconPath = {light: newLightIcon, dark: newDarkIcon};
        }
    }

    setErrorIcon(): void {
        let newLightIcon: any;
        let newDarkIcon: any;

        newLightIcon = path.join(__filename, '..', '..', 'resources', 'light', 'confused2.svg');
        newDarkIcon = path.join(__filename, '..', '..', 'resources', 'dark', 'confused.svg');

        if(this.iconPath === undefined) {
            this.iconPath = {light: newLightIcon, dark: newDarkIcon};
        }
        else {
            this.iconPath = {light: newLightIcon, dark: newDarkIcon};
        }
    }

    isConfigured(name: string): boolean {
        if(customUtils.checkIsConfigured(name) === true) {
            return true;
        }
        else {
            return false;
        }
    }
}