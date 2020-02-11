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

ipcMain.on('license:test', (e, data) => {
    let address = data.address,
        port = data.port

    console.log(data)
    console.log(address)
    console.log(port)

    mainWindow.webContents.loadURL(url.format({
        pathname: path.join(__dirname, 'portScan.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.webContents.once('did-finish-load', () => {
        console.log('window ready')
        mainWindow.webContents.send('license:test', data)
    })
})