import React from 'react'
import Index from '.'

jest.mock('./app', () => () => <div />)

it('renders without crashing', () => {
  const wrapper = JSON.stringify(Object.assign({}, Index, { _reactInternalInstance: 'censored' }))
  expect(wrapper).toMatchSnapshot()
})
