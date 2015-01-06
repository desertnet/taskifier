"use strict"

var uuid = require("uuid")

var Thread = module.exports = function () {
  this._id = uuid.v4().toLowerCase()
  this._messageIds = []
}

Thread.threadFromJSON = function (data) {
  var thread = new Thread()
  thread._setId(data.id)
  data.messageIds.forEach(function (id) {
    thread.addMessageId(id)
  })
  return thread
}

Thread.prototype.toJSON = function () {
  return {
    "id": this.id(),
    "messageIds": this.messageIds()
  }
}

Thread.prototype._setId = function (id) {
  this._id = id
}

Thread.prototype.addMessageId = function (id) {
  this._messageIds.push(id.toLowerCase())
}

Thread.prototype.messageIds = function () {
  return this._messageIds.slice()
}
