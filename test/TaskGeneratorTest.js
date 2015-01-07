"use strict"

var assert = require("assert")
var temp = require("temp").track()
var path = require("path")
var fs = require("fs")

var Email = require("../lib/Email.js")
var Database = require("../lib/Database.js")
var TaskGenerator = require("../lib/TaskGenerator.js")

describe("TaskGenerator", function () {
  var generator, db, helloEmail, receiver
  var helloEmailText = fs.readFileSync(path.join(__dirname, "data", "hello.eml"))

  before(function(done) {
    temp.mkdir("email-to-task-task-gen-testing", function (err, tmpdirPath) {
      assert.ifError(err)
      var dbPath = path.join(tmpdirPath, "main-test-db.leveldb")
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

  beforeEach(function () {
    generator = new TaskGenerator(db)
    receiver = new MockTaskReceiver()
    generator.addTaskReceiver(receiver)
  })

  describe("taskifyEmail()", function () {
    it("should call newTask on the receiver object", function (done) {
      generator.taskifyEmail(helloEmail, function (err) {
        assert.ifError(err)
        assert.ok(receiver.__newTaskWasCalled(), "new task not called on receiver")
        return done()
      })
    })

    it("should have saved the email to the database", function (done) {
      db.emailFromId(helloEmail.id(), function (err, email) {
        assert.ifError(err)
        assert.strictEqual(email.id(), helloEmail.id())
        return done()
      })
    })
  })
})

function MockTaskReceiver () {
  this._newTaskWasCalled = false
}

MockTaskReceiver.prototype.newTask = function () {
  this._newTaskWasCalled = true
}

MockTaskReceiver.prototype.__newTaskWasCalled = function () {
  return this._newTaskWasCalled
}
