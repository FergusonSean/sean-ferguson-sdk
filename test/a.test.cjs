const { expect } = require('chai');
const { nothing } = require('@sdf/the-one-sdk')


describe('cjs server', () => {
  it('nothing', () => expect(nothing()).to.not.exist)
})
