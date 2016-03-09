jest.dontMock('../../../../tests/_fixtures/networking/networking-node-memberships.json');

var _ = require('underscore');

import PluginTestUtils from 'PluginTestUtils';

let SDK = PluginTestUtils.getSDK('networking', {enabled: true});

require('../../SDK').setSDK(SDK);

let {RequestUtil, Config} = SDK.get(['RequestUtil', 'Config']);

var ActionTypes = require('../../constants/ActionTypes');
var EventTypes = require('../../constants/EventTypes');
var NetworkingNodeMembershipsStore = require('../NetworkingNodeMembershipsStore');
var nodeMembershipsFixture = require('../../../../tests/_fixtures/networking/networking-node-memberships.json');
var NetworkingReducer = require('../../Reducer');

PluginTestUtils.addReducer('networking', NetworkingReducer);

describe('NetworkingNodeMembershipsStore', function () {

  beforeEach(function () {
    this.requestFn = RequestUtil.json;
    RequestUtil.json = function (handlers) {
      handlers.success(nodeMembershipsFixture);
    };
    this.nodeMemberships = _.clone(nodeMembershipsFixture);
  });

  afterEach(function () {
    RequestUtil.json = this.requestFn;
  });

  it('should return all of the node memberships it was given', function () {
    this.useFixtures = Config.useFixtures;
    Config.useFixtures = true;

    NetworkingNodeMembershipsStore.fetchNodeMemberships();
    var nodeMemberships = NetworkingNodeMembershipsStore.get('nodeMemberships');

    expect(nodeMemberships.length).toEqual(this.nodeMemberships.array.length);

    Config.useFixtures = this.useFixtures;
  });

  describe('processNodeMemberships', function () {

    it('stores node memberships when event is dispatched', function () {
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_NODE_MEMBERSHIPS_SUCCESS,
        data: [{foo: 'bar', baz: 'qux', quux: 'grault'}]
      });

      var nodeMemberships = NetworkingNodeMembershipsStore
        .get('nodeMemberships');

      expect(nodeMemberships[0]).toEqual(
        {foo: 'bar', baz: 'qux', quux: 'grault'}
      );
    });

    it('dispatches the correct event upon VIP request success', function () {
      var mockedFn = jest.genMockFunction();
      NetworkingNodeMembershipsStore.addChangeListener(
        EventTypes.NETWORKING_NODE_MEMBERSHIP_CHANGE,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_NODE_MEMBERSHIPS_SUCCESS,
        data: [{foo: 'bar', baz: 'qux', quux: 'grault'}]
      });

      expect(mockedFn.mock.calls.length).toEqual(1);
    });

  });

  describe('processNodeMembershipsError', function () {

    it('dispatches the correct event upon VIP request error', function () {
      var mockedFn = jasmine.createSpy();
      NetworkingNodeMembershipsStore.addChangeListener(
        EventTypes.NETWORKING_NODE_MEMBERSHIP_REQUEST_ERROR,
        mockedFn
      );
      SDK.dispatch({
        type: ActionTypes.REQUEST_NETWORKING_NODE_MEMBERSHIPS_ERROR,
        data: 'foo'
      });

      expect(mockedFn.calls.length).toEqual(1);
      expect(mockedFn.calls[0].args).toEqual(['foo']);
    });

  });

});
