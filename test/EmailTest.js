"use strict"

var fs = require("fs")
var path = require("path")
var assert = require("assert")

var Email = require("../lib/Email.js")

describe("Email", function () {
  var email
  var helloEmail = fs.readFileSync(path.join(__dirname, "data", "hello.eml"))
  var helloEmailId = "<96A01A9E-582B-42EC-8B56-FC8E3CB57571@limulus.net>"
  var headerlessEmail = fs.readFileSync(path.join(__dirname, "data", "headerless.txt"))

  beforeEach(function () {
    email = new Email()
  })

  describe("initializeFromEmailText()", function () {
    it("should intialize the object with data from a raw text email", function (done) {
      email.initializeFromEmailText(helloEmail, function (err) {
        assert.ifError(err)
        assert.deepEqual(email.from(), {address:"eric@limulus.net",name:"Eric McCarthy"})
        assert.strictEqual(email.id(), helloEmailId)
        return done()
      })
    })

    it("should report an error when given bad data", function (done) {
      email.initializeFromEmailText(headerlessEmail, function (err) {
        assert.ok(err)
        return done()
      })
    })
  })

  describe("toJSON()", function () {
    beforeEach(function (done) {
      email.initializeFromEmailText(helloEmail, function (err) {
        assert.ifError(err)
        return done()
      })
    })

    it("should return the JSON data for the email", function () {
      var data = email.toJSON()
      assert.strictEqual(data.id, helloEmailId)
    })
  })
})
