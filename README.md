# taskifier

Turn emails sent to a support address into trackable tasks.

## Why is this?

Support ticketing systems tend to be pretty terrible. They email your clients with messages marred with boilerplate and robotic-like ticket ID numbers, creating an impersonal wall between you and your clients. Why not have something that tracks your emails in the background and turns them into tasks when appropriate?

## What is this?

Taskifier is an HTTP server that you run in a secure location like your intranet. You can use, say, `procmail` and `curl` to notify the taskifier server of new messages. You set it up with a task receiver, like [taskifier-asana](https://github.com/desertnet/taskifier-asana), which will take the tasks created by taskifier and put them in the task manager you use.

## Installation

```
npm install taskifier
```

## Configuration

You'll want a task receiver installed as well. How about `taskifier-asana`?

```
npm install taskifier-asana
```

Now set up a `config.json`. It might look something like this:

```json
{
  "port": 8809,
  "addr": "*",
  "inboxes": {
    "support": {
      "database": "./taskifier-support.leveldb",
      "taskReceivers": {
        "taskifier-asana": {
          "apiKey": "foo",
          "workspaceId": 888,
          "projectId": 999
        }
      }
    }
  }
}
```

## Running

Start the server:

```
./node_modules/taskifier/bin/taskifier start --config config.json
```

