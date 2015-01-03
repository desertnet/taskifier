"use strict"

var MailParser = require("mailparser").MailParser
var uuid = require("uuid")

var Email = module.exports = function () {
  this._from = null
  this._id = null
}

Email.prototype.initializeFromEmailText = function (text, cb) {
  var mailParser = new MailParser()

  mailParser.on("end", function (emailData) {
    var error

    try {
      this._initializeFromMailparserObject(emailData)
    }
    catch(e) {
      error = e
    }
    finally {
      return cb(error, this)
    }
  }.bind(this))

  mailParser.write(text)
  mailParser.end()
}

Email.prototype._initializeFromMailparserObject = function (data) {
  this._id = data.headers["message-id"] || uuid.v4()
  this._from = data.from[0]
}

Email.prototype.from = function () {
  return this._from
}

Email.prototype.id = function () {
  return this._id
}

Email.prototype.toJSON = function () {
  return {
    "id": this.id(),
    "from": this.from()
  }
}
