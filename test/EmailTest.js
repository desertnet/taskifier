"use strict"

var fs = require("fs")
var path = require("path")
var assert = require("assert")

var Email = require("../lib/Email.js")

describe("Email", function () {
  var email
  var helloEmail = testFileData("hello.eml")
  var helloEmailId = "<96A01A9E-582B-42EC-8B56-FC8E3CB57571@limulus.net>".toLowerCase()
  var headerlessEmail = testFileData("headerless.txt")
  var justReplyToEmail = testFileData("just-reply-to.eml")

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

  describe("references()", function () {
    it("should return an array of message ids from the References header", function (done) {
      email.initializeFromEmailText(helloEmail, function (err, email) {
        assert.ifError(err)
        assert.deepEqual(email.references(), [
          "<86A01A9E-582B-42EC-8B56-FC8E3CB57571@limulus.net>".toLowerCase(),
          "<76A01A9E-582B-42EC-8B56-FC8E3CB57571@limulus.net>".toLowerCase()
        ])
        return done()
      })
    })

    it("should include value from In-Reply-To header if no References header", function (done) {
      email.initializeFromEmailText(justReplyToEmail, function (err) {
        assert.ifError(err)
        assert.deepEqual(email.references(), [
          "<76A01A9E-582B-42EC-8B56-FC8E3CB57571@limulus.net>".toLowerCase()
        ])
        return done()
      })
    })
  })

  describe("subject()", function () {
    it("should return the value of the Subject header", function (done) {
      email.initializeFromEmailText(helloEmail, function (err, email) {
        assert.ifError(err)
        assert.strictEqual(email.subject(), "A Test Message :)")
        return done()
      })
    })
  })

  describe("body()", function () {
    it("should return a string represenation of the email body", function (done) {
      email.initializeFromEmailText(helloEmail, function (err, email) {
        assert.ifError(err)
        assert.strictEqual(email.body(), "Hello there!")
        return done()
      })
    })
  })
})

function testFileData (name) {
  return fs.readFileSync(path.join(__dirname, "data", name))
}
