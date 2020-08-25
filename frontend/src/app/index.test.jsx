import React from 'react';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';

import App from '.';

describe('App', () => {
  const wrapper = shallow(<App />);

  test('renders without crashing', () => {
    expect(toJSON(wrapper)).toMatchSnapshot();
  });
});
