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

		function checkMatchType(value: any, arr: any) {
			var matchType = 'none';

			let isPartialMatch = checkPartialMatch(value, arr);
			if (isPartialMatch === true) {
				{
					let isExactMatch = checkExactMatch(value, arr);
					if (isExactMatch === true) {
						matchType = 'exactMatch';
					}
					else {
						matchType = 'partialMatch';
					}
				}
			}
			return matchType;
		}

		function checkExactMatch(value: string, arr: string) {
			var status = false;
			if (value === arr) {
				status = true;
			}
			return status;
		}

		function checkPartialMatch(value: string, arr: string) {
			var status = false;
			if (arr.indexOf(value) >= 0) {
				status = true;
			}
			return status;
		}


		function getUserHome() {
			return String(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']);
		}

		function isInArray(array: any, search: any) {
			return array.indexOf(search) >= 0;
		}

		function createNewConfigFile(path: string) {
			fs.open(path, "wx", function (err, fd) {
				if (err) {
					throw err;
				}
				else {
					console.log('Config file created at: ' + path);
				}
				fs.close(fd, function (err) {
					if (err) {
						throw err;
					} else {
						console.log('Config file successfully closed');
					}
				});
			});
		}

		function renameConfigFile(existingFilePath: string, newFilePath: string) {
			fs.rename(existingFilePath, newFilePath, function (err) {
				if (err) {
					console.log('ERROR: ' + err);
					return false;
				}
				else {
					console.log('File ' + existingFilePath + ' renamed to ' + newFilePath);
					return true;
				}
			});
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

			// list values
			console.log('Existing config: typeof: ' + typeof existingnpmConfig);
			console.log('Config values:\n\n' + existingnpmConfig);

			let newnpmConfig: string[] = new Array();
			/*
			 Check each item in the existing config
			 All values that exactly match at least one of the required config items, keep.
			 All items that only partially match, discard.
			 All items that do not match at all, keep as they may be other
			 config items the developer wants to keep
			 */

			// split the required npm items into a key value pair for easier comparison
			// trim line breaks and trailing slashes, and remove empty keys

			let requiredNpmMap = requirednpmConfigItems
				.filter(entry => entry !== '\n')
				.map(item => {
					var itemSplit = item.split('=');
					var k = itemSplit[0].trim().replace(/\/$/, '');
					var v = itemSplit[1].trim().replace(/\/$/, '');
					return {
						key: k,
						value: v
					};
				});

			let previousNpmMap = existingnpmConfig
				.filter(entry => entry !== '\n')
				.map(item => {
					var itemSplit = item.split('=');
					var k = itemSplit[0].trim().replace(/\/$/, '');
					var v = itemSplit[1].trim().replace(/\/$/, '');
					return {
						key: k,
						value: v
					};
				});

			console.log('\nChecking required configuration against previous configuration');
			// check if the keys in the required config are present in the previous config
			for (var z = 0; z < requiredNpmMap.length; z++) {
				let checkKey = checkContainsKey(requiredNpmMap[z].key, previousNpmMap);
				if (checkKey === true) {
					let checkValue = checkKeyValue(requiredNpmMap[z].key, requiredNpmMap[z].value, previousNpmMap);

					// the right key is present but has the wrong value
					if (checkValue === false) {
						let configItem = requiredNpmMap[z].key + '=' + requiredNpmMap[z].value + '\r';
						newnpmConfig.push(configItem);
					}
					else if (checkValue === true) {
						console.log('Configuration already has key ' + requiredNpmMap[z].key + ' with correct value: ' + requiredNpmMap[z].value);
					}
				}
				// doesn't have the required key at all
				else if (checkKey === false) {
					let configItem = requiredNpmMap[z].key + '=' + requiredNpmMap[z].value + '\r';
					newnpmConfig.push(configItem);
				}
			}

			// now we check the previous config for any other key/value pairs
			// that don't match the keys in the requirements
			// this will allow us to preserve any other settings the dev may have setup
			console.log('\nChecking previous configuration for any miscellaneous keys');
			for (var c = 0; c < previousNpmMap.length; c++) {
				let isInRequiredConfig: boolean = checkContainsKey(previousNpmMap[c].key, requiredNpmMap);
				if (isInRequiredConfig === false) {
					let configItem = previousNpmMap[c].key + '=' + previousNpmMap[c].value + '\r';
					newnpmConfig.push(configItem);
				} else {
					console.log('Key ' + previousNpmMap[c].key + ' is already in required config');
				}
			}
			// write the new npm configuration
			console.log('New npm config will be written as:\n\n' + newnpmConfig);

			// clear the contents of the existing file to 0 bytes
			fs.truncateSync(userProfile + '\\.npmrc', 0);
			console.log('npm config file has been truncated');

			// write the new configuration to the existing file
			let npmFileStream = fs.createWriteStream(userProfile + '\\.npmrc', { flags: 'a' });
			newnpmConfig.forEach(function (item) {
				npmFileStream.write(item + '\n');
			});
			console.log("Finished writing new npm configuration file");
		}
	};

	// push directory check command to command registry
	context.subscriptions.push(vscode.commands.registerCommand(dxinstallcheck, installCheckHandler));
}

// this method is called when your extension is deactivated
export function deactivate() { }