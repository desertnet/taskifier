"use strict"

var TaskGenerator = module.exports = function (db) {
  this._db = db
  this._taskReceivers = []
}

TaskGenerator.prototype.addTaskReceiver = function (receiver) {
  this._taskReceivers.push(receiver)
}

TaskGenerator.prototype.taskifyEmail = function (email, cb) {
  this._db.saveEmail(email, function (err) {
    if (err) { return cb(err) }

    this._taskReceivers.forEach(function (receiver) {
      receiver.newTask()
    })

    return cb(undefined)
  }.bind(this))
}
