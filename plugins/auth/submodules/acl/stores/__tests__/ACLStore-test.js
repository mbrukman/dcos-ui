jest.dontMock('../ACLStore');
jest.dontMock('../../actions/ACLActions');
jest.dontMock('../../../../../../src/js/mixins/GetSetMixin');
jest.dontMock('../../../../../../tests/_fixtures/acl/acls-unicode.json');

var _ = require('underscore');

var ACLList = require('../../../../../../src/js/structs/ACLList');
var ACLStore = require('../ACLStore');
import {
  REQUEST_ACL_RESOURCE_ACLS_SUCCESS,
  REQUEST_ACL_RESOURCE_ACLS_ERROR,
  REQUEST_ACL_CREATE_ERROR,
  REQUEST_ACL_USER_GRANT_ACTION_SUCCESS,
  REQUEST_ACL_USER_GRANT_ACTION_ERROR,
  REQUEST_ACL_USER_REVOKE_ACTION_SUCCESS,
  REQUEST_ACL_USER_REVOKE_ACTION_ERROR,
  REQUEST_ACL_GROUP_GRANT_ACTION_SUCCESS,
  REQUEST_ACL_GROUP_GRANT_ACTION_ERROR,
  REQUEST_ACL_GROUP_REVOKE_ACTION_SUCCESS,
  REQUEST_ACL_GROUP_REVOKE_ACTION_ERROR
} from '../../constants/ActionTypes';

var AppDispatcher = require('../../../../../../src/js/events/AppDispatcher');

import {
  ACL_RESOURCE_ACLS_CHANGE,
  ACL_RESOURCE_ACLS_ERROR,
  ACL_USER_GRANT_ACTION_CHANGE,
  ACL_USER_GRANT_ACTION_ERROR,
  ACL_USER_REVOKE_ACTION_CHANGE,
  ACL_USER_REVOKE_ACTION_ERROR,
  ACL_GROUP_GRANT_ACTION_CHANGE,
  ACL_GROUP_GRANT_ACTION_ERROR,
  ACL_GROUP_REVOKE_ACTION_CHANGE,
  ACL_GROUP_REVOKE_ACTION_ERROR
} from '../../constants/EventTypes';

var RequestUtil = require('../../../../../../src/js/utils/RequestUtil');

var aclsFixture = require('../../../../../../tests/_fixtures/acl/acls-unicode.json');

