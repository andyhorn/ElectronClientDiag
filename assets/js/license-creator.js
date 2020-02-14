const submitButton = document.getElementById('submit-button')
const hostInput = document.getElementById('host-input')
const portInput = document.getElementById('port-input')
const debug = require('./assets/js/debug.js')
const fs = require('fs')
const { ipcRenderer } = require('electron')

// submitButton.addEventListener('click', listener)
document.getElementById('license-form').addEventListener('submit', listener)

function listener(e) {
    e.preventDefault()
    debug.log(`[listener] submit button clicked, creating license...`)

    createLicense()
}

function createLicense() {
    debug.log(`[createLicense] generating license data...`)
    let host = hostInput.value
    let port = portInput.value

    let licenseString = `HOST ${host} ANY ${port}`
    let fileName = 'redgiant-client.primary.lic'

    debug.log(`[createLicense] license data:`)
    debug.print(licenseString)
    debug.print(fileName)

    sendFileData(licenseString, fileName)
}

function sendFileData(licenseData, fileName) {
    debug.log(`[sendFileData] sending data to main process...`)
    ipcRenderer.send('license:save', { data: licenseData, name: fileName })
}