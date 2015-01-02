# email-to-task

Transparently turn emails sent to a support address into trackable tasks.

## API

Note: attempting some README-Driven-Development here. This isn't actually implemented yet.

```javascript
var emailToTask = require("email-to-task")

emailToTask.setLevelDBStoreFile("/path/to/leveldb/file")

var email = new emailToTask.Email(emailHeaderAndBody)
email.save(function (err) {…})

var organizer = new emailToTask.EmailOrganizer()
organizer.processEmail(email, function (err) {…})
```