describe('ACLStore', function () {

  describe('#fetchACLsForResource', function () {

    beforeEach(function () {
      this.requestFn = RequestUtil.json;
      RequestUtil.json = function (handlers) {
        handlers.success(aclsFixture);
      };
      this.aclsFixture = _.clone(aclsFixture);
    });

    afterEach(function () {
      RequestUtil.json = this.requestFn;
    });

    it('should return an instance of ACLList', function () {
      ACLStore.fetchACLsForResource('service');
      var services = ACLStore.get('services');
      expect(services instanceof ACLList).toBeTruthy();
    });

    it('should return all of the services it was given', function () {
      ACLStore.fetchACLsForResource('service');
      var services = ACLStore.get('services').getItems();
      expect(services.length).toEqual(this.aclsFixture.array.length);
    });

  });

  describe('dispatcher', function () {

    describe('ACLs', function () {

      it('stores services when event is dispatched', function () {
        AppDispatcher.handleServerAction({
          type: REQUEST_ACL_RESOURCE_ACLS_SUCCESS,
          data: [{rid: 'foo', bar: 'baz'}],
          resourceType: 'service'
        });

        var services = ACLStore.get('services').getItems();
        expect(services[0].get('rid')).toEqual('foo');
        expect(services[0].get('bar')).toEqual('baz');
      });

      it('dispatches the correct event upon success', function () {
        var mockedFn = jest.genMockFunction();
        ACLStore.addChangeListener(
          ACL_RESOURCE_ACLS_CHANGE,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_ACL_RESOURCE_ACLS_SUCCESS,
          data: [{rid: 'foo', bar: 'baz'}],
          resourceType: 'service'
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

      it('dispatches the correct event upon error', function () {
        var mockedFn = jest.genMockFunction();
        ACLStore.addChangeListener(
          ACL_RESOURCE_ACLS_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_ACL_RESOURCE_ACLS_ERROR,
          data: 'foo',
          resourceType: 'service'
        });

        expect(mockedFn.mock.calls.length).toEqual(1);
      });

    });

    describe('Grant Safe User action', function () {

      ACLStore.createACLForResource = jest.genMockFunction();
      const mockData = {
        ID: 'myname',
        action: 'access',
        resourceID: 'crazyname'
      };
      const ID = 'service.' + mockData.resourceID;

      beforeEach(function () {
        ACLStore.set({'outstandingGrants': {}});
      });

      it('first creates ACL for resource if nonexistent', function () {
        ACLStore.grantUserActionToResource(
          mockData.ID,
          mockData.action,
          ID);

        expect(ACLStore.createACLForResource)
          .toBeCalledWith(ID, {
            description: mockData.resourceID + ' service'
          });
      });

      it('adds grant request to callback list while creating ACL', function () {
        ACLStore.grantUserActionToResource(
          mockData.ID,
          mockData.action,
          ID);

        expect(typeof ACLStore.get('outstandingGrants')[ID][0] == 'function')
          .toBeTruthy();
      });

      it('executes multiple waiting grant requests upon ACL creation',
        function () {
          var mockedFn = jest.genMockFunction();
          var mockedFn2 = jest.genMockFunction();

          ACLStore.addOutstandingGrantRequest('service.foo', mockedFn);
          ACLStore.addOutstandingGrantRequest('service.foo', mockedFn2);

          AppDispatcher.handleServerAction({
            type: REQUEST_ACL_RESOURCE_ACLS_SUCCESS,
            data: [
              {rid: 'service.foo', bar: 'baz'},
              {rid: 'service.baz', bar: 'foo'}
            ],
            resourceType: 'service'
          });

          expect(mockedFn.mock.calls.length === 1
            && mockedFn2.mock.calls.length === 1)
            .toBeTruthy();
        });

      it('only executes outstanding grant requests related to new ACL',
        function () {
          var mockedFn = jest.genMockFunction();
          var mockedFn2 = jest.genMockFunction();

          ACLStore.addOutstandingGrantRequest('service.foo', mockedFn);
          ACLStore.addOutstandingGrantRequest('service.baz', mockedFn2);

          AppDispatcher.handleServerAction({
            type: REQUEST_ACL_RESOURCE_ACLS_SUCCESS,
            data: [
              {rid: 'service.foo', bar: 'baz'}
            ],
            resourceType: 'service'
          });

          expect(mockedFn.mock.calls.length === 1
            && mockedFn2.mock.calls.length === 0)
            .toBeTruthy();
        });

      it('removes outstanding grant requests when ACL creation fails',
        function () {
          var mockedFn = jest.genMockFunction();
          var mockedFn2 = jest.genMockFunction();

          ACLStore.addOutstandingGrantRequest('service.foo', mockedFn);
          ACLStore.addOutstandingGrantRequest('service.baz', mockedFn2);

          AppDispatcher.handleServerAction({
            type: REQUEST_ACL_CREATE_ERROR,
            resourceID: 'service.foo'
          });
          let outstandingGrants = ACLStore.get('outstandingGrants');
          expect('service.foo' in outstandingGrants).toBeFalsy();
          expect(outstandingGrants['service.baz'].length).toEqual(1);
        });

    });

    describe('Grant User action', function () {

      it('dispatches the correct event upon success', function () {
        var mockedFn = jest.genMockFunction();
        ACLStore.addChangeListener(
          ACL_USER_GRANT_ACTION_CHANGE,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_ACL_USER_GRANT_ACTION_SUCCESS,
          triple: {userID: 'foo', action: 'access', resourceID: 'marathon'}
        });

        expect(mockedFn.mock.calls[0][0])
          .toEqual({userID: 'foo', action: 'access', resourceID: 'marathon'});
      });

      it('dispatches the correct event upon error', function () {
        var mockedFn = jest.genMockFunction();
        ACLStore.addChangeListener(
          ACL_USER_GRANT_ACTION_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_ACL_USER_GRANT_ACTION_ERROR,
          data: 'bar',
          triple: {userID: 'foo', action: 'access', resourceID: 'marathon'}
        });

        expect(mockedFn.mock.calls[0]).toEqual([
          'bar',
          {userID: 'foo', action: 'access', resourceID: 'marathon'}
        ]);
      });

    });

    describe('Revoke User action', function () {

      it('dispatches the correct event upon success', function () {
        var mockedFn = jest.genMockFunction();
        ACLStore.addChangeListener(
          ACL_USER_REVOKE_ACTION_CHANGE,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_ACL_USER_REVOKE_ACTION_SUCCESS,
          triple: {userID: 'foo', action: 'access', resourceID: 'marathon'}
        });

        expect(mockedFn.mock.calls[0][0])
          .toEqual({userID: 'foo', action: 'access', resourceID: 'marathon'});
      });

      it('dispatches the correct event upon error', function () {
        var mockedFn = jest.genMockFunction();
        ACLStore.addChangeListener(
          ACL_USER_REVOKE_ACTION_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_ACL_USER_REVOKE_ACTION_ERROR,
          data: 'bar',
          triple: {userID: 'foo', action: 'access', resourceID: 'marathon'}
        });

        expect(mockedFn.mock.calls[0]).toEqual([
          'bar',
          {userID: 'foo', action: 'access', resourceID: 'marathon'}
        ]);
      });

    });

    describe('Grant Group action', function () {

      it('dispatches the correct event upon success', function () {
        var mockedFn = jest.genMockFunction();
        ACLStore.addChangeListener(
          ACL_GROUP_GRANT_ACTION_CHANGE,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_ACL_GROUP_GRANT_ACTION_SUCCESS,
          triple: {groupID: 'foo', action: 'access', resourceID: 'marathon'}
        });

        expect(mockedFn.mock.calls[0][0])
          .toEqual({groupID: 'foo', action: 'access', resourceID: 'marathon'});
      });

      it('dispatches the correct event upon error', function () {
        var mockedFn = jest.genMockFunction();
        ACLStore.addChangeListener(
          ACL_GROUP_GRANT_ACTION_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_ACL_GROUP_GRANT_ACTION_ERROR,
          data: 'bar',
          triple: {groupID: 'foo', action: 'access', resourceID: 'marathon'}
        });

        expect(mockedFn.mock.calls[0]).toEqual([
          'bar',
          {groupID: 'foo', action: 'access', resourceID: 'marathon'}
        ]);
      });

    });

    describe('Revoke Group action', function () {

      it('dispatches the correct event upon success', function () {
        var mockedFn = jest.genMockFunction();
        ACLStore.addChangeListener(
          ACL_GROUP_REVOKE_ACTION_CHANGE,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_ACL_GROUP_REVOKE_ACTION_SUCCESS,
          triple: {groupID: 'foo', action: 'access', resourceID: 'marathon'}
        });

        expect(mockedFn.mock.calls[0][0])
          .toEqual({groupID: 'foo', action: 'access', resourceID: 'marathon'});
      });

      it('dispatches the correct event upon error', function () {
        var mockedFn = jest.genMockFunction();
        ACLStore.addChangeListener(
          ACL_GROUP_REVOKE_ACTION_ERROR,
          mockedFn
        );
        AppDispatcher.handleServerAction({
          type: REQUEST_ACL_GROUP_REVOKE_ACTION_ERROR,
          data: 'bar',
          triple: {groupID: 'foo', action: 'access', resourceID: 'marathon'}
        });

        expect(mockedFn.mock.calls[0]).toEqual([
          'bar',
          {groupID: 'foo', action: 'access', resourceID: 'marathon'}
        ]);
      });

    });

  });

});