const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')

let mainWindow

function createMainWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        show: false
    })

    mainWindow.on('closed', () => {
        app.quit()
    })

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })
}

app.on('ready', () => {
    createMainWindow()
})