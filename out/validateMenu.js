"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const validateMenuItems = require("./validateMenu.json");
const path = require("path");
const customUtils = require("./customUtils");
class ValidateMenuProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        // Why does this not work to update icons?
        vscode.window.showInformationMessage('Refresh button clicked!');
        return this.getValidateMenu(true);
        //
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element, withIcons) {
        if (element) {
            return element.children;
        }
        else {
            return this.getValidateMenu();
        }
    }
    getValidateMenu(withIcons) {
        const toChild = (label, icon) => { return new ValidateMenu(label, vscode.TreeItemCollapsibleState.None); };
        function getMenusFromParent(target) {
            let childrenArray = [];
            for (let i in target) {
                let currentChild = target[i].name;
                let currentConvertedChild = toChild(currentChild);
                if (withIcons === true) {
                    let configCheck = currentConvertedChild.isConfigured(target[i].name);
                    if (configCheck === true) {
                        currentConvertedChild.setConfiguredIcon();
                    }
                    else if (configCheck === false) {
                        currentConvertedChild.setErrorIcon();
                    }
                }
                childrenArray.push(currentConvertedChild);
            }
            return childrenArray;
        }
        function createMenu(label, target) {
            let childData = getMenusFromParent(target);
            return new ValidateMenu(label, vscode.TreeItemCollapsibleState.Expanded, childData);
        }
        let headings = Object(validateMenuItems.children);
        let child1 = headings['child1'];
        let child2 = headings['child2'];
        let child3 = headings['child3'];
        let child4 = headings['child4'];
        let menus = [];
        menus.push(createMenu('child1', child1));
        menus.push(createMenu('child2', child2));
        menus.push(createMenu('child3', child3));
        menus.push(createMenu('child4', child4));
        return menus;
    }
}
exports.ValidateMenuProvider = ValidateMenuProvider;
class ValidateMenu extends vscode.TreeItem {
    constructor(label, collapsibleState, children, command, iconPath) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.children = children;
        this.command = command;
        this.iconPath = iconPath;
    }
    setConfiguredIcon() {
        let newLightIcon;
        let newDarkIcon;
        newLightIcon = path.join(__filename, '..', '..', 'resources', 'light', 'checkmark.svg');
        newDarkIcon = path.join(__filename, '..', '..', 'resources', 'dark', 'checkmark2.svg');
        if (this.iconPath === undefined) {
            this.iconPath = { light: newLightIcon, dark: newDarkIcon };
        }
        else {
            this.iconPath = { light: newLightIcon, dark: newDarkIcon };
        }
    }
    setErrorIcon() {
        let newLightIcon;
        let newDarkIcon;
        newLightIcon = path.join(__filename, '..', '..', 'resources', 'light', 'confused2.svg');
        newDarkIcon = path.join(__filename, '..', '..', 'resources', 'dark', 'confused.svg');
        if (this.iconPath === undefined) {
            this.iconPath = { light: newLightIcon, dark: newDarkIcon };
        }
        else {
            this.iconPath = { light: newLightIcon, dark: newDarkIcon };
        }
    }
    isConfigured(name) {
        if (customUtils.checkIsConfigured(name) === true) {
            return true;
        }
        else {
            return false;
        }
    }
}
exports.ValidateMenu = ValidateMenu;
//# sourceMappingURL=validateMenu.js.map