const electron = require('electron')
const { app, ipcRenderer } = electron
const Net = require('net')
const ports = document.querySelectorAll('input.port-input')
const host = document.getElementById('host')
const form = document.querySelector('form')

form.addEventListener('submit', (e) => {
    e.preventDefault()

    for (let port of ports) {
        port.className = 'px-1'
    }

    for (let port of ports) {
        console.log(port)
        if (port.value) {
            testPort(port, host.value)
        }
    }
})

function testPort(port, host) {
    console.log('testing port ' + port.value + 'on host ' + host)
    let passed
    let socket = new Net.Socket()
    socket.setTimeout(3000)
    socket.on('connect', () => {
        console.log('port success')
        passed = true
        socket.end()
    })
    socket.on('timeout', () => {
        console.log('port timeout')
        passed = false
        socket.destroy()
    })
    socket.on('error', () => {
        console.log('port error')
        passed = false
        socket.end()
    })
    socket.on('close', () => {
        port.classList.add(passed ? 'green' : 'red')
        port.classList.add('white-text')
    })

    socket.connect(port.value, host)
}

ipcRenderer.on('license:test', (e, data) => {
    console.log('message received')
    host.value = data.address
    document.getElementById('port-cc').value = data.port
})