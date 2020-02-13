const { exec } = require('child_process')
const path = require('path')

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
        return `sudo ${deployPath} --removeserials`
    }
}

function runRgDeploy() {
    displaySysInfo()
    setStatus('Running...')
    let command = getCommand()
    console.log(command)

    exec(command, (err, stdout, stderr) => {
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

removeSerialsButton.addEventListener('click', runRgDeploy)