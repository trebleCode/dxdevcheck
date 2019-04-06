import * as vscode from "vscode";
import * as validateMenuItems from "./validateMenu.json";
import * as path from "path";
import * as customUtils from "./customUtils";

export class ValidateMenuProvider implements vscode.TreeDataProvider<ValidateMenu> {
    private _onDidChangeTreeData: vscode.EventEmitter<ValidateMenu | undefined> = new vscode.EventEmitter<ValidateMenu | undefined>();
    readonly onDidChangeTreeData: vscode.Event<ValidateMenu | undefined> = this._onDidChangeTreeData.event;

    private meh: boolean = false;
    
    constructor() {
        this.meh = false;
    }

    refresh() {
        this.meh = true;
        this._onDidChangeTreeData.fire();
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

    createMenu(label: string, target: any) {
        let childData = this.getMenusFromParent(target);
        return new ValidateMenu(label, vscode.TreeItemCollapsibleState.Expanded, childData);
    }

    toChild = (label: string, icon?: any): ValidateMenu => { 
        return new ValidateMenu(label, vscode.TreeItemCollapsibleState.None); 
    }

    getValidateMenu(withIcons?: boolean): ValidateMenu[] {
       
        let headings = Object(validateMenuItems.children);
        let child1 = headings['child1'];
        let child2 = headings['child2'];
        let child3 = headings['child3'];
        let child4 = headings['child4'];

        let menus: any = [];
    
        menus.push(this.createMenu('child1', child1));
        menus.push(this.createMenu('child2', child2));
        menus.push(this.createMenu('child3', child3));
        menus.push(this.createMenu('child4', child4));

        return menus;
    }

    getMenusFromParent(target: any) {
        let childrenArray: any = [];

        for(let i in target) {
            let currentChild: string = target[i].name;
            let currentConvertedChild = this.toChild(currentChild);

                if(this.meh) {
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