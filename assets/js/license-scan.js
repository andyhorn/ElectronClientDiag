const electron = require('electron')
const { ipcRenderer } = electron
const fs = require('fs')
const path = require('path')
const debug = require('./assets/js/debug.js')

var folderCol, licenseCol, folderResultsList, licenseResultsList

const resultsElement = document.getElementById('scan-results')

function clearResults() {
    debug.log(`[clearResults] clearing DOM of results elements`)
    resultsElement.innerHTML = ''
}

function createHeaders() {
    debug.log('[createHeaders] creating headers')
    folderCol = document.createElement('div')
    licenseCol = document.createElement('div')

    folderCol.classList.add('col')
    folderCol.classList.add('s6')
    folderCol.classList.add('center')

    licenseCol.classList.add('col')
    licenseCol.classList.add('s6')
    licenseCol.classList.add('center')

    let folderHeaderText = document.createElement('h5')
    folderHeaderText.textContent = 'Licenses Folder'
    
    let licenseHeaderText = document.createElement('h5')
    licenseHeaderText.textContent = 'License File'

    debug.log(`[createHeaders] headers created, adding to DOM`)
    folderCol.appendChild(folderHeaderText)
    licenseCol.appendChild(licenseHeaderText)

    resultsElement.appendChild(folderCol)
    resultsElement.appendChild(licenseCol)
    debug.log('[createHeaders] headers added to DOM')
}

function createFolderResultsList() {
    let folderResultsDiv = document.createElement('div')

    folderResultsList = document.createElement('ul')
    folderResultsList.classList.add('collection')

    folderResultsDiv.appendChild(folderResultsList)
    folderCol.appendChild(folderResultsDiv)
}

function createLicenseResultsList() {
    let licenseResultsDiv = document.createElement('div')

    licenseResultsList = document.createElement('ul')
    licenseResultsList.classList.add('collection')

    licenseResultsDiv.appendChild(licenseResultsList)
    licenseCol.appendChild(licenseResultsDiv)
}

function getPlatform() {
    debug.log(`[getPlatform] returning platform ${process.platform}`)
    return process.platform
}

function licenseDirExists() {
    let exists, dirPath, platform = getPlatform()
    if (platform == 'win32') {
        dirPath = path.join('C:', 'ProgramData', 'Red Giant', 'licenses')
        debug.log(`[licenseDirExists] windows platform detected, path set: ${dirPath}`)
        exists = fs.existsSync(dirPath)
    } else {
        dirPath = path.join('Users', 'Shared', 'Red Giant', 'licenses')
        debug.log(`[licenseDirExists] *nix platform detected, path set: ${dirPath}`)
        exists = fs.existsSync(dir_path)
    }
    
    debug.log(`[licenseDirExists] directory exists? ${exists}`)
    return exists
}

function getParentDir(fullPath) {
    debug.log(`[getParentDir] path supplied: ${fullPath}`)
    let parentPath = fullPath.split(path.sep).slice(0, -1).join(path.sep)
    debug.log(`[getParentPath] parent path: ${parentPath}`)
    return parentPath
}

function checkFolderCase() {
    debug.log(`[checkFolderCase] checking for lowercase "licenses" folder`)
    let directoryPath = getLicenseDirPath()
    let dir = getParentDir(directoryPath)
    let contents = fs.readdirSync(dir)
    debug.log(`[checkFolderCase] Red Giant directory contents:`)
    debug.print(contents)
    contents = contents.filter(d => d.includes('icenses'))
    debug.log(`[checkFolderCase] filtered contents:`)
    debug.print(contents)
    return contents[0] === "licenses"
}

function getLicenseFiles() {
    debug.log(`[getLicenseFiles] scanning for license files in default location`)
    let directoryPath = getLicenseDirPath()
    let contents = fs.readdirSync(directoryPath)
    
    if (contents.length == 0) {
        debug.log(`[getLicenseFiles] no files found in default directory`)
        return null
    } else {
        contents = contents.filter(i => i.endsWith('.lic') || i.endsWith('.config'))
        debug.log(`[getLicenseFiles] license files found:`)
        debug.print(contents)
        return contents
    }
}

function licenseFileExists() {
    return getLicenseFiles() != null
}

