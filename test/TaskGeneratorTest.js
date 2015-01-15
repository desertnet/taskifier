"use strict"

var assert = require("assert")
var temp = require("temp").track()
var path = require("path")
var fs = require("fs")

var Email = require("../lib/Email.js")
var Database = require("../lib/Database.js")
var Task = require("../lib/Task.js")
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
        receiver.assertNewTaskWasCalledCorrectly()
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
  this._theNewTask = null
  this._newTaskCallback = null
}

MockTaskReceiver.prototype.newTask = function (task, cb) {
  this._newTaskWasCalled = true
  this._theNewTask = task
  this._newTaskCallback = cb
}

MockTaskReceiver.prototype.assertNewTaskWasCalledCorrectly = function () {
  assert.ok(this._newTaskWasCalled, "newTask wasn't called")
  assert.ok(this._theNewTask instanceof Task, "newTask wasn't called with Task obj")
  assert.ok(this._newTaskCallback instanceof Function, "newTask was called with a callback")
}
