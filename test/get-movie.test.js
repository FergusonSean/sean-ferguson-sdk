const { expect } = require('chai');
const { Client } = require('@seanferguson/the-one-sdk')

const client = new Client({ token: process.env.API_TOKEN })


describe('getMovie', () => {
  it('gets the movie', async () => {
    expect(await client.getMovie('5cd95395de30eff6ebccde56')).to.eql({
      "_id": "5cd95395de30eff6ebccde56",
      "academyAwardNominations": 30,
      "academyAwardWins": 17,
      "boxOfficeRevenueInMillions": 2917,
      "budgetInMillions": 281,
      "name": "The Lord of the Rings Series",
      "rottenTomatoesScore": 94,
      "runtimeInMinutes": 558,
    })
  })
})
