"use strict"

var assert = require("assert")
var temp = require("temp").track()
var path = require("path")
var fs = require("fs")

var Email = require("../lib/Email.js")
var Database = require("../lib/Database.js")

describe("Database", function () {
  var db, tmpdir, dbPath, helloEmail
  var helloEmailText = fs.readFileSync(path.join(__dirname, "data", "hello.eml"))

  before(function(done) {
    temp.mkdir("email-to-task-db-testing", function (err, tmpdirPath) {
      assert.ifError(err)
      dbPath = path.join(tmpdirPath, "main-test-db.leveldb")
      db = new Database(dbPath)

      Email.emailFromEmailText(helloEmailText, function (err, email) {
        assert.ifError(err)
        helloEmail = email
        return done()
      })
    })
  })

  after(function (done) {
    db.close(function () {
      return done()
    })
  })

  describe("saveEmail()", function () {
    it("should persist an Email object", function (done) {
      db.saveEmail(helloEmail, function (err) {
        assert.ifError(err)
        db.emailFromId(helloEmail.id(), function (err, email) {
          assert.ifError(err)
          assert.strictEqual(email.id(), helloEmail.id())
          assert.deepEqual(email.from(), helloEmail.from())
          return done()
        })
      })
    })

    it("should store thread info", function (done) {
      db.threadFromEmailId(helloEmail.id(), function (err, thread) {
        assert.ifError(err)
        assert.deepEqual(thread.messageIds(), [helloEmail.id()])
        return done()
      })
    })
  })
})