function checkSpelling() {
    debug.log('[checkSpelling] checking alternative spelling...')
    let fullPath = getLicenseDirPath()
    let RedGiantDir = getParentDir(fullPath)

    let regex = new RegExp('[L|l]i[c|s]en[c|s]es?$')
    debug.log('[checkSpelling] license folder regex: ' + regex)
    let dirContents = fs.readdirSync(RedGiantDir)
    let licensesFolder = dirContents.filter(d => regex.test(d))
    debug.log(`[checkSpelling] possible folders found:`)
    debug.print(licensesFolder)

    return licensesFolder.length > 0 ? licensesFolder[0] : false
}

function readLicenseFile(licensePath) {
    debug.log(`[readLicenseFile] path supplied: ${licensePath}`)
    let licenseContents = fs.readFileSync(licensePath, {
        encoding: 'utf-8'
    })
    debug.log(`[readLicenseFile] license file read, contents:`)
    debug.print(licenseContents)

    let license = {},
        values = licenseContents.split(' ')

    license.name = licensePath
    license.host = values[1].trim()
    license.port = values[3].trim()

    debug.log(`[readLicenseFile] values parsed:`)
    debug.print(license)

    return license
}

function getLicenseDirPath() {
    debug.log(`[getLicenseDirPath] getting directory path for current platform...`)
    let directoryPath

    if (process.platform == 'darwin') {
        directoryPath = path.join('Users', 'Shared', 'Red Giant', 'licenses')
    } else {
        directoryPath = path.join('C:', 'ProgramData', 'Red Giant', 'licenses')
    }

    debug.log(`[getLicenseDirPath] pathway generated: ${directoryPath}`)
    return directoryPath
}

function makeTableRow(headerText, contentText) {
    debug.log(`[makeTableRow] generating table row with header "${headerText}" and data "${contentText}"`)
    let row = document.createElement('tr')
    let header = document.createElement('th')
    let content = document.createElement('td')

    header.textContent = headerText
    content.textContent = contentText

    row.appendChild(header)
    row.appendChild(content)

    debug.log(`[makeTableRow] row generated`)
    return row
}

function makeBorderlessTable() {
    let table = document.createElement('table')
    table.classList.add('table')
    table.classList.add('table-borderless')
    return table
}

function makeTestButton(host, port) {
    let button = document.createElement('button')
    button.classList.add('btn-small')
    button.classList.add('waves-effect')
    button.classList.add('right')

    button.setAttribute('data-host', host)
    button.setAttribute('data-port', port)

    button.textContent = "Test"

    button.addEventListener('click', (e) => {
        debug.log(`[testButtonListener] button clicked`)
        let data = { host, port }
        debug.log(`[testButtonListener] sending data:`)
        debug.print(data)
        ipcRenderer.send('license:test', data)
    })

    return button
}

function displayLicenseContents(license) {
    debug.log(`[displayLicenseContents] generating table for license:`)
    debug.print(license)

    let listItem = document.createElement('li')
    listItem.classList.add('collection-item')
    listItem.classList.add('left-align')

    let table = makeBorderlessTable()
    listItem.appendChild(table)

    let filename = license.name.split(path.sep)[license.name.split(path.sep).length - 1]
    let fileRow = makeTableRow('File', filename)
    let addressRow = makeTableRow('Address', license.host)
    let portRow = makeTableRow('RLM Port', license.port)

    table.appendChild(fileRow)
    table.appendChild(addressRow)
    table.appendChild(portRow)

    let testButton = makeTestButton(license.host, license.port)

    listItem.appendChild(testButton)

    debug.log(`[displayLicenseContents] license data parsed into table`)

    if (license.name.endsWith('config')) {
        debug.log(`[displayLicenseContents] .config file detected, adding warning`)
        let warning = document.createElement('div')
        warning.innerHTML = '<strong>Warning: </strong>".config" files may not be supported, please change to ".lic"'
        warning.classList.add('red-text')
        warning.classList.add('px-2')
        listItem.appendChild(warning)
    }

    debug.log(`[displayLicenseContents] adding table to DOM`)
    licenseResultsList.appendChild(listItem)
}

function addListItem(column, message, color) {
    debug.log(`[addListItem] adding list item to DOM; column: ${column} - message: ${message}`)
    let listItem = document.createElement('li')
    listItem.classList.add('collection-item')

    let content = document.createElement('p')
    content.textContent = message
    content.classList.add(color)
    content.classList.add('mx-auto')
    content.classList.add('my-0')

    listItem.appendChild(content)

    if (column == 'folder') {
        folderResultsList.appendChild(listItem)
    } else if (column == 'file') {
        licenseResultsList.appendChild(listItem)
    }
}

