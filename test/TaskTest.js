"use strict"

var assert = require("assert")
var fs = require("fs")
var path = require("path")

var Task = require("../lib/Task.js")
var Email = require("../lib/Email.js")

describe("Task", function () {
  var task, helloEmail
  var helloEmailText = testFileData("hello.eml")

  describe("taskFromEmail()", function () {
    beforeEach(function (done) {
      helloEmail = Email.emailFromEmailText(helloEmailText, function (err, email) {
        assert.ifError(err)
        helloEmail = email
        return done()
      })
    })

    it("should return a Task object with a name from the subject", function () {
      task = Task.taskFromEmail(helloEmail)
      assert.strictEqual(task.name(), helloEmail.subject())
      return
    })

    it("should return a Task object with a description that contains sender", function () {
      task = Task.taskFromEmail(helloEmail)
      assert.ok(
        task.description().match(/\bEric McCarthy\b/),
        "description doesn't contain 'Eric McCarthy'"
      )
      return
    })

    it("should return a Task object with a description that contains the body", function () {
      task = Task.taskFromEmail(helloEmail)
      assert.ok(
        task.description().match(/Hello there!/),
        "description doesn't contain 'Hello there!'"
      )
      return
    })
  })
})

function testFileData (name) {
  return fs.readFileSync(path.join(__dirname, "data", name))
}
