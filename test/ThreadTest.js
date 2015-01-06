"use strict"

var assert = require("assert")

var Thread = require("../lib/Thread.js")

describe("Thread", function () {
  var thread

  beforeEach(function () {
    thread = new Thread()
  })

  describe("messageIds()", function () {
    it("should return an array of lowercased message IDs", function () {
      thread.addMessageId("<FOO@example.com>")
      thread.addMessageId("<bar@example.com>")
      assert.deepEqual(thread.messageIds(), [
        "<foo@example.com>",
        "<bar@example.com>"
      ])
    })
  })
})
