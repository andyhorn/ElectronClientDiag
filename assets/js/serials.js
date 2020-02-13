const { exec } = require('child_process')
const path = require('path')
const { ipcRenderer } = require('electron')
const sudoPrompt = require('sudo-prompt')

const removeSerialsButton = document.getElementById('remove-serials-button')
const resultsDiv = document.getElementById('results')
var resultsTable, statusItem

function displaySysInfo() {
    let system = process.platform == 'win32' ? 'Windows'
        : process.platform == 'darwin' ? 'macOS'
        : 'Unknown'
        
    resultsTable = document.createElement('table')
    resultsTable.classList.add('table')
    resultsTable.classList.add('mt-3')

    let platformRow = document.createElement('tr')
    let platformHeader = document.createElement('th')
    let platformContent = document.createElement('td')

    platformHeader.textContent = 'Platform'
    platformContent.textContent = system

    platformRow.append(platformHeader)
    platformRow.append(platformContent)
    resultsTable.append(platformRow)

    resultsDiv.appendChild(resultsTable)
}

function setStatus(status) {
    if (!statusItem) {
        let statusRow = document.createElement('tr')
        let statusHeader = document.createElement('th')
        statusItem = document.createElement('td')

        statusHeader.textContent = 'Status'

        statusRow.appendChild(statusHeader)
        statusRow.appendChild(statusItem)
        resultsTable.appendChild(statusRow)
    }

    statusItem.textContent = status
}

function getDeployPath() {
    if (process.platform == 'win32') {
        return path.join(__dirname, 'assets', 'bin', 'rgdeploy.exe')
    } else {
        return path.join(__dirname, 'assets', 'bin', 'rgdeploy')
    }
}

function getCommand() {
    let deployPath = getDeployPath()
    if (process.platform == 'win32') {
        return `${deployPath} --removeserials`
    } else {
        return `chmod +x "${deployPath}" && "${deployPath}" --removeserials`
    }
}

function runRgDeploy() {
    displaySysInfo()
    setStatus('Running...')
    let command = getCommand()
    console.log(command)

    sudoPrompt.exec(command, {
        name: 'Red Giant Client Management'
    }, (err, stdout, stderr) => {
        if (err) {
            console.log(err)
        }
        if (stderr) {
            console.log(stderr)
        }
        console.log(stdout)
        setStatus('Complete!')
    })
}

function getPassword() {
    console.log('asking for password')
    ipcRenderer.send('password:get')
}

ipcRenderer.on('password:send', (e, data) => {
    console.log('password received')
    console.log(data)
    pwd = data.password
    console.log(pwd)
    runRgDeploy()
})

removeSerialsButton.addEventListener('click', runRgDeploy)