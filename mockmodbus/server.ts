import {Server} from 'net'
import * as Modbus from 'jsmodbus'

const netServer = new Server()
const initialHoldingRegisters = Buffer.alloc(10000)
const server = new Modbus.server.TCP(netServer, {
    holding: initialHoldingRegisters
})

server.on('connection', function (client) {
    console.log('New Connection')
})

server.on('writeSingleCoil', function (request, buffer) {

    console.log('writeSingleCoil', request, buffer)

})

server.on('connection', function (client) {
    /* work with the modbus tcp client */
    console.log('New Connection')
})

let port = process.argv[2] || 8502;
netServer.listen(port)

console.log(`Modbus TCP server is listening on port ${port}`)