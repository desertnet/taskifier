"use strict"

var levelup = require("level")
var through2 = require("through2")

var Email = require("./Email.js")
var Thread = require("./Thread.js")

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

function encodeKey () {
  var args = Array.prototype.slice.call(arguments)
  var escapedArgs = args.map(function (keyPart) {
    return keyPart.replace(/\x00/, "\x01")
  })
  return escapedArgs.join("\x00")
}

function emailKeyFromId (id) {
  return encodeKey("email", "id", id)
}

Database.prototype.emailSaveStream = function () {
  return through2.obj(function (email, enc, cb) {
    this.saveEmail(email, cb)
  }.bind(this))
}

Database.prototype.saveEmail = function (email, cb) {
  var batch = this._db.batch()
  var doEmailSaveWithThread = function (thread) {
    email.setThreadId(thread.id())
    thread.addMessageId(email.id())
    this.saveEmailInBatch(email, batch)
    this.saveThreadInBatch(thread, batch)
    return batch.write(cb)
  }.bind(this)

  var references = email.references()
  if (references.length === 0) {
    return doEmailSaveWithThread(new Thread())
  }
  else {
    var existingThread
    var countDown = references.length
    references.forEach(function (ref) {
      this.threadFromEmailId(ref, function (err, thread) {
        if (thread) {
          existingThread = thread
        }

        if (--countDown === 0) {
          return doEmailSaveWithThread(existingThread || new Thread())
        }
      }.bind(this))
    }.bind(this))
  }
}

Database.prototype.saveEmailInBatch = function (email, batch) {
  var key = emailKeyFromId(email.id())
  var value = JSON.stringify(email)
  batch.put(key, value)
}

Database.prototype.emailFromId = function (id, cb) {
  this._db.get(emailKeyFromId(id), function (err, data) {
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

function threadKeyFromId (id) {
  return encodeKey("thread", "id", id)
}

Database.prototype.threadFromEmailId = function (emailId, cb) {
  this.emailFromId(emailId, function (err, email) {
    if (err) { return cb(err) }

    if (email) {
      return this.threadFromThreadId(email.threadId(), cb)
    }
    else {
      return cb(undefined, null)
    }
  }.bind(this))
}

Database.prototype.threadFromThreadId = function (threadId, cb) {
  this._db.get(threadKeyFromId(threadId), function (err, data) {
    if (err) {
      if (err.notFound) {
        return cb(undefined, null)
      }
      else {
        return cb(err)
      }
    }
    else {
      return cb(undefined, Thread.threadFromJSON(data))
    }
  })
}

function saveThread (dbOrBatch, thread, cb) {
  dbOrBatch.put(threadKeyFromId(thread.id()), JSON.stringify(thread), cb)
}

Database.prototype.saveThread = function (thread, cb) {
  return saveThread(this._db, thread, cb)
}

Database.prototype.saveThreadInBatch = function (thread, batch) {
  return saveThread(batch, thread)
}
