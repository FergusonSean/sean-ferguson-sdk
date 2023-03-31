const { expect } = require('chai');
const { Client, OPS } = require('@seanferguson/the-one-sdk')

const client = new Client({ token: process.env.API_TOKEN })


describe('getMovies', () => {
  context('when using pagination', () => {
    it('returns the list of movies', async () => {
      expect(await client.getMovies()).to.have.lengthOf(8)
    })

    it('returns the pages of movies', async () => {
      const first2 = await client.getMovies({limit: 2})
      const second2 = await client.getMovies({limit: 2, page: 2})
      const second2Offset = await client.getMovies({limit: 2, offset: 2})
      expect(first2).to.have.lengthOf(2)
      expect(second2).to.have.lengthOf(2)
      expect(second2).to.eql(second2Offset)
      second2.forEach(m2 => {
        expect(first2.map(m => m._id)).to.not.include(m2._id)
      })
    })

    it('returns the pages of movies sorted', async () => {
      const first2 = await client.getMovies({limit: 2, sort: 'name:asc'})
      expect(first2.map(m => m._id)).to.eql([
        "5cd95395de30eff6ebccde5a",
        "5cd95395de30eff6ebccde59"
      ])
    })

  })
  context('when using verbose query syntax', () => {
    it('filters the list of movies by exact match', async () => {
      const movies = await client.getMovies({ 
        filters: {
          runtimeInMinutes: {
            op: OPS.MATCH,
            value: 201
          }
        }
      })
      expect(movies.map(m => m._id)).to.eql([
        "5cd95395de30eff6ebccde5d",
      ])
    })

    it('filters the list of movies by not exact match', async () => {
      const movies = await client.getMovies({ 
        filters: {
          runtimeInMinutes: {
            op: OPS.NOT_MATCH,
            value: 201
          }
        }
      })
      expect(movies.length).to.eql(7)
    })

    it('filters the list of movies by include match', async () => {
      const movies = await client.getMovies({ 
        filters: {
          runtimeInMinutes: {
            op: OPS.MATCH,
            value: [201, 178]
          }
        }
      })
      expect(movies.map(m => m._id)).to.have.members([
        '5cd95395de30eff6ebccde5c',
        "5cd95395de30eff6ebccde5d",
      ])
    })

    it('filters the list of movies by not include match', async () => {
      const movies = await client.getMovies({ 
        filters: {
          runtimeInMinutes: {
            op: OPS.NOT_MATCH,
            value: [201, 178]
          }
        }
      })
      expect(movies.map(m => m._id)).to.eql([
        "5cd95395de30eff6ebccde56",
        "5cd95395de30eff6ebccde57",
        "5cd95395de30eff6ebccde58",
        "5cd95395de30eff6ebccde59",
        "5cd95395de30eff6ebccde5a",
        "5cd95395de30eff6ebccde5b"
      ])
    })

    it('filters the list of movies by exists match', async () => {
      const movies = await client.getMovies({ 
        filters: {
          notARealField: {
            op: OPS.EXISTS,
          }
        }
      })
      expect(movies.map(m => m._id)).to.eql([])
    })

    it('filters the list of movies by not exists match', async () => {
      const movies = await client.getMovies({ 
        filters: {
          notARealField: {
            op: OPS.NOT_EXISTS,
          }
        }
      })
      expect(movies.length).to.eql(8)
    })

    it('filters the list of movies by regex match', async () => {
      const movies = await client.getMovies({ 
        filters: {
          name: {
            op: OPS.MATCH,
            value: /King/
          }
        }
      })
      expect(movies.length).to.eql(1)
    })

    it('filters the list of movies by not regex match', async () => {
      const movies = await client.getMovies({ 
        filters: {
          name: {
            op: OPS.NOT_MATCH,
            value: /King/
          }
        }
      })
      expect(movies.length).to.eql(7)
    })

    it('filters the list of movies by less than match', async () => {
      const movies = await client.getMovies({ 
        filters: {
          academyAwardWins: {
            op: OPS.LT,
            value: 11
          }
        }
      })
      expect(movies.length).to.eql(6)
    })

    it('filters the list of movies by less than or equal match', async () => {
      const movies = await client.getMovies({ 
        filters: {
          academyAwardWins: {
            op: OPS.LTE,
            value: 10
          }
        }
      })
      expect(movies.length).to.eql(6)
    })
    it('filters the list of movies by greater than match', async () => {
      const movies = await client.getMovies({ 
        filters: {
          academyAwardWins: {
            op: OPS.GT,
            value: 10
          }
        }
      })
      expect(movies.length).to.eql(2)
    })

    it('filters the list of movies by greater than or equal match', async () => {
      const movies = await client.getMovies({ 
        filters: {
          academyAwardWins: {
            op: OPS.GTE,
            value: 11
          }
        }
      })
      expect(movies.length).to.eql(2)
    })
  })
})
