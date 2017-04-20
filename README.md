# Postman Collection SDK

[![Build Status](https://travis-ci.org/postmanlabs/postman-collection.svg?branch=master)](https://travis-ci.org/postmanlabs/postman-collection)
[![Dependency Status](https://david-dm.org/postmanlabs/postman-collection.svg)](https://david-dm.org/postmanlabs/postman-collection)
[![devDependency Status](https://david-dm.org/postmanlabs/postman-collection/dev-status.svg)](https://david-dm.org/postmanlabs/postman-collection#info=devDependencies)

Postman Collection SDK is a NodeJS module that allows a developer to work with Postman Collections. Using this module a
developer can create collections, manipulate them and then export them in a format that the Postman Apps and Postman CLI
Runtimes (such as [Newman](https://github.com/postmanlabs/newman)) can consume.

A collection lets you group individual requests together. These requests can be further organized into folders to 
accurately mirror your API. Requests can also store sample responses when saved in a collection. You can add metadata 
like name and description too so that all the information that a developer needs to use your API is available easily.

To know more about Postman Collections, visit the 
[collection documentation section on Postman Website](https://www.getpostman.com/docs/collections).

> The new [Collection Format v2](http://blog.getpostman.com/2015/06/05/travelogue-of-postman-collection-format-v2/) 
> builds a stronger foundation for improving your productivity while working with APIs. We want your feedback and iron 
> out issues before this goes into the Postman Apps.

## Installing the SDK

Postman Collection SDK can be installed using NPM or directly from the git repository within your NodeJS projects. If
installing from NPM, the following command installs the SDK and saves in your `package.json`

```terminal
> npm install postman-collection --save
```


## Getting Started

In this example snippet we will get started by loading a collection from a file and output the same in console.

```javascript
var fs = require('fs'), // needed to read JSON file from disk
	Collection = require('postman-collection').Collection,
	myCollection;

// Load a collection to memory from a JSON file on disk (say, sample-collection.json)
myCollection = new Collection(JSON.parse(fs.readFileSync('sample-collection.json').toString()));

// log items at root level of the collection
console.log(myCollection.toJSON());
```

After loading the collection from file, one can do a lot more using the functions that are available in the SDK. To know
more about these functions, head over to
[Collection SDK Docs](http://www.postmanlabs.com/postman-collection).
