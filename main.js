const { app, BrowserWindow, ipcMain, screen, dialog, Menu } = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')
const debug = require('./assets/js/debug.js')

let mainWindow

process.env.NODE_ENV = 'production'

function createMainWindow() {
    debug.log(`getting current screen dimensions...`)
    let { width, height } = screen.getPrimaryDisplay().workAreaSize
    debug.log(`screen width: ${width}`)
    debug.log(`screen height: ${height}`)
    
    debug.log(`creating main window`)
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        show: false,
        width: width - 200,
        height: height - 200,
        icon: path.join(__dirname, 'assets', 'icons', 'png', 'icon.png')
    })

    mainWindow.on('closed', () => {
        debug.log(`main window closed, quitting application`)
        app.quit()
        mainWindow = null
    })

    debug.log(`loading landing page HTML`)
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.on('ready-to-show', () => {
        debug.log(`main window loaded and ready to display`)
        mainWindow.show()
    })
}

app.on('ready', () => {
    debug.log(`application loaded and ready to display main window`)
    const mainMenu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(mainMenu)
    createMainWindow()
})

ipcMain.on('license:test', (e, data) => {
    debug.log(`received data from port scan utility`)
    debug.print(data)

    debug.log(`loading port scan utility with data`)
    mainWindow.webContents.loadURL(url.format({
        pathname: path.join(__dirname, 'portScan.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.webContents.once('did-finish-load', () => {
        debug.log(`port scan utility loaded and ready to display`)
        mainWindow.webContents.send('license:test', data)
    })
})

ipcMain.on('license:save', (e, data) => {
    debug.log(`received license file data:`)
    debug.print(data)
    let filePath = process.platform == 'win32' ? 'C:\\ProgramData\\Red Giant\\licenses' : '/Users/Shared/Red Giant/licenses'
    filePath += path.sep + data.name
    debug.log(`default save path set: ${filePath}`)
    let selectedPath = dialog.showSaveDialogSync(mainWindow, {
        title: 'Client License File',
        defaultPath: filePath
    })
    debug.log(`path selected: ${selectedPath}`)

    if (selectedPath != null) {
        fs.writeFileSync(selectedPath, data.data)
        debug.log(`file written`)
    } else {
        debug.log(`user canceled save process`)
    }
})

const menuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit()
                }
            }
        ]
    }
]

if (process.platform == 'darwin'){
    menuTemplate.unshift({})
}

if (process.env.NODE_ENV != 'production') {
    menuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools()
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}