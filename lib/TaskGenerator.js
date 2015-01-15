"use strict"

var Task = require("./Task.js")

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

    this._db.threadFromThreadId(email.threadId(), function (err, thread) {
      if (err) { return cb(err) }

      this._taskReceivers.forEach(function (receiver) {
        if (thread.messageIds().length === 1) {
          var task = new Task()
          receiver.newTask(task, function (err) {
            // Should probably do more with errors...
            console.error(err)
          })
        }
      }.bind(this))

      return cb(undefined)
    }.bind(this))
  }.bind(this))
}
