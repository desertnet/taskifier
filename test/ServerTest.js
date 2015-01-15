"use strict"

var assert = require("assert")
var portfinder = require("portfinder")
var request = require("request")
var fs = require("fs")
var path = require("path")

var Server = require("../lib/Server.js")

var helloEmailText = testFileData("hello.eml")

describe("Server", function () {
  var server, port, addr, url

  before(function (done) {
    portfinder.getPort(function (err, foundPort) {
      assert.ifError(err)

      port = foundPort
      addr = "127.0.0.1"
      url = "http://" + addr + ":" + port

      server = new Server({
        "port": port,
        "address": addr
      })

      server.start(function (err) {
        assert.ifError(err)
        return done()
      })
    })
  })

  describe("/status", function () {
    var statusUrl

    before(function () {
      statusUrl = url + "/status"
    })

    describe("GET", function () {
      it("should return 200 OK", function (done) {
        request(statusUrl, function (err, res) {
          assert.ifError(err)
          assert.strictEqual(res.statusCode, 200)
          return done()
        })
      })
    })
  })

  describe("/inbox/support/email", function () {
    var inboxEmailUrl, taskGenerator

    before(function () {
      inboxEmailUrl = url + "/inbox/support/email"
    })

    beforeEach(function () {
      taskGenerator = new TaskGeneratorMock()
      server.setTaskGeneratorForInbox("support", taskGenerator)
    })

    describe("POST", function () {
      it("should taskify the email", function (done) {
        var req = {
          "method": "POST",
          "url": inboxEmailUrl,
          "body": helloEmailText
        }
        request(req, function (err, res) {
          assert.ifError(err)
          assert.strictEqual(res.statusCode, 200, res.body)
          taskGenerator.assertTaskifyEmailWasCalledCorrectly()
          return done()
        })
      })
    })
  })
})

function TaskGeneratorMock () {
  this._taskifyEmailCalled = false
}

TaskGeneratorMock.prototype.taskifyEmail = function (email, cb) {
  this._taskifyEmailCalled = true
  assert.strictEqual(email.raw(), helloEmailText.toString())
  return cb(undefined)
}

TaskGeneratorMock.prototype.assertTaskifyEmailWasCalledCorrectly = function () {
  assert.ok(this._taskifyEmailCalled, "taskifyEmail wasn't called")
}

function testFileData (name) {
  return fs.readFileSync(path.join(__dirname, "data", name))
}
