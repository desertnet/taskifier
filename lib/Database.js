"use strict"

var levelup = require("level")

var Email = require("./Email.js")

var Database = module.exports = function (dbPath) {
  this._db = this._openDatabase(dbPath)
}

Database.prototype._openDatabase = function (dbPath) {
  var db = levelup(dbPath)
  process.on("exit", this.close.bind(this))
  return db
}

Database.prototype.close = function (cb) {
  if (! this._db.isClosed()) {
    if (cb) {
      this._db.on("closed", cb)
    }
    this._db.close()
    return
  }
  else {
    process.nextTick(cb)
    return
  }
}

Database._encodeKey = function () {
  var args = Array.prototype.slice.call(arguments)
  var escapedArgs = args.map(function (keyPart) {
    return keyPart.replace(/\x00/, "\x01")
  })
  return escapedArgs.join("\x00")
}

Database.prototype.saveEmail = function (email, cb) {
  var key = Database._encodeKey("email", "id", email.id())
  this._db.put(key, JSON.stringify(email), cb)
}

Database.prototype.emailFromId = function (id, cb) {
  var key = Database._encodeKey("email", "id", id)
  this._db.get(key, function (err, data) {
    if (err) {
      if (err.notFound) {
        return cb(undefined, null)
      }
      else {
        return cb(err)
      }
    }
    else {
      var email = Email.emailFromJSON(data, function (err, email) {
        return cb(err, email)
      })
    }
  })
}
