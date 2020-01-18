const path = require('path')
global.__projectdir = `${__dirname}${path.sep}`
global.fullPath = file => `${__projectdir}${file}`
global.include = file => require(`${fullPath(file)}`)
