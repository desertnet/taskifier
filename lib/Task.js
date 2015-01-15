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

Task.prototype.setDescription = function (desc) {
  this._description = desc
}

Task.prototype.description = function () {
  return this._description
}

Task.taskFromEmail = function (email) {
  var task = new Task()
  task.setName(email.subject())
  task.setDescription(convertEmailToTaskDescription(email))
  return task
}

function convertEmailToTaskDescription (email) {
  var desc = ""
  var sender = email.from().name || email.from().address || "unknown sender"
  desc += "Email from "+sender+":\n\n"
  desc += email.body().replace(/^\s+|\s+$/g, "")
  return desc
}
