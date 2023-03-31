[![npm version](https://img.shields.io/npm/v/@seanferguson/the-one-sdk.svg?style=flat)](https://www.npmjs.com/package/@seanferguson/the-one-sdk)

# The One SDK

> SDK for accessing LOTR api hosted at https://the-one-api.dev/

## Prerequisites

This project requires NodeJS (version 14 or later) and NPM.
[Node](http://nodejs.org/) and [NPM](https://npmjs.org/) are really easy to install.
To make sure you have them available on your machine,
try running the following command.

```sh
$ npm -v && node -v
7.24.0
v16.10.0
```

## Table of contents

  - [Prerequisites](#prerequisites)
  - [Table of contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [Versioning](#versioning)
  - [Authors](#authors)
  - [License](#license)

## Installation

To install:

```sh
$ npm install --save @seanferguson/the-one-sdk
```

Or if you prefer using Yarn:

```sh
$ yarn add @seanferguson/the-one-sdk
```

## Usage


```js
const { Client } = require('@seanferguson/the-one-sdk')

// initialize client with your personal api token
const client = new Client({ token: process.env.API_TOKEN })

// make requests to the api
const quotes = await client.getMovieQuotes('5cd95395de30eff6ebccde5b')

```

### Retry

If any of your requests recieve a rate limit we will retry 10 times before returning a failure. We insert an exponential backoff in wait times between retries starting with 2 seconds.

### Pagination

Pagination for relevant endpoints is done by passing an options object to the call with any of the pagination fields documented [here.](https://the-one-api.dev/documentation#5) This is entirely optional and if omitted will default to sane values

At the time of this writing the options are:
1. limit - the maximum number of results to return
2. offset - the number of entries to skip
3. page -  a shorthand for setting offset to limit * page

### Sorting

Sorting for relevant endpoints is done by passing an options object to the call with the sort option specified [here.](https://the-one-api.dev/documentation#5) This is entirely optional.

### Filters

Filtering for relevant endpoints is done by passing an options object to the call with the filters option specified. The filters object is of the following format:

```js
{
  fieldYouWouldLikeToFilterOn: {
    op: OPS.MATCH, // or other operators as desired
    value: 'the value I was looking for',
  }
}
```

See a below list of potential operators and the corresponding valid values

#### Operators

##### MATCH

```js
{
  fieldYouWouldLikeToFilterOn: {
    op: OPS.MATCH,
    value: 'the value I was looking for',
  }
}
```

We also allow this shorthand for specifying a MATCH filter which is treated identically to the above:

```js
{
  fieldYouWouldLikeToFilterOn: 'the value I was looking for'
}
```

The MATCH operator accepts a primitive type, an array, or a RegExp as it's value. If the value is a primitive type it checks for records matching the value exactly. If the value is an array it checks for an exact match with any of the values in the array. If the value is a RegExp object it will check for objects whose values match that regular expression. 

Using RegExp in a match has undefined behavior if the field being filtered on is not a string field.

##### NOT\_MATCH

```js
{
  fieldYouWouldLikeToFilterOn: {
    op: OPS.NOT_MATCH,
    value: 'the value I was looking for',
  }
}
```

The NOT\_MATCH operator is a reversed version of the match operator. See Above for details. Note that no shorthand for this operator exists.

##### EXISTS

```js
{
  fieldYouWouldLikeToFilterOn: {
    op: OPS.EXISTS,
  }
}
```

We also allow this shorthand for specifying an EXISTS filter which is treated identically to the above:

```js
{
  fieldYouWouldLikeToFilterOn: true
}
```


the EXISTS operator checks for the existence of the field in question. It does not require a value and if one is provided it will be ignored.

##### NOT\_EXISTS

```js
{
  fieldYouWouldLikeToFilterOn: {
    op: OPS.NOT_EXISTS,
  }
}
```

We also allow this shorthand for specifying a NOT\_EXISTS filter which is treated identically to the above:

```js
{
  fieldYouWouldLikeToFilterOn: false
}
```

The NOT\_EXISTS operator checks for the non-existence of the field in question. It does not require a value and if one is provided it will be ignored.

##### GT

```js
{
  fieldYouWouldLikeToFilterOn: {
    op: OPS.GT,
    value: 7,
  }
}
```

The GT operator checks for records with a field greater than the value provided. the value provided must be of the same type as the field.

##### GTE

```js
{
  fieldYouWouldLikeToFilterOn: {
    op: OPS.GTE,
    value: 7,
  }
}
```

The GTE operator checks for records with a field greater than or equal to the value provided. the value provided must be of the same type as the field.

##### LT

```js
{
  fieldYouWouldLikeToFilterOn: {
    op: OPS.LT,
    value: 7,
  }
}
```

The LT operator checks for records with a field less than the value provided. the value provided must be of the same type as the field.

##### LTE

```js
{
  fieldYouWouldLikeToFilterOn: {
    op: OPS.LTE,
    value: 7,
  }
}
```

The LTE operator checks for records with a field less than or equal to the value provided. the value provided must be of the same type as the field.

### Available calls

#### getMovieQuotes

```js
const { Client } = require('@seanferguson/the-one-sdk')

const client = new Client({ token: process.env.API_TOKEN })

const quotes = await client.getMovieQuotes('5cd95395de30eff6ebccde5b', {
  sort: 'dialog:asc',
  limit: 1000,
  page: 1,
  offset: 3,
})
```


#### getMovie

```js
const { Client } = require('@seanferguson/the-one-sdk')

const client = new Client({ token: process.env.API_TOKEN })

const movie = await client.getMovie('5cd95395de30eff6ebccde5b')
```
#### getMovies

```js
const { Client, OPS } = require('@seanferguson/the-one-sdk')

const client = new Client({ token: process.env.API_TOKEN })

const quotes = await client.getMovieQuotes('5cd95395de30eff6ebccde5b', {
  sort: 'dialog:asc',
  limit: 1000,
  page: 1,
  offset: 3,
  filters: {
    academyAwardWins: {
      op: OPS.GTE,
      value: 11
    },
    otherFieldToFilterOn: {
      op: OPS.MATCH,
      value: 'exactValueYouAreLookingFor'
    }
  }
})
```



For more usage examples check out the tests :)

## Potential Future Improvements

1. Add simple way to insert test stub to enable easily mocking the package in tests

  Could be fairly easily handled in client by abstracting the creation of the client instance.

```js
//in customer code
let client = new Client({ token: process.env.API_TOKEN })

const stubClient = (stub) => {
  client = stub
}

const getClient = () => client

```

Downside of this approach is callint getClient everywhere is less ergonomic than just importing a client.

2. Allow configuration of retry behavior

  Would we want this on a per call basis or a per client basis? Per call allows for maximum of flexibility. If a call is in my job system I might be willing to retry for a lot longer than if it's embedded in an http request handler. You could just create multiple client's for this since a client costs basically no overhead. Per client has the benefit of being able to set sane defaults and then never worry about them again. I suppose Ideally we'd want both, but more practically I'd prioritize per client handling since creating lots of clients doesn't hurt.



## Contributing

1.  Fork it!
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Add your changes: `git add .`
4.  Commit your changes: `git commit -am 'Add some feature'`
5.  Push to the branch: `git push origin my-new-feature`
6.  Submit a pull request :sunglasses:

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

* **Sean Ferguson** - *Initial work* - [Sean Ferguson](https://github.com/FergusonSean)

## License

[MIT License](https://andreasonny.mit-license.org/2019) © Sean Ferguson
