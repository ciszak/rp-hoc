import test from 'ava';
import '../helpers/setup-test-env';
import React, { Component } from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Toggle from 'react-toggled';
import sinon from 'sinon';
import { withRP } from '../../src';

configure({ adapter: new Adapter() });

const check = (t, wrapper) => {
  t.is(wrapper.find('#result').text(), 'Toggled On');
  wrapper.find('button').simulate('click');
  t.is(wrapper.find('#result').text(), 'Toggled Off');
  wrapper.find('button').simulate('click');
  t.is(wrapper.find('#result').text(), 'Toggled On');
};

test('original Render Props works', t => {
  const App = () => (
    <Toggle defaultOn>
      {({ on, getTogglerProps }) => (
        <div>
          <button {...getTogglerProps()}>Toggle me</button>
          <div id="result">{on ? 'Toggled On' : 'Toggled Off'}</div>
        </div>
      )}
    </Toggle>
  );
  check(t, mount(<App />));
});

test('convert Render Props to HOC', t => {
  const WithToggle = withRP(Toggle, { defaultOn: true });
  @WithToggle
  class App extends Component {
    render() {
      const { on, getTogglerProps } = this.props;
      return (
        <div>
          <button {...getTogglerProps()}>Toggle me</button>
          <div id="result">{on ? 'Toggled On' : 'Toggled Off'}</div>
        </div>
      );
    }
  }
  check(t, mount(<App />));
});

test('use with stateless component', t => {
  const App = ({ on, getTogglerProps }) => (
    <div>
      <button {...getTogglerProps()}>Toggle me</button>
      <div id="result">{on ? 'Toggled On' : 'Toggled Off'}</div>
    </div>
  );
  const WithToggle = withRP(Toggle, { defaultOn: true });
  const AppWithToggle = WithToggle(App);
  check(t, mount(<AppWithToggle />));
});

test('convert Render Props to HOC with warning', t => {
  sinon.stub(console, 'error');

  const WithToggle = withRP(<Toggle defaultOn />);
  @WithToggle
  class App extends Component {
    render() {
      const { on, getTogglerProps } = this.props;
      return (
        <div>
          <button {...getTogglerProps()}>Toggle me</button>
          <div id="result">{on ? 'Toggled On' : 'Toggled Off'}</div>
        </div>
      );
    }
  }
  check(t, mount(<App />));

  /* eslint-disable no-console */
  t.true(console.error.calledOnce);
  t.true(console.error.calledWithMatch(e => e.toString().indexOf('The prop `children` is marked as required') !== -1));
  console.error.restore();
  /* eslint-enable no-console */
});
