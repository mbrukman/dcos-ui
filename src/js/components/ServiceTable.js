/** @jsx React.DOM */

var _ = require("underscore");
var Humanize = require("humanize");
var React = require("react/addons");

var EventTypes = require("../constants/EventTypes");
var HealthLabels = require("../constants/HealthLabels");
var HealthSorting = require("../constants/HealthSorting");
var HealthTypes = require("../constants/HealthTypes");
var HealthTypesDescription = require("../constants/HealthTypesDescription");
var InternalStorageMixin = require("../mixins/InternalStorageMixin");
var Maths = require("../utils/Maths");
var MesosStateStore = require("../stores/MesosStateStore");
var Strings = require("../utils/Strings");
var Table = require("./Table");
var TooltipMixin = require("../mixins/TooltipMixin");

var healthKey = "health";

function isStat(prop) {
  return _.contains(["cpus", "mem", "disk"], prop);
}

function getClassName(prop, sortBy, row) {
  return React.addons.classSet({
    "align-right": isStat(prop) || prop === "tasks_count",
    "hidden-mini fixed-width": isStat(prop),
    "highlight": prop === sortBy.prop,
    "clickable": row == null // this is a header
  });
}

function sortFunction(prop) {
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

    if (prop === healthKey) {
      value = HealthSorting[value.key];
    }

    return value.toString().toLowerCase() + "-" + model.name.toLowerCase();
  };
}

function getHealthStatus() {
  return {
    healthProcessed: MesosStateStore.getHealthProcessed()
  };
}

var ServicesTable = React.createClass({

  displayName: "ServicesTable",

  mixins: [TooltipMixin, InternalStorageMixin],

  propTypes: {
    frameworks: React.PropTypes.array.isRequired
  },

  componentDidMount: function () {
    MesosStateStore.addChangeListener(
      EventTypes.MARATHON_HEALTH_CHANGE,
      this.onMarathonHealthChange
    );
    MesosStateStore.addChangeListener(
      EventTypes.MARATHON_HEALTH_REQUEST_ERROR,
      this.onMarathonHealthChange
    );
  },

  componentWillUnmount: function () {
    MesosStateStore.removeChangeListener(
      EventTypes.MARATHON_HEALTH_REQUEST_ERROR,
      this.onMarathonHealthChange
    );
    MesosStateStore.removeChangeListener(
      EventTypes.MARATHON_HEALTH_CHANGE,
      this.onMarathonHealthChange
    );
  },

  onMarathonHealthChange: function () {
    this.internalStorage_set(getHealthStatus());
    this.forceUpdate();
  },

  handleClick: function (model, context) {
    if (model.webui_url.length > 0 && context.refs[model.id] != null) {
      context.refs[model.id].getDOMNode().click();
    }
  },

  getRowAttributes: function (model, context) {
    return {
      onClick: this.handleClick.bind(null, model, context),
      className: model.webui_url.length > 0 ? "row-hover" : ""
    };
  },

  renderHeadline: function (prop, model) {
    if (model.webui_url.length === 0) {
      return (
        <span className="h5 flush-top flush-bottom headline">
          <i className="icon icon-small icon-small-white border-radius"></i>
          {model[prop]}
        </span>
      );
    }

    return (
      <span className="h5 flush-top flush-bottom">
        <a ref={model.id}
            href={Strings.ipToHostAddress(model.webui_url)}
            className="headline">
          <i className="icon icon-small icon-small-white border-radius"></i>
          {model[prop]}
        </a>
       </span>
     );
  },

  renderHealth: function (prop, model) {
    var data = this.internalStorage_get();

    if (!data.healthProcessed) {
      return (
        <div className="loader-small ball-beat">
          <div></div>
          <div></div>
          <div></div>
        </div>
      );
    }

    var statusClassSet = React.addons.classSet({
      "collection-item-content-status": true,
      "text-success": model.health.value === HealthTypes.HEALTHY,
      "text-danger": model.health.value === HealthTypes.UNHEALTHY,
      "text-warning": model.health.value === HealthTypes.IDLE,
      "text-mute": model.health.value === HealthTypes.NA
    });

    var attributes = {};
    attributes["data-behavior"] = "show-tip";

    if (model.health.value === HealthTypes.HEALTHY) {
      attributes["data-tip-content"] = HealthTypesDescription.HEALTHY;
    } else if (model.health.value === HealthTypes.UNHEALTHY) {
      attributes["data-tip-content"] = HealthTypesDescription.UNHEALTHY;
    } else if (model.health.value === HealthTypes.IDLE) {
      attributes["data-tip-content"] = HealthTypesDescription.IDLE;
    } else if (model.health.value === HealthTypes.NA) {
      attributes["data-tip-content"] = HealthTypesDescription.NA;
    }

    return React.createElement(
      "span",
      _.extend({className: statusClassSet}, attributes),
      HealthLabels[model.health.key]
    );
  },

  renderTask: function (prop, model) {
    return (
      <span>
        {model[prop]}
        <span className="visible-mini-inline"> Tasks</span>
      </span>
    );
  },

  renderStats: function (prop, model) {
    var value = Maths.round(_.last(model.used_resources[prop]).value, 2);
    if (prop !== "cpus") {
      value = Humanize.filesize(value * 1024 * 1024, 1024, 1);
    }

    return (
      <span>
        {value}
      </span>
    );
  },

  getDefaultProps: function () {
    return {
      frameworks: []
    };
  },

  getColumns: function () {
    return [
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: "name",
        render: this.renderHeadline,
        sortable: true,
        title: "SERVICE NAME"
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: healthKey,
        render: this.renderHealth,
        sortable: true,
        title: "HEALTH"
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: "tasks_count",
        render: this.renderTask,
        sortable: true,
        title: "TASKS"
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: "cpus",
        render: this.renderStats,
        sortable: true,
        title: "CPU"
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: "mem",
        render: this.renderStats,
        sortable: true,
        title: "MEM"
      },
      {
        className: getClassName,
        headerClassName: getClassName,
        prop: "disk",
        render: this.renderStats,
        sortable: true,
        title: "DISK"
      }
    ];
  },

  render: function () {
    return (
      <Table
        className="table inverse table-borderless-outer table-borderless-inner-columns"
        columns={this.getColumns()}
        data={this.props.frameworks.slice(0)}
        buildRowOptions={this.getRowAttributes}
        keys={["id"]}
        sortBy={{prop: "name", order: "desc"}}
        sortFunc={sortFunction} />
    );
  }
});

module.exports = ServicesTable;
