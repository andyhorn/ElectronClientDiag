const electron = require('electron')
const { app, ipcRenderer } = electron
const fs = require('fs')
const path = require('path')
const platform = process.platform

let folderCol, licenseCol, folderResultsList, licenseResultsList

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
    let folderPresentItem = document.createElement('li')

    folderResultsList.classList.add('collection')
    folderPresentItem.classList.add('collection-item')
    folderPresentItem.id = 'folder-present'

    folderResultsList.appendChild(folderPresentItem)
    folderResultsDiv.appendChild(folderResultsList)
    folderCol.appendChild(folderResultsDiv)
}

function createLicenseResultsList() {
    let licenseResultsDiv = document.createElement('div')
    licenseResultsList = document.createElement('ul')
    let licensePresentItem = document.createElement('li')

    licenseResultsList.classList.add('collection')
    licensePresentItem.classList.add('collection-item')
    licensePresentItem.id = 'license-present'

    licenseResultsDiv.appendChild(licenseResultsList)
    licenseResultsList.appendChild(licensePresentItem)
    licenseCol.appendChild(licenseResultsDiv)
}

function setFolderExists(exists) {
    let listItem = document.getElementById('folder-present')
    
    if (exists) {
        listItem.textContent = 'Present!'
        listItem.classList.add('green-text')
    } else {
        listItem.textContent = 'Not found!'
        listItem.classList.add('red-text')
    }
}

function setLicenseExists(exists) {
    let listItem = document.getElementById('license-present')

    if (exists) {
        listItem.textContent = 'Present!'
        listItem.classList.add('green-text')
    } else {
        listItem.textContent = 'Not found!'
        listItem.classList.add('red-text')
    }
}

function licenseDirExists() {
    let exists, dir_path
    if (platform == 'darwin') {
        dir_path = path.join('Users', 'Shared', 'Red Giant', 'licenses')
        console.log(dir_path)
        exists = fs.existsSync(dir_path)
    } else {
        dir_path = path.join('C:', 'ProgramData', 'Red Giant', 'licenses')
        console.log(dir_path)
        exists = fs.existsSync(dir_path)
    }
    console.log(exists)

    return exists
}


function checkLicenseExists(dir_path) {
    let contents = fs.readdirSync(dir_path)
    console.log(contents)
    
    let licenses = contents.filter(i => i.endsWith('.lic'))
    console.log(licenses)
    
    return licenses.length > 0
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

function displayLicenseContents(license) {
    let listItem = document.createElement('li')
    listItem.classList.add('collection-item')
    listItem.classList.add('left-align')

    let header = document.createElement('div')
    header.innerHTML = '<strong>File: </strong>' + license.name

    let address = document.createElement('div')
    address.innerHTML = '<strong>Address: </strong>' + license.host

    let port = document.createElement('div')
    port.innerHTML = '<strong>Port: </strong>' + license.port

    let testButton = document.createElement('button')
    testButton.classList.add('btn-small')
    testButton.classList.add('waves-effect')
    testButton.classList.add('waves-light')
    // testButton.classList.add('right')
    testButton.setAttribute('data-host', license.host)
    testButton.setAttribute('data-port', license.port)
    testButton.textContent = "Test"

    testButton.addEventListener('click', (e) => {
        console.log(e)
        let data = {
            address: e.target.dataset['host'],
            port: e.target.dataset['port']
        }

        console.log(data)
        ipcRenderer.send('license:test', data)
    })

    listItem.appendChild(header)
    listItem.appendChild(address)
    listItem.appendChild(port)
    listItem.appendChild(testButton)

    licenseResultsList.appendChild(listItem)
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
        setFolderExists(true)

        // Get the directory path
        let directoryPath = getLicenseDirPath()

        // Check that the license exists and get the path
        let exists = licenseFileExists()

        // If the license exists...
        if (exists) {

            // Set the success message
            setLicenseExists(true)

            // Read the licenses
            let licenses = getLicenseFiles()
            let contents = []
            for (let license of licenses) {
                let values = readLicenseFile(path.join(directoryPath, license))
                contents.push(values)
            }

            // Display contents
            for (let item of contents) {
                displayLicenseContents(item)
            }

        } else {
            setLicenseExists(false)
        }
    } else {
        // Otherwise, set the failure message
        setFolderExists(false)
        setLicenseExists(false)
    }
})