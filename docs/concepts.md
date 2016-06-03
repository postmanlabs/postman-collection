# Concepts

This is a gentle introduction to the sort of functionality that the SDK provides.

## Collection Hierarchy
At a very high level, Collections are organized in the following way:

                                              +------------+
                   +--------------------------+ Collection +------------------------+
                   |                          +------+-----+                        |
                   |                                 |                              |
                   |                                 |                              |
           +-------v---------+                    +--v---+                    +-----v-----+
           |ItemGroup(Folder)|         +----------+ Item +------------+       |Information|
           +-+-----------+---+         |          +---+--+            |       +-----------+
             |           |             |              |               |
    +--------v--+    +---v--+     +----v----+    +----v------+    +---v----+
    | ItemGroup |    | Item |     | Request |    | Responses |    | Events |
    +-----------+    +------+     +---------+    +-----------+    +--------+


### Collection

A collection can contain a number of `Item`s, `ItemGroup`s and can have a single
information block.

E.g: **A very simple Collection**
```json
{
    "information": {
        "name": "My Collection",
        "version": "v2.0.0",
        "description": "This is a demo collection.",
        "schema": "https://schema.getpostman.com/json/collection/v2.0.0/"
    },
    "item": []
}
```

The "schema" property is required, and must be set to the proper URL as above.
The "item" array contains Folders (ItemGroups) or Items.

### Item
An Item is the basic building block for a collection. It represents an HTTP request,
along with the associated metadata.

E.g: **A simple Item**
```json
{
    "id": "my-first-item",
    "name": "My First Item",
    "description": "This is an Item that contains a single HTTP GET request. It doesn't really do much yet!",
    "request": "http://echo.getpostman.com/get",
    "response": []
}
```

An Item can have multiple saved responses, which are stored in the `response` array. Response is further elaborated below.
While we've defined a very simple request above, it can become really complicated, as you'll soon see!

### ItemGroup (Folder)
An ItemGroup is a simple container for Items. Literally, a Collection is just an ItemGroup with a special
`information` block.

E.g: **An ItemGroup with two Items**
```json
{
    "id": "my-first-itemgroup",
    "name": "First Folder",
    "description": "This ItemGroup (Folder) contains two Items.",
    "item": [
        {
            "id": "1",
            "name": "Item A",
            "request": "http://echo.getpostman.com/get"
        },
        {
            "id": "2",
            "name": "Item B",
            "request": "http://echo.getpostman.com/headers"
        }
    ]
}
```
The `item` array above contains the Items in this ItemGroup.

### Request
A Request represents an HTTP request. Usually, a Request belongs to an Item. Requests can be specified as a string
(check the example above) or as a JSON Object. If specified as a string, it is assumed to be a GET request.

E.g: **A mildly complicated Request**
```json
{
    "description": "This is a sample POST request",
    "url": "https://echo.getpostman.com/post",
    "method": "POST",
    "header": [
        {
            "key": "Content-Type",
            "value": "application/json"
        },
        {
            "key": "Host",
            "value": "echo.getpostman.com"
        }
    ],
    "body": {
        "mode": "urlencoded",
        "urlencoded": [
            {
                "key": "my-body-variable",
                "value": "Something Awesome!"
            }
        ]
    }
}
```
For more on request bodies, check the API documentation: {@link RequestBody}

E.g: **A simple request with Authentication information**
```json
{
    "url": "https://echo.getpostman.com/basic-auth",
    "method": "GET",
    "auth": {
        "type": "basic",
        "basic": {
            "username": "fred",
            "password": "hunter2"
        }
    }
}
```
The SDK supports a number of auth types, refer to the API documentation: {@link RequestAuth}

### Events

The SDK currently supports two events:

1. Test Script: `test`
You can associate a test script with an Item. The test script is usually executed _after_ the actual HTTP request is
sent, and the response is received.

2. Pre-Request Script: `prerequest`
Pre-Request scripts are usually executed _before_ the HTTP request is sent.

E.g: **An Item with Events**
```json
{
    "id": "evented-item",
    "name": "Item with Events",
    "description": "This is an Item that contains `test and `prerequest` events.",
    "request": "http://echo.getpostman.com/get",
    "event": [
        {
            "listen": "prerequest",
            "script": {
                "type": "text/javascript",
                "exec": "console.log('We are in the pre-request script, the request has not run yet!')"
            }
        },
        {
            "listen": "test",
            "script": {
                "type": "text/javascript",
                "exec": "console.log('We are using the test script now, and the request was already sent!')"
            }
        }
    ]
}
```