function displayLicenses(dirPath, licenseList) {
    if (licenseList.length) {
        debug.log(`[displayLicenses] displaying ${licenseList.length} licenses`)
        if (licenseList.length > 1) {
            addListItem('file', 'Multiple license files found; This may cause conflicts.', 'red-text')
        } else {
            addListItem('file', 'Single license file found; No chance of conflicts.', 'green-text')
        }

        for (let license of licenseList) {
            debug.log(`[displayLicenses] displaying values for license:`)
            debug.print(license)
            let values = readLicenseFile(path.join(dirPath, license))
            displayLicenseContents(values)
        }
    } else {
        debug.log(`[displayLicenses] no licenses to display`)
        addListItem('file', 'No license file found!', 'red-text')
    }
}

function startSpinner() {
    debug.log('[startSpinner] starting spin animation')
    let button = document.querySelector('.material-icons.right')
    button.classList.add('spin')
}

function stopSpinner() {
    debug.log('[startSpinner] ending spin animation')
    let button = document.querySelector('.material-icons.right')
    button.classList.remove('spin')
}

document.getElementById('scan-button').addEventListener('click', () => {
    debug.log(`[scanButtonListener] beginning scan process...`)
    debug.log('[scanButtonListener] starting spin icon')
    startSpinner()

    // Clear any existing scan information
    debug.log('[scanButtonListener] clearing previous results from DOM')
    clearResults()

    // Create the section headers
    debug.log('[scanButtonListener] creating DOM headers')
    createHeaders()

    // Create the results lists for the folder and license file
    debug.log('[scanButtonListener] creating lists on DOM for folder and file results')
    createFolderResultsList()
    createLicenseResultsList()

    // If the directory exists...
    if (licenseDirExists()) {
        debug.log('[scanButtonListener] license directory found')

        // Set the success message
        debug.log('[scanButtonListener] adding success list item')
        addListItem('folder', 'Folder present!', 'green-text')

        if (!checkFolderCase()) {
            debug.log('[scanButtonListener] capital "L" found in licenses directory, adding warning')
            addListItem('folder', 'Capital L detected in "licenses" folder; Please use all lowercase', 'red-text')
        } else {
            debug.log('[scanButtonListener] lowercase "l" found in licenses directory, adding success message')
            addListItem('folder', 'Folder spelling and capitalization correct!', 'green-text')
        }

        // Check that the license exists and get the path
        debug.log('[scanButtonListener] checking for existence of license files')
        let exists = licenseFileExists()

        // If the license exists...
        if (exists) {
            debug.log('[scanButtonListener] license file(s) found!')

            // Set the success message
            addListItem('file', 'License file present!', 'green-text')

            // Read the licenses and display their contents
            debug.log('[scanButtonListener] reading license files')
            let licenses = getLicenseFiles()

            debug.log('[scanButtonListener] displaying license contents on DOM')
            displayLicenses(getLicenseDirPath(), licenses)

        } else {
            debug.log('[scanButtonListener] no license files were found')
            addListItem('file', 'License file not found!', 'red-text')
        }
    } else {
        debug.log('[scanButtonListener] "licenses" directory not found, checking for alternate spellings')
        let spelling = checkSpelling()

        if (!spelling) {
            debug.log('[scanButtonListener] no alternate spellings found')
            // Otherwise, set the failure message
            addListItem('folder', '"licenses" directory not found!', 'red-text')
            addListItem('file', 'License file not found!', 'red-text')
        } else {
            // Licenses folder exists, but is spelled incorrectly
            debug.log('[scanButtonListener] alternate spelling found, displaying warning')
            addListItem('folder', `Folder spelled incorrectly; Please change from "${spelling}" to "licenses"`, 'red-text')
            let dirPath = getParentDir(getLicenseDirPath()) + path.sep + spelling
            
            debug.log(`[scanButtonListener] scanning for license files in ${dirPath}`)
            let contents = fs.readdirSync(dirPath).filter(f => f.endsWith('.lic') || f.endsWith('.config'))
            debug.log('[scanButtonListener] contents found:')
            debug.print(contents)

            if (contents.length) {
                debug.log('[scanButtonListener] displaying licenses on DOM')
                displayLicenses(dirPath, contents)
            }
        }
    }

    debug.log('[scanButtonListener] stopping spin animation')
    stopSpinner()
})