"use strict"

var fs = require("fs")
var path = require("path")
var assert = require("assert")

var Email = require("../lib/Email.js")

describe("Email", function () {
  var email
  var helloEmail = fs.readFileSync(path.join(__dirname, "data", "hello.eml"))
  var helloEmailId = "<96A01A9E-582B-42EC-8B56-FC8E3CB57571@limulus.net>"

  beforeEach(function () {
    email = new Email()
  })

  describe("initializeFromEmailText", function () {
    it("should intialize the object with data from a raw text email", function (done) {
      email.initializeFromEmailText(helloEmail, function (err) {
        assert.ifError(err)
        assert.deepEqual(email.from(), {address:"eric@limulus.net",name:"Eric McCarthy"})
        assert.strictEqual(email.id(), helloEmailId)
        return done()
      })
    })
  })
})
