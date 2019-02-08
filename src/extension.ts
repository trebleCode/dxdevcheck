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
			if(isPartialMatch === true)
			{
				let isExactMatch = checkExactMatch(value, arr);
				if(isExactMatch === true) {
					matchType = 'exactMatch';
				}
				else {
					matchType = 'partialMatch';
				}
			}
			return matchType;
		}

		function checkExactMatch(value: any, arr: any) {
			var status = false;
			var name = arr;
			if (name === value && name !== '') {
				status = true;
			}

			return status;
		}

		function checkPartialMatch(value: string, arr: string) {
			var status = false;

			for (var i = 0; i < arr.length; i++) {
				var name = arr;
				if (name.includes(value) && name !== '') {
					status = true;
					break;
				}
			}

			return status;
		}


		function getUserHome() {
			return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
		}

		function isInArray(array: any, search: any)
		{
			return array.indexOf(search) >= 0;
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
			// verify that the only folder is 'nodejs' and not additional ones renamed with a (1), etc.
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

		// Begin NPM configuration checks
		console.log("\nChecking for NPM config");
		try {
			let NPMConfigCheck = checkFileExistsInTargetFolder(userProfile + "\\", ".NPMrc");
			if (NPMConfigCheck === true) {
				console.log("Found NPM config file");

				let NPMConfigFile = fs.readFileSync(userProfile + "\\.NPMrc", 'utf8');
				console.log("NPM config file data: \n\n" + NPMConfigFile);
			}
		}
		catch (e) {
			console.log("NPM config file not found @: " + userProfile + "\\.NPMrc");
			throw e;
		}

		try {
			console.log('Checking configuration data against DX requirements');

			// loop through lines in the NPM config
			// if lines only partially match the desired config
			// setting for [registry=,https-proxy=,proxy=,strict-ssl=]
			// then discard them. Keep any other config items
			// other than empty lines

			var NPMConfig = fs.readFileSync(userProfile + "\\.NPMrc").toString().split("\n");
			//console.log(NPMConfig);

			let requiredNPMItems = ['registry=https://registry.NPMjs.org/\r','https-proxy=http://proxy.wellsfargo.com:8080/\r','proxy=http://proxy.wellsfargo.com:8080/\r','strict-ssl=false'];
			let exactMatches: string[] = [];
			let partialMatches: string[] = [];
			let nonMatches: string[] = [];

			for (var i = 0; i < NPMConfig.length; i++) {
				console.log("\nNPM config line [" + NPMConfig.indexOf(NPMConfig[i]) + "]: " + NPMConfig[i]);

				// check if all entries in the config to see what matches requiredNPMItems
				for (var j = 0; j < requiredNPMItems.length; j++) {
					console.log('Checking for match against: '+ requiredNPMItems[j]);
					let currentMatchType = checkMatchType(NPMConfig[i], requiredNPMItems[j]);
					if(currentMatchType === 'exactMatch') {
						// check that a duplicate doesn't already exist in the exactMatch array
						let alreadyExists: boolean = isInArray(exactMatches, NPMConfig[i]);
						if(alreadyExists !== true) {
							exactMatches.push(NPMConfig[i]);
						}
					} else if (currentMatchType === 'partialMatch') {
						// check for duplicates in partialMatches and nonMatches
						let alreadyExists: boolean = isInArray(partialMatches, NPMConfig[i]);
						let alreadyExists2: boolean = isInArray(nonMatches, NPMConfig[i]);
						if(alreadyExists !== true && alreadyExists2 !== true) {
							partialMatches.push(NPMConfig[i]);
						}
					} else if(currentMatchType === 'none') {
						// check for duplicates in exactMatches, partialMatches and nonMatches
						let alreadyExists: boolean = isInArray(nonMatches, NPMConfig[i]);
						let alreadyExists2: boolean = isInArray(partialMatches, NPMConfig[i]);
						let alreadyExists3: boolean = isInArray(exactMatches, NPMConfig[i]);
						if(alreadyExists !== true && alreadyExists2 !== true && alreadyExists3 !== true) {
							nonMatches.push(NPMConfig[i]);
						}
					}
				} // end NPM config item checks
			}
			
			console.log('\nExact matches: '+ exactMatches);
			console.log('Partial matches: '+ partialMatches);
			console.log('None matches: '+ nonMatches);
		}
		catch (e) {
			throw e;
		}
	};

	// push directory check command to command registry
	context.subscriptions.push(vscode.commands.registerCommand(dxinstallcheck, installCheckHandler));
}

// this method is called when your extension is deactivated
export function deactivate() { }