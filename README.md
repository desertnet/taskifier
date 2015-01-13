# taskifier

Transparently turn emails sent to a support address into trackable tasks.

## API

Note: attempting some README-Driven-Development here. This isn't actually implemented yet.

```javascript
var taskifier = require("taskifier")

taskifier.setLevelDBStoreFile("/path/to/leveldb/file")

var email = new taskifier.Email(emailHeaderAndBody)
email.save(function (err) {…})

var organizer = new taskifier.EmailOrganizer()
organizer.processEmail(email, function (err) {…})
```
