"use strict"

var assert = require("assert")
var temp = require("temp").track()
var path = require("path")

var Database = require("../lib/Database.js")
var EmailImporter = require("../lib/EmailImporter.js")

describe("EmailImporter", function () {
  var importer, db
  var mboxPath = path.join(__dirname, "data", "small.mbox")

  var firstMsgId = "<847cc7ba-ee9f-478a-8119-86703612a90a@limulus.net>"
  var secondMsgId = "<706618bf-6e56-47ba-86c6-cf9b63319335@limulus.net>"
  var thirdMsgId = "<5bb71e13-c691-4449-9cd5-06c13984c31c@limulus.net>"

  before(function (done) {
    temp.mkdir("email-to-task-importer-testing", function (err, tmpDirPath) {
      assert.ifError(err)
      var dbPath = path.join(tmpDirPath, "main-test-db.leveldb")
      db = new Database(dbPath)
      importer = new EmailImporter(db)
      return done()
    })
  })

  after(function (done) {
    db.close(function () {
      return done()
    })
  })

  describe("importMboxFile()", function () {
    it("should import emails from the specified mbox file", function (done) {
      importer.importMboxFile(mboxPath, function (err) {
        assert.ifError(err)
        db.emailFromId(firstMsgId, function (err, email) {
          assert.ifError(err)
          assert.strictEqual(email.id(), firstMsgId)
          db.emailFromId(secondMsgId, function (err, email) {
            assert.ifError(err)
            assert.strictEqual(email.id(), secondMsgId)
            db.emailFromId(thirdMsgId, function (err, email) {
              assert.ifError(err)
              assert.strictEqual(email.id(), thirdMsgId)
              return done()
            })
          })
        })
      })
    })
  })
})
