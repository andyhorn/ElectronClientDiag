const { app, BrowserWindow, ipcMain, screen, dialog } = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')

let mainWindow

function createMainWindow() {
    console.log(`${Date.now()} - getting current screen dimensions...`)
    let { width, height } = screen.getPrimaryDisplay().workAreaSize
    console.log(`${Date.now()} - screen width: ${width}`)
    console.log(`${Date.now()} - screen height: ${height}`)
    
    console.log(`${Date.now()} - creating main window`)
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        show: false,
        width: width - 200,
        height: height - 200
    })

    mainWindow.on('closed', () => {
        console.log(`${Date.now()} - main window closed, quitting application`)
        app.quit()
    })

    console.log(`${Date.now()} - loading landing page HTML`)
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.on('ready-to-show', () => {
        console.log(`${Date.now()} - main window loaded and ready to display`)
        mainWindow.show()
    })
}

app.on('ready', () => {
    console.log(`${Date.now()} - application loaded and ready to display main window`)
    createMainWindow()
})

ipcMain.on('license:test', (e, data) => {
    console.log(`${Date.now()} - received data from port scan utility`)
    console.log(data)

    console.log(`${Date.now()} - loading port scan utility with data`)
    mainWindow.webContents.loadURL(url.format({
        pathname: path.join(__dirname, 'portScan.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.webContents.once('did-finish-load', () => {
        console.log(`${Date.now()} - port scan utility loaded and ready to display`)
        mainWindow.webContents.send('license:test', data)
    })
})

ipcMain.on('license:save', (e, data) => {
    console.log(`${Date.now()} - received license file data:`)
    console.log(data)
    let filePath = process.platform == 'win32' ? 'C:\\ProgramData\\Red Giant\\licenses' : '/Users/Shared/Red Giant/licenses'
    filePath += path.sep + data.name
    console.log(`${Date.now()} - default save path set: ${filePath}`)
    let selectedPath = dialog.showSaveDialogSync(mainWindow, {
        title: 'Client License File',
        defaultPath: filePath
    })
    console.log(`${Date.now()} - path selected: ${selectedPath}`)

    if (selectedPath != null) {
        fs.writeFileSync(selectedPath, data.data)
        console.log(`${Date.now()} - file written`)
    } else {
        console.log(`${Date.now()} - user canceled save process`)
    }
})