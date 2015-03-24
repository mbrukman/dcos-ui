var _ = require("underscore");
var EventEmitter = require("events").EventEmitter;

var AppDispatcher = require("../events/AppDispatcher");
var ActionTypes = require("../constants/ActionTypes");
var EventTypes = require("../constants/EventTypes");

var _isOpen = false;

var SidebarStore = _.extend({}, EventEmitter.prototype, {

  isOpen: function () {
    return _isOpen;
  },

  emitChange: function (eventName) {
    this.emit(eventName);
  },

  addChangeListener: function (eventName, callback) {
    this.on(eventName, callback);
  },

  removeChangeListener: function (eventName, callback) {
    this.removeListener(eventName, callback);
  },

  dispatcherIndex: AppDispatcher.register(function (payload) {
    var source = payload.source;
    if (source !== ActionTypes.SIDEBAR_ACTION) {
      return;
    }

    var action = payload.action;
    var oldIsOpen = _isOpen;

    switch (action.type) {
      case ActionTypes.REQUEST_SIDEBAR_OPEN:
        _isOpen = action.data;
        break;
      case ActionTypes.REQUEST_SIDEBAR_CLOSE:
        _isOpen = action.data;
        break;
    }

    // only emitting on change
    if (oldIsOpen !== _isOpen) {
      SidebarStore.emitChange(EventTypes.SIDEBAR_CHANGE);
    }

    return true;
  })

});

module.exports = SidebarStore;