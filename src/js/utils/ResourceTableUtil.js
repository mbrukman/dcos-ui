var _ = require("underscore");
var React = require("react/addons");

var HealthSorting = require("../constants/HealthSorting");
var TableHeaderLabels = require("../constants/TableHeaderLabels");

function isStat(prop) {
  return _.contains(["cpus", "mem", "disk"], prop);
}

var TableUtil = {
  getClassName: function (prop, sortBy, row) {
    return React.addons.classSet({
      "align-right": isStat(prop) || prop === "TASK_RUNNING",
      "hidden-mini": isStat(prop),
      "highlight": prop === sortBy.prop,
      "clickable": row == null // this is a header
    });
  },

  renderTask: function (prop, model) {
    return (
      <span>
        {model[prop]}
        <span className="visible-mini-inline"> Tasks</span>
      </span>
    );
  },

  renderHeader: function (prop, order, sortBy) {
    var title = TableHeaderLabels[prop];
    var caret = {
      before: null,
      after: null
    };
    var caretClassSet = React.addons.classSet({
      "caret": true,
      "dropup": order === "desc",
      "invisible": prop !== sortBy.prop
    });

    if (isStat(prop) || prop === "TASK_RUNNING") {
      caret.before = <span className={caretClassSet} />;
    } else {
      caret.after = <span className={caretClassSet} />;
    }

    return (
      <span>
        {caret.before}
        {title}
        {caret.after}
      </span>
    );
  },

  getSortFunction: function (title) {
    return function (prop) {
      if (isStat(prop)) {
        return function (model) {
          return _.last(model.used_resources[prop]).value;
        };
      }

      return function (model) {
        var value = model[prop];
        if (_.isNumber(value)) {
          return value;
        }

        if (prop === "health") {
          value = HealthSorting[value.key];
        }

        return value.toString().toLowerCase() + "-" + model[title].toLowerCase();
      };
    };
  }
};

module.exports = TableUtil;
