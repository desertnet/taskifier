"use strict"

var Hapi = require("hapi")

var Server = module.exports = function (config) {
  this._port = config.port || 80
  this._addr = config.addr || "127.0.0.1"
  this._hapi = new Hapi.Server()

  this._setUpHapiServerConnection()
  this._addUniversalRoutes()
}

Server.prototype.start = function (cb) {
  this._hapi.start(function (err) {
    return cb(err)
  }.bind(this))
}

Server.prototype._setUpHapiServerConnection = function () {
  this._hapi.connection({
    "host": this._addr,
    "port": this._port
  })
}

Server.prototype._addUniversalRoutes = function () {
  this._hapi.route({
    "method": "GET",
    "path": "/status",
    "handler": this._getStatusHandler.bind(this)
  })
}

Server.prototype._getStatusHandler = function (request, reply) {
  return reply('{"statusCode": 200}')
}
