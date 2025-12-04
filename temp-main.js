const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const os = require('os');
const DatabaseManager = require('./database.js');
const { initClassManagementIPC } = require('./main-ipc.js');

let mainWindow = null;
let settingsWindow = null;
let classManagementWindow = null;
const dbManager = new DatabaseManager();