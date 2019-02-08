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
					matchType = 'partialMatch';
				}
			}
			return matchType;
		}

		function checkPartialMatch(value: string, arr: string) {
			var status = false;
			var arrWithReturn = arr+'\r';
			if (arr.indexOf(value) >= 0 || arrWithReturn.indexOf(value) >= 0) {
				status = true;
			}

			return status;
		}


		function getUserHome() {
			return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
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

		// Get all directories under C:\Program Files
		let programFilesChildren = getChildDirectoriesWithoutMap('C:\\Program Files');

		// Get users %APPDATA% folder
		//let appDataPath = appdata.getAppDataPath();

		// Get user's %USERPROFILE% folder
		let userProfile = getUserHome();
		//console.log('userProfile is type: '+ typeof userProfile);

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
			vscode.window.showErrorMessage('Faliure: Java folder NOT found');
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
		try {
			let npmConfigCheck = checkFileExistsInTargetFolder(userProfile + "\\", ".npmrc");
			if (npmConfigCheck === true) {
				console.log("Found npm config file");

				let npmConfigFile = fs.readFileSync(userProfile + "\\.npmrc", 'utf8');
				console.log("npm config file data: \n\n" + npmConfigFile);

				try {
					console.log('Checking configuration data against DX requirements');

					// loop through lines in the npm config
					// if lines only partially match the desired config
					// setting for [registry=,https-proxy=,proxy=,strict-ssl=]
					// then discard them. Keep any other config items
					// other than empty lines

					var npmConfig = fs.readFileSync(userProfile + "\\.npmrc").toString().split("\n");

					let requirednpmItems = ['registry=https://registry.npmjs.org/', 'https-proxy=http://proxy.wellsfargo.com:8080/', 'proxy=http://proxy.wellsfargo.com:8080/', 'strict-ssl=false'];
					let exactMatches: string[] = [];
					let partialMatches: string[] = [];
					let nonMatches: string[] = [];

					// tslint:disable-next-line:no-duplicate-variable
					for (var i = 0; i < npmConfig.length; i++) {
						console.log("\nnpm config line [" + npmConfig.indexOf(npmConfig[i]) + "]: " + npmConfig[i]);

						for (var j = 0; j < requirednpmItems.length; j++) {
							let matchType = checkMatchType(npmConfig[i], requirednpmItems[j]);

							let isRequired = isInArray(requirednpmItems, npmConfig[i]);
							let exactCheck = isInArray(exactMatches, npmConfig[i]);
							let partialCheck = isInArray(partialMatches, npmConfig[i]);
							let noneCheck = isInArray(nonMatches, npmConfig[i]);

							switch (isRequired) {
								// all exact matches should always be true in isRequired
								case true:
									if(exactCheck === false) {
										exactMatches.push(npmConfig[i]);
									}
									break;
								case false:
									if(partialCheck === true || noneCheck === true) {
										console.log('already in an array');
									}
									else if(partialCheck === false && matchType === 'partialMatch'){
										partialMatches.push(npmConfig[i]);
									}
									else if(noneCheck === false && matchType === 'none') {
										nonMatches.push(npmConfig[i]);
									}
									break;
							}

						}
					} // end npm config item checks

					console.log('\nExact matches: ' + exactMatches);
					console.log('Partial matches: ' + partialMatches);
					console.log('None matches: ' + nonMatches);

					// rename the current .npmrc file to old.config_npmrc + <time now in milliseconds>

					let targetFileName = userProfile + "\\.npmrc";
					let targetFileNewName = userProfile + "\\" + "old.config_npmrc" + Date.now();

					try {
						renameConfigFile(targetFileName, targetFileNewName);

						// create a new empty %USERPROFILE%\.npmrc file
						createNewConfigFile(userProfile + "\\.npmrc");
					}
					catch (e) {
						throw e;
					}

					// append all entries in exactMatches to the new .npmrc file
					for (var x = 0; x < exactMatches.length; x++) {

						try {
							fs.appendFileSync(userProfile + "\\.npmrc", exactMatches[x] + '\n');
						}
						catch (e) {
							throw (e);
						}
					}
				}

				catch (e) {
					throw e;
				}
			}
		}
		catch (e) {
			console.log("npm config file not found at: " + userProfile + "\\.npmrc");
			throw e;
		}
	};

	// push directory check command to command registry
	context.subscriptions.push(vscode.commands.registerCommand(dxinstallcheck, installCheckHandler));
}

// this method is called when your extension is deactivated
export function deactivate() { }