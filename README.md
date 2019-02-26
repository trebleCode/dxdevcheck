# dxdevcheck README

DX DevCheck is a VS Code extension for checking your local system setting's readiness to work with the Salesforce DX CLI and VS Code Salesforce extensions.

## Features

Checks for the following in C:\Program Files:

* At least one Java 8 JDK 
* NodeJS
* Git
* Salesforce CLI

Checks configuration data for:
* NPM
* Git
* VS Code user preferences

TODO's
Check %USERPROFILE%\.vscode for:
* Installed extensions

Check values in the following system variables:
* PATH
* HTTP_PROXY & HTTPS_PROXY

* Mocha tests

## Requirements

* VS Code 1.28.0 or higher

## Release Notes

First release @ 1.0.0

### 1.0.0

Initial release as POC. Only manually tested on Windows 10