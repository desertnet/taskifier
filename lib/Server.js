"use strict"

var Hapi = require("hapi")
var Email = require("./Email.js")
var Database = require("./Database.js")
var TaskGenerator = require("./TaskGenerator.js")

var Server = module.exports = function (config) {
  this._port = config.port || 80
  this._addr = config.addr || "127.0.0.1"
  this._hapi = new Hapi.Server()

  this._taskGenerators = {}

  this._setUpHapiServerConnection()
  this._addRoutes()
}

Server.serverFromConfiguration = function (config) {
  var server = new Server({
    "port": config.port,
    "addr": config.addr,
  })

  Object.keys(config.inboxes).forEach(function (inboxName) {
    var inboxConfig = config.inboxes[inboxName]
    var db = new Database(inboxConfig.database)
    var taskGenerator = new TaskGenerator(db)
    Object.keys(inboxConfig.taskReceivers).forEach(function (taskReceiverModuleName) {
      var taskReceiverConfig = inboxConfig.taskReceivers[taskReceiverModuleName]
      var TaskReceiverClass = require(taskReceiverModuleName)
      var taskReceiver = new TaskReceiverClass()
      taskReceiver.configure(taskReceiverConfig)
      taskGenerator.addTaskReceiver(taskReceiver)
    })
    server.setTaskGeneratorForInbox(inboxName, taskGenerator)
  })

  return server
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

Server.prototype._addRoutes = function () {
  this._hapi.route({
    "method": "GET",
    "path": "/status",
    "handler": this._getStatusHandler.bind(this)
  })

  this._hapi.route({
    "method": "POST",
    "path": "/inbox/{name}/email",
    "handler": this._postInboxEmailHandler.bind(this),
    "config": {
      "payload": { "output": "data", "parse": false }
    }
  })
}

Server.prototype._getStatusHandler = function (request, reply) {
  return reply('{"statusCode": 200}')
}

Server.prototype.setTaskGeneratorForInbox = function (inbox, taskGenerator) {
  this._taskGenerators[inbox] = taskGenerator
}

Server.prototype._postInboxEmailHandler = function (request, reply) {
  var taskGenerator = this._taskGenerators[request.params.name]

  if (!taskGenerator) {
    return reply().code(404)
  }

  Email.emailFromEmailText(request.payload.toString(), function (err, email) {
    if (err || !email.from() || !email.body()) {
      return reply().code(400)
    }

    taskGenerator.taskifyEmail(email, function (err) {
      if (err) {
        return reply().code(500)
      }

      return reply().code(200)
    })
  }.bind(this))
}
