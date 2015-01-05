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

  var saveStream = this._db.emailSaveStream()
  saveStream.on("error", function (err) {
    return cb(err)
  })
  saveStream.on("finish", function () {
    return cb()
  })

  emailStream.pipe(saveStream)
}

function emailStreamFromRawMboxStream (mboxRawStream) {
  var parser = new MboxParser(mboxRawStream)
  var emailStream = through2.obj(function (msg, enc, cb) {
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
