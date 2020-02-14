const path = require('path')
const sudoPrompt = require('sudo-prompt')
const debug = require('./assets/js/debug.js')

const removeSerialsButton = document.getElementById('remove-serials-button')
const resultsDiv = document.getElementById('results')
var resultsTable, statusItem

function displaySysInfo() {
    debug.log('[displaySysInfo] updating DOM with system info')
    if (resultsTable) {
        debug.log('[displaySysInfo] removing existing table from DOM')
        resultsDiv.innerHTML = ''
        resultsTable = null
        statusItem = null
    }

    debug.log('[displaySysInfo] getting system platform')
    let system = process.platform == 'win32' ? 'Windows'
        : process.platform == 'darwin' ? 'macOS'
        : 'Unknown'
    debug.log(`[displaySysInfo] platform detected: ${system}`)
        
    debug.log('[displaySysInfo] generating table elements')
    resultsTable = document.createElement('table')
    resultsTable.classList.add('table')
    resultsTable.classList.add('mt-3')

    let platformRow = document.createElement('tr')
    let platformHeader = document.createElement('th')
    let platformContent = document.createElement('td')

    debug.log('[displaySysInfo] setting platform data')
    platformHeader.textContent = 'Platform'
    platformContent.textContent = system

    platformRow.append(platformHeader)
    platformRow.append(platformContent)
    resultsTable.append(platformRow)

    debug.log('[displaySysInfo] adding table to DOM')
    resultsDiv.appendChild(resultsTable)
}

function setStatus(status) {
    debug.log(`[setStatus] setting status: ${status}`)
    if (!statusItem) {
        debug.log('[setStatus] no element found, creating new table row')
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

function getPlatform() {
    return process.platform
}

function getDeployPath() {
    debug.log('[getDeployPath] getting platform and generating path to rgdeploy utility')
    let platform = getPlatform()
    debug.log(`[getDeployPath] platform detected: ${platform}`)

    let deployPath = platform == 'win32' ? path.join(__dirname, 'assets', 'bin', 'rgdeploy.exe')
        : path.join(__dirname, 'assets', 'bin', 'rgdeploy')
    debug.log(`[getDeployPath] path to rgdeploy: ${deployPath}`)

    return deployPath
}

function getCommand() {
    debug.log(`[getCommand] generating remove serials command`)
    let deployPath = getDeployPath()
    let command = `"${deployPath}" --removeserials`
    debug.log(`[getCommand] command generated: ${command}`)

    if (getPlatform() != 'win32') {
        command = `chmod +x "${deployPath}" && ` + command
        debug.log(`[getCommand] *nix platform detected, adjusting file permissions...`)
        debug.log(`[getCommand] new command: ${command}`)
    }

    return command
}

function runRgDeploy() {
    debug.log('[runRgDeploy] running rgdeploy tool to remove serials')
    displaySysInfo()
    setStatus('Running...')
    let command = getCommand()
    debug.log(`[runRgDeploy] command retrieved: ${command}`)

    sudoPrompt.exec(command, {
        name: 'Red Giant Client Management'
    }, (err, stdout, stderr) => {
        debug.log(`[runRgDeploy] command executing...`)
        if (err || stderr) {
            if (err) {
                debug.log(`[runRgDeploy] fatal error:`)
                debug.print(err)
            }
            if (stderr) {
                debug.log('[runRgDeploy] system error:')
                debug.print(stderr)
            }
            setStatus('Failed.')
        } else {
            debug.log('[runRgDeploy] command executed successfully')
            setStatus('Success!')
        }
    })
}

removeSerialsButton.addEventListener('click', runRgDeploy)