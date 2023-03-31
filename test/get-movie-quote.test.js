const { expect } = require('chai');
const { Client } = require('@seanferguson/the-one-sdk')

const client = new Client({ token: process.env.API_TOKEN })

describe('getMovieQuotes', () => {
  context('when using pagination', () => {
    it('returns the list of movies', async () => {
      expect(await client.getMovieQuotes('5cd95395de30eff6ebccde5b')).to.have.lengthOf(1000)
    })

    it('returns the pages of movies', async () => {
      const first2 = await client.getMovieQuotes('5cd95395de30eff6ebccde5b', {limit: 2})
      const second2 = await client.getMovieQuotes('5cd95395de30eff6ebccde5b', {limit: 2, page: 2})
      const second2Offset = await client.getMovieQuotes('5cd95395de30eff6ebccde5b', {limit: 2, offset: 2})
      expect(first2).to.have.lengthOf(2)
      expect(second2).to.have.lengthOf(2)
      expect(second2).to.eql(second2Offset)
      second2.forEach(m2 => {
        expect(first2.map(m => m._id)).to.not.include(m2._id)
      })
    })

    it('returns the pages of movies sorted', async () => {
      const first2 = await client.getMovieQuotes('5cd95395de30eff6ebccde5b', {limit: 2, sort: 'dialog:asc'})
      expect(first2.map(m => m._id)).to.eql([
        "5cd96e05de30eff6ebccf00c",
        "5cd96e05de30eff6ebcce9d6"
      ])
    })

  })
})
