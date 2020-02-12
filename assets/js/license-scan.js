const electron = require('electron')
const { ipcRenderer } = electron
const fs = require('fs')
const path = require('path')

var folderCol, licenseCol, folderResultsList, licenseResultsList

const resultsElement = document.getElementById('scan-results')

function clearResults() {
    resultsElement.innerHTML = ''
}

function createHeaders() {
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

    folderCol.appendChild(folderHeaderText)
    licenseCol.appendChild(licenseHeaderText)

    resultsElement.appendChild(folderCol)
    resultsElement.appendChild(licenseCol)
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
    return process.platform
}

function licenseDirExists() {
    let exists, dir_path, platform = getPlatform()
    if (platform == 'win32') {
        dir_path = path.join('C:', 'ProgramData', 'Red Giant', 'licenses')
        console.log(dir_path)
        exists = fs.existsSync(dir_path)
    } else {
        dir_path = path.join('Users', 'Shared', 'Red Giant', 'licenses')
        console.log(dir_path)
        exists = fs.existsSync(dir_path)
    }
    console.log(exists)

    return exists
}

function getParentDir(fullPath) {
    return fullPath.split(path.sep).slice(0, -1).join(path.sep)
}

function checkFolderCase() {
    let directoryPath = getLicenseDirPath()

    let dir = getParentDir(directoryPath)
    console.log(dir)
    let contents = fs.readdirSync(dir)
    console.log(contents)
    contents = contents.filter(d => d.includes('icenses'))
    console.log(contents)
    return contents[0] === "licenses"
}

function getLicenseFiles() {
    let directoryPath = getLicenseDirPath()
    let contents = fs.readdirSync(directoryPath)
    
    if (contents.length == 0) {
        return null
    } else {
        return contents.filter(i => {
            return i.endsWith('.lic') || i.endsWith('.config')
        })
    }
}

function licenseFileExists() {
    return getLicenseFiles != null
}

function checkSpelling() {
    console.log('checking alternative spelling...')
    let fullPath = getLicenseDirPath()
    let RedGiantDir = getParentDir(fullPath)

    let regex = new RegExp('[L|l]i[c|s]en[c|s]es?$')
    console.log('regex: ' + regex)
    let dirContents = fs.readdirSync(RedGiantDir)
    let licensesFolder = dirContents.filter(d => regex.test(d))

    console.log(licensesFolder)

    return licensesFolder.length > 0 ? licensesFolder[0] : false
}

function readLicenseFile(license_path) {
    let license_contents = fs.readFileSync(license_path, {
        encoding: 'utf-8'
    })
    let license = {},
        values = license_contents.split(' ')

    license.name = license_path
    license.host = values[1].trim()
    license.port = values[3].trim()

    return license
}

function getLicenseDirPath() {
    let directoryPath

    if (process.platform == 'darwin') {
        directoryPath = path.join('Users', 'Shared', 'Red Giant', 'licenses')
    } else {
        directoryPath = path.join('C:', 'ProgramData', 'Red Giant', 'licenses')
    }

    return directoryPath
}

function makeTableRow(headerText, contentText) {
    let row = document.createElement('tr')
    let header = document.createElement('th')
    let content = document.createElement('td')

    header.textContent = headerText
    content.textContent = contentText

    row.appendChild(header)
    row.appendChild(content)

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
        let data = { host, port }
        ipcRenderer.send('license:test', data)
    })

    return button
}

function displayLicenseContents(license) {
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

    if (license.name.endsWith('config')) {
        let warning = document.createElement('div')
        warning.innerHTML = '<strong>Warning: </strong>".config" files may not be supported, please change to ".lic"'
        warning.classList.add('red-text')
        warning.classList.add('px-2')
        listItem.appendChild(warning)
    }

    licenseResultsList.appendChild(listItem)
}

function addListItem(column, message, color) {
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
        console.log(licenseList.length)
        if (licenseList.length > 1) {
            addListItem('file', 'Multiple license files found; This may cause conflicts.', 'red-text')
        } else {
            addListItem('file', 'Single license file found; No chance of conflicts.', 'green-text')
        }

        for (let license of licenseList) {
            let values = readLicenseFile(path.join(dirPath, license))
            displayLicenseContents(values)
        }
    } else {
        addListItem('file', 'No license file found!', 'red-text')
    }
}

document.getElementById('scan-button').addEventListener('click', () => {
    // Clear any existing scan information
    clearResults()

    // Create the section headers
    createHeaders()

    // Create the results lists for the folder and license file
    createFolderResultsList()
    createLicenseResultsList()

    // If the directory exists...
    if (licenseDirExists()) {

        // Set the success message
        addListItem('folder', 'Folder present!', 'green-text')

        if (!checkFolderCase()) {
            console.log('capital L detected')
            addListItem('folder', 'Capital L detected in "licenses" folder; Please use all lowercase', 'red-text')
        } else {
            addListItem('folder', 'Folder spelling and capitalization correct!', 'green-text')
        }

        // Get the directory path
        let directoryPath = getLicenseDirPath()

        // Check that the license exists and get the path
        let exists = licenseFileExists()

        // If the license exists...
        if (exists) {

            // Set the success message
            addListItem('file', 'License file present!', 'green-text')

            // Read the licenses and display their contents
            let licenses = getLicenseFiles()

            displayLicenses(getLicenseDirPath(), licenses)
            // for (let license of licenses) {
            //     let values = readLicenseFile(path.join(directoryPath, license))
            //     displayLicenseContents(values)
            // }

        } else {
            // setLicenseExists(false)
            addListItem('file', 'License file not found!', 'red-text')
        }
    } else {

        let spelling = checkSpelling()

        if (!spelling) {
            // Otherwise, set the failure message
            addListItem('folder', '"licenses" directory not found!', 'red-text')
            addListItem('file', 'License file not found!', 'red-text')
        } else {
            // Licenses folder exists, but is spelled incorrectly
            console.log('folder spelled incorrectly')
            addListItem('folder', `Folder spelled incorrectly; Please change from "${spelling}" to "licenses"`, 'red-text')
            let dirPath = getParentDir(getLicenseDirPath()) + path.sep + spelling
            console.log(dirPath)
            let contents = fs.readdirSync(dirPath).filter(f => f.endsWith('.lic') || f.endsWith('.config'))

            displayLicenses(dirPath, contents)
            // if (contents.length) {
            //     console.log(contents.length)
            //     if (contents.length > 1) {
            //         addListItem('file', 'Multiple license files found; This may cause conflicts.', 'red-text')
            //     } else {
            //         addListItem('file', 'Single license file found; No chance of conflicts.', 'green-text')
            //     }

            //     for (let license of contents) {
            //         let values = readLicenseFile(path.join(dirPath, license))
            //         displayLicenseContents(values)
            //     }
            // } else {
            //     addListItem('file', 'No license file found!', 'red-text')
            // }
            console.log(spelling)
        }
    }
})