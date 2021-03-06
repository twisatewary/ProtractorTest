var assign = require('./util/assign')

var fse = {}
var gfs = require('graceful-fs')

// attach fs methods to fse
Object.keys(gfs).forEach(function (key) {
  fse[key] = gfs[key]
})

var fs = fse

assign(fs, require('./copy/index'))
assign(fs, require('./copy-sync/index'))
assign(fs, require('./mkdirs/index'))
assign(fs, require('./remove/index'))
assign(fs, require('./json/index'))
assign(fs, require('./move/index'))
assign(fs, require('./streams/index'))
assign(fs, require('./empty/index'))
assign(fs, require('./ensure/index'))
assign(fs, require('./output/index'))
assign(fs, require('./walk/index'))

module.exports = fs

// maintain backwards compatibility for awhile
var jsonfile = {}
Object.defineProperty(jsonfile, 'spaces', {
  get: function () {
    return fs.spaces // found in ./json
  },
  set: function (val) {
    fs.spaces = val
  }
})

module.exports.jsonfile = jsonfile // so users of fs-extra can modify jsonFile.spaces
