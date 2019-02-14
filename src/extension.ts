// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import fs = require('fs');
import path = require('path');
//import appdata = require('appdata-path');
let validJavaInstalls = 0;


export function activate(context: vscode.ExtensionContext) {

	// install check name to match package.json
	const dxinstallcheck = 'extension.checkDirectories';

	// command handler
	const installCheckHandler = async (name?: 'DX DevCheck: Check Directories') => {
		// Check if a local path exists
		function checkDirectorySync(directory: fs.PathLike) {
			try {
				fs.statSync(directory);
				return true;
			} catch (e) {
				return false;
			}
		}

		function getChildDirectories(directory: string) {
			return fs.readdirSync(directory)
				.map(file => path.join(directory, file))
				.filter(path => fs.statSync(path).isDirectory);
		}

		function getChildDirectoriesWithoutMap(directory: string) {
			return fs.readdirSync(directory)
				.map(file => path.join(directory, file));
		}

		function checkFileExistsInTargetFolder(directory: string, file: string) {
			if (fs.existsSync(directory + file)) {
				return true;
			}
			else {
				return false;
			}
		}

		function getUserHome() {
			return String(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']);
		}

		function checkContainsKey(keyname: string, arr: any) {
			let hasKey: boolean = false;
			let counter = 0;
			for (i = 0; i < arr.length; i++) {
				if (keyname === arr[i].key) {
					counter++;
				}
			}
			if (counter > 0) {
				hasKey = true;
			}
			return hasKey;
		}

		function checkKeyValue(keyname: string, keyvalue: string, arr: any) {
			let hasKeyValue: boolean = false;
			if (arr[keyname] === keyvalue) {
				hasKeyValue = true;
			}
			return hasKeyValue;
		}

		function setConfigFileMap(arrayToMap: any) {
			let thisMap = arrayToMap
			.filter((entry: string) => entry !== '\n' && entry !== "" && entry !== "\r")
			.map((item: { split: (arg0: string) => string; }) => {
				var itemSplit = item.split('=');
				var k = itemSplit[0].trim().replace(/\/$/, '');
				var v = itemSplit[1].trim().replace(/\/$/, '');
				return {
					key: k,
					value: v
				};
			});
			return thisMap;
		}

		function appendItemsToConfigFile(file: fs.PathLike, configItems: string[])
		{
			let stream = fs.createWriteStream(file, { flags: 'a' });
			configItems.forEach(function (item) {
				stream.write(item + '\n');
			});
			return;
		}

		function compareMapsAndSetNewConfig(requiredMap: any, previousMap: any, configFile: fs.PathLike) {
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
				let isInRequiredConfig: boolean = checkContainsKey(previousMap[c].key, requiredMap);
				if (isInRequiredConfig === false) {
					let configItem = previousMap[c].key + '=' + previousMap[c].value + '\r';
					newConfig.push(configItem);
				} else {
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

		// Get all directories under C:\Program Files
		let programFilesChildren = getChildDirectoriesWithoutMap('C:\\Program Files');

		// Get users %APPDATA% folder
		//let appDataPath = appdata.getAppDataPath();

		// Get user's %USERPROFILE% folder
		const userProfile = getUserHome();
		console.log(userProfile);

		// Begin Java checking
		// check if a Java folder exists
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
					}
					else {
						console.log('Path ' + jdkChildren[i] + ' does not contain a valid Java executable');
					}
				}
				console.log('Valid JDK 1.8 installs: ' + validJavaInstalls);
				vscode.window.showInformationMessage('Success: Java JDK validation passed');
			}
			else {
				console.log('No valid JDK 1.8 installations found');
				vscode.window.showErrorMessage('Failure: No valid JDK 1.8 installations found');
			}
		} else {
			vscode.window.showErrorMessage('Failure: Java folder NOT found');
		} // End Java checking

		// Begin NodeJS checks
		// Check if more than one nodejs folder exists

		let nodejsFolders = programFilesChildren.filter(child => child.valueOf().includes('nodejs'));

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
		} // End nodejs checking

		// Begin git-bash checks
		let gitbashFolders = programFilesChildren.filter(child => child.valueOf().includes('Git'));
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
		} // End Git checking

		// Begin SFDX CLI checks
		let sfdxcliFolders = programFilesChildren.filter(child => child.valueOf().includes('Salesforce CLI'));
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
		} // End SFDX CLI checks

		// Begin npm configuration checks
		console.log("\nChecking for npm config");
		let npmConfigExists: boolean = checkFileExistsInTargetFolder(userProfile, '\\.npmrc');
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
			 */

			// split the required npm items into a key value pair for easier comparison
			// trim line breaks and trailing slashes, and remove empty keys

			console.log('at required npm configs');
			let requiredNpmMap = setConfigFileMap(requirednpmConfigItems);

			console.log('at existing npm configs');
			let previousNpmMap = setConfigFileMap(existingnpmConfig);

			console.log('\nChecking required configuration against previous configuration');

			// If the previous config file was not empty, compare previous vs. required
			// otherwise, write all the required configuration and complete
			if(previousNpmMap.length > 0)
			{
				compareMapsAndSetNewConfig(requiredNpmMap, previousNpmMap, userProfile+"\\.npmrc");
			}
			else{
				appendItemsToConfigFile(userProfile+"\\.npmrc", requirednpmConfigItems);
			}
		}

		// Begin .gitconfig configuration checks
		console.log('\nChecking for .gitconfig file');
		let requiredgitConfigItems = ['http.sslbackend=openssl','http.proxy=http://proxy.wellsfargo.com:8080','https.proxy=http://proxy.wellsfargo.com:8080'];
		/** 
		 * ADDITIONAL GIT CONFIGS REQUIRED
		 * user.name -> not null. if null or not present, prompt user and add
		 * user.email -> not null. null null or not present, prompt user and add
		 * http.sslcainfo -> must equal C:\Users\<username>\.vscode\extensions\ukoloff.win-ca-2.4.0\node_modules\win-ca\pem\roots.pem
		 * 		This requires that a specific VS Code Extension is installed
		 * 			Go ahead and install here or not before adding configuration? 
		 */

		let gitConfigExists: boolean = checkFileExistsInTargetFolder(userProfile, '\\.gitconfig');
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

		}		
	};

	// push directory check command to command registry
	context.subscriptions.push(vscode.commands.registerCommand(dxinstallcheck, installCheckHandler));
}

// this method is called when your extension is deactivated
export function deactivate() { }