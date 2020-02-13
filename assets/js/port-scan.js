const electron = require('electron')
const { ipcRenderer } = electron
const Net = require('net')
const ports = document.querySelectorAll('input.port-input')
const host = document.getElementById('host')
const form = document.querySelector('form')
const debug = require('./assets/js/debug.js')

const TIMEOUT = 3000

var scanning = 0

form.addEventListener('submit', (e) => {
    debug.log('[submitListener] beginning port scan')
    e.preventDefault()
    startSpinner()

    for (let port of ports) {
        port.className = 'px-1'
    }

    for (let port of ports) {
        if (port.value) {
            debug.log('[submitListener] beginning scan of port ' + port.value + ' on host ' + host.value)
            testPort(port, host.value)
        }
    }
})

function testPort(port, host) {
    debug.log(`[testPort] incrementing scan counter`)
    scanning += 1
    debug.log(`[testPort] scan counter: ${scanning}`)
    debug.log(`[testPort] beginning scan on port ${port.value}`)
    let passed
    let socket = new Net.Socket()
    socket.setTimeout(TIMEOUT)
    debug.log(`[testPort] ${TIMEOUT}ms second timeout set`)
    socket.on('connect', () => {
        debug.log(`[testPort] connection successful on port ${port.value}`)
        passed = true
        socket.end()
    })
    socket.on('timeout', () => {
        debug.log(`[testPort] timeout error on port ${port.value}`)
        passed = false
        socket.destroy()
    })
    socket.on('error', () => {
        debug.log(`[testPort] unable to connect on port ${port.value}`)
        passed = false
        socket.end()
    })
    socket.on('close', () => {
        debug.log(`[testPort] port ${port.value} closed`)
        port.classList.add(passed ? 'green' : 'red')
        port.classList.add('white-text')
        debug.log(`[testPort] decrementing scan counter`)
        scanning -= 1
        debug.log(`[testPort] scan counter: ${scanning}`)
        stopSpinner()
    })

    debug.log(`[testPort] attempting connection on ${host}:${port.value}`)
    socket.connect(port.value, host)
}

function startSpinner() {
    debug.log(`[startSpinner] scan counter: ${scanning}`)
    if (scanning == 0) {
        debug.log(`[startSpinner] creating spinning icon`)
        let icon = document.createElement('i')
        icon.classList.add('material-icons')
        icon.innerText = 'sync'
        icon.classList.add('spin')
        icon.classList.add('ml-2')
        icon.id = 'spin-icon'

        debug.log(`[startSpinner] adding spinning icon to DOM`)
        document.getElementById('button-row').appendChild(icon)
    }
}

function stopSpinner() {
    debug.log(`[stopSpinner] scan counter: ${scanning}`)
    if (scanning == 0) {
        debug.log(`[stopSpinner] removing spinning icon`)
        document.getElementById('spin-icon').remove()
    }
}

ipcRenderer.on('license:test', (e, data) => {
    debug.log(`[license:test] received data from Main:`)
    debug.print(data)
    debug.log(`[license:test] setting data values to DOM`)
    host.value = data.host
    document.getElementById('port-cc').value = data.port
})