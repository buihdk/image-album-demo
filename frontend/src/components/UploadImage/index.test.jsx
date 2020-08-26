import React from 'react';
import { shallow } from 'enzyme';

import UploadImage from '.';

describe('UploadImage', () => {
  const wrapper = shallow(<UploadImage />);

  test('renders without crashing', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
