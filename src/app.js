console.log('######  simulator app  #####')
require('./globals')
// import { Base64 } from 'js-base64'
var net = require('net')
const config = include('config')
const geolib = require('geolib')
const momentTimezone = require('moment-timezone')

const HOST = config.ip_address
const PORT = config.port
const POLLING_INTERVAL = config.polling_interval
const TIMEOUT = config.timeout_interval * 1000
const IMEI = config.imei

const GT06_START_BIT = "7878"
const GT06_START_BIT_POSTFIX = "0d"
const GT06_STOP_BIT = "0d0a"

const START_LAT = 13.5
const START_LNG = 75.7
const DELTA_LATLNG = 0.001
const SPEED = 33   //     (1100 * DELTA_LATLNG)*3.6/config.polling_interval; //approx in km/hr
const NO_OF_GPS = "04"
const PADDING_8 = 8
const PADDING_2 = 2

var client = new net.Socket()
client.connect(PORT, HOST, function () {
  console.log('Connecting to: ' + HOST + ':' + PORT)
  let dataSize = "01"
  let imeiPrefix = "0"
  let login = GT06_START_BIT
    + GT06_START_BIT_POSTFIX
    + dataSize
    + imeiPrefix
    + IMEI
    + GT06_STOP_BIT
  console.log("login   ->   " + login)
  let loginData = Buffer.from(login, "hex")
  client.write(loginData)
});

// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
client.on('data', function (data) {
  console.log('on connection data')
  sendDataContinously(0, 0)
});

// Add a 'close' event handler for the client socket
client.on('close', function () {
  console.log('Connection closed')
});

function sendDataContinously(arg, count) {
  console.log(`arg was => ${arg}`);
  let cDateInMillis = new Date().getTime()
  let hongkongTime = cDateInMillis + 12600000
  // hongkongTime
  // const momentI = momentTimezone.tz(alert.timestamp, 'HKD')
  let date = new Date(hongkongTime)
  //in documentation its shown as year-month-date, but actual values are date-month-year.
  let dateTime = decimalToHex(parseInt(date.getFullYear().toString().substring(2, 4)))
    + decimalToHex(date.getMonth() + 1, PADDING_2)
    + decimalToHex(date.getDate(), PADDING_2)
    + decimalToHex(date.getHours(), PADDING_2)
    + decimalToHex(date.getMinutes(), PADDING_2)
    + decimalToHex(date.getSeconds(), PADDING_2)
  console.log('time is ...  ' + (new Date().getTime()))
  let newLat = START_LAT + count * DELTA_LATLNG
  let geoLat = geolib.decimal2sexagesimal(newLat);
  let latArray = geoLat.toString().split(/[°\'\"]+/)
  let latDegree = parseInt(latArray[0])
  let latMinute = (latArray[1] + (parseFloat(latArray[2]) * 1.666666667)) * 0.01
  let decimalLat = (latDegree * 60 + latMinute) * 30000
  let latHex = decimalToHex(parseInt(decimalLat), PADDING_8)

  let newLng = START_LNG //TODO:  change here for multiple vehicles
  let geoLng = geolib.decimal2sexagesimal(newLng);
  let lngArray = geoLng.toString().split(/[°\'\"]+/)
  let lngDegree = parseInt(lngArray[0])
  let lngMinute = (lngArray[1] + (parseFloat(lngArray[2]) * 1.666666667)) * 0.01
  let decimalLng = (lngDegree * 60 + lngMinute) * 30000
  let lngHex = decimalToHex(parseInt(decimalLng), PADDING_8)

  arg = arg + POLLING_INTERVAL;

  let packet_length = "1F" // sample value taken from docs
  let protocol_no = "12" // sample value taken from docs
  let data = GT06_START_BIT + packet_length + protocol_no + dateTime + NO_OF_GPS
    + latHex + lngHex + SPEED + GT06_STOP_BIT//"720194567d090007330332540f0d0a"//     +GT06_STOP_BIT((

  console.log("data is ... " + data)
  count++

  // sending data via socket
  let locationData = Buffer.from(data, "hex")
  client.write(locationData)
  if (arg <= TIMEOUT) {
    setTimeout(sendDataContinously, POLLING_INTERVAL, arg, count);
  } else {
    client.end()
    client.destroy()
  }
}

function decimalToHex(arg, padding) {
  return arg.toString(16).padStart(padding, '0')
}
