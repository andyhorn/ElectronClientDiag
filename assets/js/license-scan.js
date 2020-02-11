const electron = require('electron')
const { app, ipcRenderer } = electron
const fs = require('fs')
const path = require('path')
const platform = process.platform

const folder_present_element = document.getElementById('folder-present')
const folder_spelling_element = document.getElementById('folder-spelling')
const license_present_element = document.getElementById('license-present')

console.log(platform)

const scanButton = document.getElementById('scan-button').addEventListener('click', () => {
    let folder_path = checkDirExists()

    if (folder_path) {
        let license_path = checkLicenseExists(folder_path)
        if (license_path) {
            readLicenseFile(path.join(folder_path, license_path))
        }
    }
})

function checkDirExists() {
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

    if (exists) {
        folder_present_element.innerText = 'License folder present!'
        folder_present_element.className = 'green-text'
    
        if (dir_path.endsWith('licenses')) {
            folder_spelling_element.innerText = 'Directory spelled correctly!'
            folder_spelling_element.className = 'green-text'
        } else if (dir_path.endsWith('Licenses')) {
            folder_spelling_element.innerText = 'Please use lowercase \"l\" in "licenses"'
            folder_spelling_element.className = 'orange-text'
        }

        return dir_path
    }

    return false
}

function checkLicenseExists(dir_path) {
    let contents = fs.readdirSync(dir_path)
    console.log(contents)
    
    let license = contents.filter(i => i.endsWith('.lic'))
    console.log(license)
    
    if (license.length === 1) {
        license_present_element.innerText = 'Client license file found!'
        license_present_element.className = 'green-text'
        return license[0]
    }

    return false
}

function readLicenseFile(license_path) {
    let license_contents = fs.readFileSync(license_path, {
        encoding: 'utf-8'
    })
    console.log(license_contents)
    let host = license_contents.split(' ')[0],
        address = license_contents.split(' ')[1],
        any = license_contents.split(' ')[2],
        port = license_contents.split(' ')[3]

    document.getElementById('content-header').innerText = 'License contents:'
    document.getElementById('host').innerText = host
    document.getElementById('address').innerText = address
    document.getElementById('any').innerText = any
    document.getElementById('port').innerText = port
}
