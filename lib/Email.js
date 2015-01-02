"use strict"

var MailParser = require("mailparser").MailParser

var Email = module.exports = function () {
  this._data = null
}

Email.prototype.initializeFromEmailText = function (text, cb) {
  var mailParser = new MailParser()

  mailParser.on("end", function (emailData) {
    this._data = emailData
    return cb(undefined, this)
  }.bind(this))

  mailParser.write(text)
  mailParser.end()
}

Email.prototype.from = function () {
  return this._data.from[0]
}

Email.prototype.id = function () {
  return this._data.headers["message-id"]
}
