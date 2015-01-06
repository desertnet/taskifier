"use strict"

var MailParser = require("mailparser").MailParser
var uuid = require("uuid")

var Email = module.exports = function () {
  this._raw = null
  this._from = null
  this._id = null
  this._references = []
}

Email.emailFromEmailText = function (text, cb) {
  var email = new Email()
  return email.initializeFromEmailText(text, cb)
}

Email.emailFromJSON = function (json, cb) {
  var email = new Email()

  try {
    var jsonData = JSON.parse(json)
  }
  catch (e) {
    return cb(e)
  }

  email._setId(jsonData.id)
  return email.initializeFromEmailText(jsonData.raw, cb)
}

Email.prototype.initializeFromEmailText = function (text, cb) {
  this._raw = text.toString()

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

  mailParser.write(this._raw)
  mailParser.end()
}

Email.prototype._initializeFromMailparserObject = function (data) {
  this._setId(data.headers["message-id"] || uuid.v4())
  this._from = data.from[0]
  this._references = extractReferencesFromParsedEmail(data)
}

Email.prototype.raw = function () {
  return this._raw
}

Email.prototype.from = function () {
  return this._from
}

Email.prototype.id = function () {
  return this._id
}

Email.prototype._setId = function (newId) {
  this._id = newId.toLowerCase()
}

Email.prototype.references = function () {
  return this._references.slice()
}

Email.prototype.toJSON = function () {
  return {
    "id": this.id(),
    "raw": this.raw()
  }
}

function extractReferencesFromParsedEmail (email) {
  var referencesHeader = email.headers.references || ""
  var references = splitAndMungeHeader(referencesHeader)

  var inReplyToHeader = email.headers["in-reply-to"] || ""
  var inReplyRefs = splitAndMungeHeader(inReplyToHeader)

  return unique(references.concat(inReplyRefs))

  function splitAndMungeHeader (header) {
    return header
      .split(/[^<>]*(?=\<)/)
      .map(function (ref) { return ref.toLowerCase() })
      .filter(function (ref) { return ref !== "" })
  }

  function unique (array) {
    var seen = {}
    return array.filter(function(element) {
      return !(element in seen) && (seen[element] = true)
    })
  }
}
