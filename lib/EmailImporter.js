"use strict"

var fs = require("fs")
var through2 = require("through2")
var MboxParser = require("node-mbox")

var Email = require("./Email.js")

var EmailImporter = module.exports = function (db) {
  this._db = db
}

EmailImporter.prototype.importMboxFile = function (mboxPath, cb) {
  var mboxRawStream = fs.createReadStream(mboxPath)
  mboxRawStream.on("error", function (err) {
    return cb(err)
  })

  var emailStream = emailStreamFromRawMboxStream(mboxRawStream)

  var saveStream = this._db.saveStream()
  emailStream.on("data", function (email) {
    this._db.saveEmail(email, saveStream)
  }.bind(this))
  emailStream.on("finish", function () {
    saveStream.end()
  })

  saveStream.on("error", function (err) {
    return cb(err)
  })
  saveStream.on("finish", function () {
    return cb()
  })
}

function emailStreamFromRawMboxStream (mboxRawStream) {
  var parser = new MboxParser(mboxRawStream)
  var emailStream = through2({ objectMode: true }, function (msg, enc, cb) {
    Email.emailFromEmailText(msg, function (err, email) {
      return cb(err, email)
    })
  })

  parser.on("message", function (msg) {
    emailStream.write(msg)
  })
  parser.on("end", function () {
    emailStream.end()
  })

  return emailStream
}
