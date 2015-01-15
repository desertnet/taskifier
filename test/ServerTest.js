"use strict"

var assert = require("assert")
var portfinder = require("portfinder")
var request = require("request")

var Server = require("../lib/Server.js")

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

    it("should return 200 OK", function (done) {
      request(statusUrl, function (err, res) {
        assert.ifError(err)
        assert.strictEqual(res.statusCode, 200)
        return done()
      })
    })
  })
})
