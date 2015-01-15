"use strict"

var Task = module.exports = function () {
  this._name = null
  this._description = null
}

Task.prototype.setName = function (name) {
  this._name = name
}

Task.prototype.name = function () {
  return this._name
}

Task.taskFromEmail = function (email) {
  var task = new Task()
  task.setName(email.subject())
  return task
}
