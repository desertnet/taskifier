"use strict"

var levelup = require("level")
var levelWS = require("level-ws")

var Email = require("./Email.js")

var Database = module.exports = function (dbPath) {
  this._db = this._openDatabase(dbPath)
}

Database.prototype._openDatabase = function (dbPath) {
  var db = levelWS(levelup(dbPath))
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

Database.prototype.saveStream = function () {
  return this._db.createWriteStream()
}

Database._encodeKey = function () {
  var args = Array.prototype.slice.call(arguments)
  var escapedArgs = args.map(function (keyPart) {
    return keyPart.replace(/\x00/, "\x01")
  })
  return escapedArgs.join("\x00")
}

Database.prototype.saveEmail = function (email, cbOrWS) {
  var cb = cbOrWS instanceof Function ? cbOrWS : undefined
  var ws = cb ? undefined : cbOrWS

  var key = Database._encodeKey("email", "id", email.id())
  var value = JSON.stringify(email)

  if (cb) {
    this._db.put(key, value, cb)
  }
  else {
    ws.write({ key: key, value: value })
  }
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
