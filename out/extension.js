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
const fs = require("fs");
const path = require("path");
const ini = require('ini');
let validJavaInstalls = 0;
let validJavaInstallNames = [];
let username = process.env.USERNAME;
let userProfile = String(process.env.USERPROFILE);
const JFile = require('jfile');
function checkDirectorySync(directory) {
    try {
        fs.statSync(directory);
        return true;
    }
    catch (e) {
        return false;
    }
}
function getChildDirectories(directory) {
    return fs.readdirSync(directory)
        .map(file => path.join(directory, file))
        .filter(path => fs.statSync(path).isDirectory);
}
function getChildDirectoriesWithoutMap(directory) {
    return fs.readdirSync(directory)
        .map(file => path.join(directory, file));
}
function checkFileExistsInTargetFolder(directory, file) {
    if (fs.existsSync(directory + file)) {
        return true;
    }
    else {
        return false;
    }
}
function checkContainsKey(keyname, arr) {
    let hasKey = false;
    let counter = 0;
    for (var i = 0; i < arr.length; i++) {
        if (keyname === arr[i].key) {
            counter++;
        }
    }
    if (counter > 0) {
        hasKey = true;
    }
    return hasKey;
}
function checkKeyValue(keyname, keyvalue, arr) {
    let hasKeyValue = false;
    if (arr[keyname] === keyvalue) {
        hasKeyValue = true;
    }
    return hasKeyValue;
}
function sliceOnceAndMap(arrayToMap, sliceCharacter) {
    let thisMap = arrayToMap
        .filter((entry) => entry !== '\n' && entry !== "" && entry !== "\r" && entry !== "{" && entry !== "}")
        .map((item) => {
        var k = item.trim().substr(0, item.indexOf(':') - 3);
        var v = item.trim().slice(item.indexOf(sliceCharacter) - 2);
        return {
            key: k,
            value: v
        };
    });
    return thisMap;
}
function setConfigFileMap(arrayToMap, splitCharacter) {
    let thisMap = arrayToMap
        .filter((entry) => entry !== '\n' && entry !== "" && entry !== "\r" && entry !== "{" && entry !== "}")
        .map((item) => {
        var itemSplit = item.split(splitCharacter);
        var k = itemSplit[0].trim().replace(/\/$/, '');
        var v = itemSplit[1].trim().replace(/\/$/, '');
        return {
            key: k,
            value: v
        };
    });
    return thisMap;
}
function appendItemsToConfigFile(file, configItems, firstItemStartsNewLine) {
    let counter = 0;
    configItems.forEach(function (item) {
        if (firstItemStartsNewLine === true && counter === 0) {
            fs.writeFileSync(file, `\n${item}\n`, { encoding: 'utf-8', flag: 'a' });
        }
        else {
            fs.writeFileSync(file, `${item}\n`, { encoding: 'utf-8', flag: 'a' });
        }
        counter++;
    });
    return;
}
function compareMapsAndSetNewConfig(requiredMap, previousMap, configFile) {
    let newConfig = new Array();
    for (var z = 0; z < requiredMap.length; z++) {
        let checkKey = checkContainsKey(requiredMap[z].key, previousMap);
        if (checkKey === true) {
            let checkValue = checkKeyValue(requiredMap[z].key, requiredMap[z].value, previousMap);
            // the right key is present but has the wrong value
            if (checkValue === false) {
                let configItem = requiredMap[z].key + '=' + requiredMap[z].value + '\r';
                newConfig.push(configItem);
            }
            else if (checkValue === true) {
                console.log('Configuration already has key ' + requiredMap[z].key + ' with correct value: ' + requiredMap[z].value);
            }
        }
        // doesn't have the required key at all
        else if (checkKey === false) {
            let configItem = requiredMap[z].key + '=' + requiredMap[z].value + '\r';
            newConfig.push(configItem);
        }
    }
    // now we check the previous config for any other key/value pairs
    // that don't match the keys in the requirements
    // this will allow us to preserve any other settings the dev may have setup
    console.log('\nChecking previous configuration for any miscellaneous keys');
    for (var c = 0; c < previousMap.length; c++) {
        let isInRequiredConfig = checkContainsKey(previousMap[c].key, requiredMap);
        if (isInRequiredConfig === false) {
            let configItem = previousMap[c].key + '=' + previousMap[c].value + '\r';
            newConfig.push(configItem);
        }
        else {
            console.log('Key ' + previousMap[c].key + ' is already in required config');
        }
    }
    // clear the contents of the existing file to 0 bytes
    fs.truncateSync(configFile, 0);
    console.log('Config file has been truncated');
    // write the new configuration to the existing file
    appendItemsToConfigFile(configFile, newConfig);
    console.log("Finished writing new configuration file");
}
function getLatestValidJavaInstall(validInstalls) {
    let latestInstall = validInstalls.slice(-1)[0];
    return latestInstall;
}
function runJavaCheck() {
    var javaCheck = checkDirectorySync('C:\\Program Files\\Java');
    if (javaCheck === true) {
        vscode.window.showInformationMessage('Java folder found');
        // Check that a jdk 1.8 folder exists or not
        let jdkChildren = getChildDirectories('C:\\Program Files\\Java').filter(child => child.valueOf().includes('jdk1.8.'));
        if (jdkChildren.length > 0) {
            console.log("Number of Java JDK 1.8 folders: " + jdkChildren.length);
            // Check that java.exe exists in at least one of the target paths found
            for (var i = 0; i < jdkChildren.length; i++) {
                let currentCheck = checkFileExistsInTargetFolder(jdkChildren[i], '\\bin\\java.exe');
                if (currentCheck === true) {
                    validJavaInstalls++;
                    console.log('Valid JDK 1.8 install: ' + jdkChildren[i]);
                    vscode.window.showInformationMessage('Success: Java JDK validation passed');
                    validJavaInstallNames.push(jdkChildren[i]);
                }
                else {
                    console.log('Path ' + jdkChildren[i] + ' does not contain a valid Java executable');
                }
            }
            if (validJavaInstallNames.length > 0) {
                const latestJavaInstallPath = getLatestValidJavaInstall(validJavaInstallNames);
                console.log('Valid JDK 1.8 installs: ' + validJavaInstalls);
                vscode.window.showInformationMessage('Success: Java JDK validation passed');
                return latestJavaInstallPath;
            }
        }
        else {
            console.log('No valid JDK 1.8 installations found');
            vscode.window.showErrorMessage('Failure: No valid JDK 1.8 installations found');
            return null;
        }
    }
    else {
        vscode.window.showErrorMessage('Failure: Java folder NOT found');
        return null;
    }
}
function runNodeCheck(programFiles) {
    let nodejsFolders = programFiles.filter(child => child.valueOf().includes('nodejs'));
    if (nodejsFolders.length === 1) {
        // verify that the only folder is 'nodejs' and not additional ones renamed with a (1), etc.
        var nodejsCheck = checkDirectorySync('C:\\Program Files\\nodejs');
        if (nodejsCheck === true) {
            vscode.window.showInformationMessage('nodejs folder found');
            let currentCheck = checkFileExistsInTargetFolder(nodejsFolders[0], '\\node.exe');
            if (currentCheck === true) {
                console.log('\nValid nodejs install: ' + nodejsFolders[0]);
                vscode.window.showInformationMessage('Success: NodeJS validation passed');
            }
            else {
                console.log('\nPath ' + nodejsFolders[0] + ' does not contain a valid node.exe executable');
                vscode.window.showErrorMessage('Faliure: No valid NodeJS installation found');
            }
        }
        else {
            vscode.window.showErrorMessage('Faliure: nodejs folder NOT found. Please check the names of your folders in \\Program Files that have "nodejs" included in the name');
        }
    }
}
function runGitCheck(programFiles) {
    let gitbashFolders = programFiles.filter(child => child.valueOf().includes('Git'));
    if (gitbashFolders.length === 1) {
        // verify that the only folder is 'Git' and not additional ones renamed with a (1), etc.
        var gitCheck = checkDirectorySync('C:\\Program Files\\Git');
        if (gitCheck === true) {
            vscode.window.showInformationMessage('Success: Git folder found');
            let currentCheck = checkFileExistsInTargetFolder(gitbashFolders[0], '\\git-bash.exe');
            if (currentCheck === true) {
                console.log('\nValid Git install: ' + gitbashFolders[0]);
                vscode.window.showInformationMessage('Success: git-bash validation passed');
            }
            else {
                console.log('\nPath ' + gitbashFolders[0] + ' does not contain a valid git-bash.exe executable');
            }
        }
        else {
            vscode.window.showErrorMessage('Git folder NOT found. Please check the names of your folders in \\Program Files that have "Git" included in the name');
        }
    }
}
function runSFDXCheck(programFiles) {
    let sfdxcliFolders = programFiles.filter(child => child.valueOf().includes('Salesforce CLI'));
    if (sfdxcliFolders.length === 1) {
        var sfdxCheck = checkDirectorySync('C:\\Program Files\\Salesforce CLI');
        if (sfdxCheck === true) {
            vscode.window.showInformationMessage('Success: Salesforce CLI folder found in Program Files');
            let clientCheck = getChildDirectories(sfdxcliFolders[0]).filter(child => child.valueOf().includes('client'));
            if (clientCheck !== null) {
                console.log('\nSalesforce CLI\\client folder exists: ' + clientCheck);
                // check that a bin subfolder exists
                let binCheck = getChildDirectories(clientCheck[0]).filter(child => child.valueOf().includes('bin'));
                if (binCheck !== null) {
                    console.log('Salesforce CLI\\client\\bin folder exists: ' + binCheck);
                    let neededFiles = 0;
                    // check that node.exe, sfdx.cmd, and sfdx.js all exist in this folder
                    let nodeExeCheck = checkFileExistsInTargetFolder(binCheck[0], '\\node.exe');
                    if (nodeExeCheck) {
                        neededFiles++;
                    }
                    let sfdxCmdCheck = checkFileExistsInTargetFolder(binCheck[0], '\\sfdx.cmd');
                    if (sfdxCmdCheck) {
                        neededFiles++;
                    }
                    let sfdxJsCheck = checkFileExistsInTargetFolder(binCheck[0], '\\sfdx.js');
                    if (sfdxJsCheck) {
                        neededFiles++;
                    }
                    if (neededFiles === 3) {
                        console.log('All required files for SFDX CLI present in Program Files\\Salesforce CLI\\client\\bin');
                        vscode.window.showInformationMessage('Success: All necessary files for SFDX CLI are present');
                    }
                    else if (neededFiles < 3) {
                        console.log('One or more files for SFDX CLI are missing in Program Files\\Salesforce CLI\\client\\bin');
                        vscode.window.showErrorMessage('Failure: One or more files for SFDX CLI are missing at Program Files\\Salesforce CLI\\client\\bin (node.exe, sfdx.cmd, sfdx.js)');
                    }
                }
                else {
                    console.log("No bin subdirectory found at C:\\Program Files\\Salesforce CLI\\client");
                    vscode.window.showErrorMessage('Failure: No bin subdirectory found at C:\\Program Files\\Salesforce CLI\\client');
                }
            }
            else {
                console.log('\nPath ' + sfdxcliFolders[0] + ' does not contain all necessary files');
            }
        }
        else {
            vscode.window.showErrorMessage('Salesforce folder NOT found. Please check the names of your folders in \\Program Files that have "Salesforce" included in the name');
        }
    }
}
function runNPMConfigCheck() {
    console.log("\nChecking for npm config");
    let npmConfigExists = checkFileExistsInTargetFolder(userProfile, '\\.npmrc');
    let requirednpmConfigItems = ['proxy=http://proxy.wellsfargo.com:8080', 'https-proxy=http://proxy.wellsfargo.com:8080', 'strict-ssl=false'];
    // no existing npm config file
    if (npmConfigExists === false) {
        // create a new, empty .npmrc file and append the necessary configuration data
        console.log('No npm config file found at ' + userProfile + '\nCreating new file');
        fs.appendFileSync(userProfile + '\\.npmrc', '');
        requirednpmConfigItems.forEach(function (value) {
            console.log('Writing value to config: ' + value);
            fs.appendFileSync(userProfile + '\\.npmrc', '\n' + value);
        });
    }
    // currently existing npm config file
    else if (npmConfigExists === true) {
        // read the contents of the config into memory
        console.log('npm config file found at ' + userProfile + '\nReading contents of config');
        let existingnpmConfig = fs.readFileSync(userProfile + '\\.npmrc', 'utf-8').split('\r');
        /*
         If existing config is not empty, check each item
         All values that exactly match at least one of the required config items, keep.
         All items that only partially match, discard.
         All items that do not match at all, keep as they may be other
         config items the developer wants to keep
         trim line breaks and trailing slashes, and remove empty keys
         */
        console.log('at required npm configs');
        let requiredNpmMap = setConfigFileMap(requirednpmConfigItems, '=');
        console.log('at existing npm configs');
        let previousNpmMap = setConfigFileMap(existingnpmConfig, '=');
        console.log('\nChecking required configuration against previous configuration');
        // If the previous config file was not empty, compare previous vs. required
        // otherwise, write all the required configuration and complete
        if (previousNpmMap.length > 0) {
            compareMapsAndSetNewConfig(requiredNpmMap, previousNpmMap, userProfile + "\\.npmrc");
        }
        else {
            appendItemsToConfigFile(userProfile + "\\.npmrc", requirednpmConfigItems);
        }
    }
}
function runGitConfigCheck() {
    console.log('\nChecking for .gitconfig file');
    let tagsNotFound = new Array();
    let tagsFound = new Array();
    let requiredgitTags = ['user', 'http', 'https', 'core'];
    let requiredgitConfigItems = [
        'http.sslbackend=openssl',
        'http.proxy=http://proxy.wellsfargo.com:8080',
        'https.proxy=http://proxy.wellsfargo.com:8080',
        'http.sslcainfo=C:\\Users\\' + username + '\\.vscode\\extensions\\ukoloff.win-ca-2.4.0\\node_modules\\win-ca\\pem\\roots.pem'
    ];
    let gitConfigExists = checkFileExistsInTargetFolder(userProfile, '\\.gitconfig');
    if (gitConfigExists === false) {
        // create new empty git config
        fs.appendFileSync(userProfile + '\\.gitconfig', '');
        requiredgitConfigItems.forEach(function (value) {
            console.log('Writing value to config: ' + value);
            fs.appendFileSync(userProfile + '\\.git', '\n' + value);
        });
    }
    else if (gitConfigExists === true) {
        console.log('.gitconfig file found');
        var gitconfig = ini.parse(fs.readFileSync(userProfile + "\\.gitconfig", 'utf-8'));
        let attributes = getGitConfigAttributeNames(gitconfig);
        // check for the [user], [http], [https], and [core] attributes
        for (var tag in requiredgitTags) {
            let tagValue = requiredgitTags[tag];
            console.log('searching for tag ' + tagValue);
            let search = searchForGitTag(tagValue, attributes);
            if (search === true) {
                tagsFound.push(tagValue);
            }
            else {
                tagsNotFound.push(tagValue);
            }
        }
    }
    if (tagsNotFound.length !== 0) {
        addGitTagsNotFound(tagsNotFound, userProfile + '\\.gitconfig');
    }
    else {
        console.log('No missing configuration tags found');
    }
    console.log('Finished doing all the things!');
}
function getGitConfigAttributeNames(config) {
    let gitAttributes = new Array();
    for (var attributename in config) {
        console.log(attributename + ": " + config[attributename]);
        gitAttributes.push(attributename);
    }
    return gitAttributes;
}
function searchForGitTag(tagName, arr) {
    let tagFound = false;
    if (arr.includes(tagName)) {
        tagFound = true;
    }
    return tagFound;
}
function showInputBox(currentPrompt, currentPlaceHolder) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield vscode.window.showInputBox({
            value: '',
            placeHolder: currentPlaceHolder,
            prompt: currentPrompt,
        });
        return result;
    });
}
function addGitTagsNotFound(tags, configFile) {
    tags.forEach(function (tag) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (tag) {
                case 'user':
                    const currentName = yield showInputBox('Please enter your full name', 'Ex. J Doe');
                    const currentEmail = yield showInputBox('Please enter your Wells Fargo email address', 'Ex. jdoe@wellsfargo.com');
                    console.log('Adding config items for [user] tag');
                    appendItemsToConfigFile(configFile, [`[${tag}]`,
                        `\tname=${currentName}`,
                        `\temail=${currentEmail}`], true);
                    break;
                case 'http':
                    console.log('Adding config items for [http] tag');
                    appendItemsToConfigFile(configFile, [`[${tag}]`,
                        '\tsslBackend=openssl',
                        `\tsslCAInfo=C:\\\\Users\\\\${username}\\\\.vscode\\\\extensions\\\\ukoloff.win-ca-2.4.0\\\\node_modules\\\\win-ca\\\\pem\\\\roots.pem`,
                        '\tproxy=http://proxy.wellsfargo.com:8080'], true);
                    break;
                case 'https':
                    console.log('Adding config items for [https] tag');
                    appendItemsToConfigFile(configFile, [`[${tag}]`,
                        `\tsslCAInfo=C:\\\\Users\\\\${username}\\\\.vscode\\\\extensions\\\\ukoloff.win-ca-2.4.0\\\\node_modules\\\\win-ca\\\\pem\\\\roots.pem`,
                        '\tproxy=http://proxy.wellsfargo.com:8080'], true);
                    break;
                case 'core':
                    console.log('Adding config items for [core] tag');
                    appendItemsToConfigFile(configFile, [`[${tag}]`,
                        `\teditor=code --wait`], true);
                    break;
            }
        });
    });
}
function readVSCodeSettings() {
    let newSettings = fs.readFileSync(`C:\\Users\\${username}\\AppData\\Roaming\\Code\\User\\settings.json`, { encoding: 'utf-8' });
    return newSettings;
}
function importVSCodeSettings() {
    let currentSettings = fs.readFileSync(`C:\\Users\\${username}\\AppData\\Roaming\\Code\\User\\settings.json`, { encoding: 'utf-8' });
    if (currentSettings.length !== 0) {
        let newSettings = currentSettings.trim().replace('""', '').split('\n');
        return newSettings;
    }
    else {
        return null;
    }
}
function runVSCodeConfigCheck(javaLocation) {
    console.log('\nChecking for .vscode settings.json file');
    let keysAndValuesMatched = new Array();
    let keysAndValuesNotMatched = new Array();
    let keyOnlyMatched = new Array();
    let requiredVSCodeSettingMap = new Map();
    requiredVSCodeSettingMap.set('{', '')
        .set("http.proxy", "http://proxy.wellsfargo.com:8080")
        .set("http.proxyStrictSSL", false)
        .set("git.path", "C:\\Program Files\\Git\\cmd\\git.exe")
        .set("git.enabled", true);
    // if there's a valid JDK 8 installation on the machine
    // add it to the config to be created
    if (javaLocation) {
        requiredVSCodeSettingMap.set("salesforcedx-vscode-apex.java.home", `${javaLocation.replace('/\/g', '/')}`)
            .set('}', '');
    }
    else {
        requiredVSCodeSettingMap.set('}', '');
    }
    // check if there is an existing settings.json
    let vsCodeSettingsExists = checkFileExistsInTargetFolder(`C:\\Users\\${username}\\AppData\\Roaming\\Code\\User`, '\\settings.json');
    if (vsCodeSettingsExists === false) {
        // create config
        appendItemsToConfigFile(`C:\\Users\\${username}\\AppData\\Roaming\\Code\\User\\settings.json`, requiredVSCodeSettingMap);
    }
    else if (vsCodeSettingsExists === true) {
        // split at the first colon and build a new
        // map, similar to the npm config check
        let currentCodeSettings = importVSCodeSettings();
        let previousVSCodeMap = sliceOnceAndMap(currentCodeSettings, ':');
        let jsonFile = new JFile(`C:\\Users\\${username}\\AppData\\Roaming\\Code\\User\\settings.json`);
        // compare the keys from the required configs against the previous settings
        for (let entry of requiredVSCodeSettingMap) {
            for (var s = 0; s < previousVSCodeMap.length; s++) {
                let currentKey = previousVSCodeMap[s].key.replace(/\"/g, '').replace(':', '');
                let currentValue = previousVSCodeMap[s].value.replace(/\"/g, '').replace(',', '');
                if (currentKey === entry[0]) {
                    if (currentValue !== entry[1]) {
                        keyOnlyMatched.push({ key: entry[0], value: currentValue });
                    }
                    else if (currentValue === entry[1]) {
                        keysAndValuesMatched.push({ key: entry[0], value: entry[1] });
                    }
                }
                else {
                    keysAndValuesNotMatched.push({ key: currentKey, value: currentValue });
                }
            }
            // check for existing entries of required items
            let configItemMatch = jsonFile.grep("    " + `"${entry[0]}`);
            // not present in the config
            if (configItemMatch.length === 0 && entry[0] !== '{' && entry[0] !== '}') {
                try {
                    let currentConfig = fs.readFileSync(`C:\\Users\\${username}\\AppData\\Roaming\\Code\\User\\settings.json`);
                    let parsedConfig = JSON.parse(currentConfig.toString());
                    parsedConfig[`${entry[0]}`] = entry[1];
                    fs.writeFileSync(`C:\\Users\\${username}\\AppData\\Roaming\\Code\\User\\settings.json`, JSON.stringify(parsedConfig));
                }
                catch (error) {
                    throw error;
                }
            }
            if (configItemMatch.length > 0) {
                configItemMatch.forEach(item => {
                    // check ambigous matches against exact matches from required config
                    if (item.includes(`"${entry[0]}":`) === false && item.includes('{') === false && item.includes('}') === false) {
                        try {
                            let currentConfig = readVSCodeSettings();
                            let parsedConfig = JSON.parse(currentConfig.toString());
                            parsedConfig[`${entry[0]}`] = `${entry[1]}`;
                            fs.writeFileSync(`C:\\Users\\${username}\\AppData\\Roaming\\Code\\User\\settings.json`, JSON.stringify(parsedConfig));
                        }
                        catch (error) {
                            throw error;
                        }
                    }
                });
            }
        }
        // replace any misconfigured values on required options if present
        if (keyOnlyMatched.length > 0) {
            keyOnlyMatched.forEach(item => {
                let configFileSettings = readVSCodeSettings();
                try {
                    let parsedConfig = JSON.parse(configFileSettings.toString());
                    parsedConfig[`${item[0]}`] = item[1];
                    fs.writeFileSync(`C:\\Users\\${username}\\AppData\\Roaming\\Code\\User\\settings.json`, JSON.stringify(parsedConfig));
                }
                catch (e) {
                    console.error('Error occurred:', e);
                }
            });
        }
    } // endif true
    console.log('Finished VS Code user preferences checking');
    vscode.window.showInformationMessage('VS Code settings configuration complete');
}
function activate(context) {
    // Command name to match package.json
    const dxinstallcheck = 'extension.runDevChecker';
    // command handler
    const installCheckHandler = (name) => __awaiter(this, void 0, void 0, function* () {
        // Get all directories under C:\Program Files
        let programFilesChildren = getChildDirectoriesWithoutMap('C:\\Program Files');
        // Java install check
        let currentJavaCheck = runJavaCheck();
        // NodeJS install check
        runNodeCheck(programFilesChildren);
        // git-bash install check
        runGitCheck(programFilesChildren);
        // SFDX CLI installl check
        runSFDXCheck(programFilesChildren);
        // npm configuration checks
        runNPMConfigCheck();
        // .gitconfig configuration checks
        runGitConfigCheck();
        // .vscode user preferences checks
        if (currentJavaCheck !== null) {
            runVSCodeConfigCheck(currentJavaCheck);
        }
        else {
            runVSCodeConfigCheck();
        }
    });
    // push directory check command to command registry
    context.subscriptions.push(vscode.commands.registerCommand(dxinstallcheck, installCheckHandler));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
exports.activate = activate;
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map