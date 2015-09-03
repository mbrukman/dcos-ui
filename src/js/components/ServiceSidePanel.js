import React from "react/addons";
import {SidePanel} from "reactjs-components";

import EventTypes from "../constants/EventTypes";
import InternalStorageMixin from "../mixins/InternalStorageMixin";
import MesosSummaryStore from "../stores/MesosSummaryStore";

const ServiceSidePanel = React.createClass({

  displayName: "ServiceSidePanel",

  mixins: [InternalStorageMixin],

  contextTypes: {
    router: React.PropTypes.func
  },

  shouldComponentUpdate: function (nextProps) {
    let props = this.props;

    return props.serviceName !== nextProps.serviceName ||
      props.open !== nextProps.open;
  },

  componentDidMount: function () {
    MesosSummaryStore.addChangeListener(
      EventTypes.MESOS_SUMMARY_CHANGE, this.onMesosSummaryChange
    );

    // Needs to rerendered for the component to be animate in on mount
    this.internalStorage_update({didRender: true});
    this.forceUpdate();
  },

  componentWillUnmount: function () {
    MesosSummaryStore.removeChangeListener(
      EventTypes.MESOS_SUMMARY_CHANGE, this.onMesosSummaryChange
    );
  },

  onMesosSummaryChange: function () {
    if (MesosSummaryStore.get("statesProcessed")) {
      // Once we have the data we need (frameworks), stop listening for changes.
      MesosSummaryStore.removeChangeListener(
        EventTypes.MESOS_SUMMARY_CHANGE, this.onMesosSummaryChange
      );

      this.forceUpdate();
    }
  },

  handlePanelClose: function () {
    this.props.onClose();
    this.forceUpdate();
  },

  handleOpenServiceButtonClick: function () {
    this.context.router.transitionTo(
      "service-ui",
      {serviceName: this.props.serviceName}
    );
  },

  getHeader: function () {
    return (
      <div>
        <span className="button button-link button-inverse"
          onClick={this.handlePanelClose}>
          <i className="service-detail-close"></i>
          Close
        </span>
      </div>
    );
  },

  getServiceDetails: function () {
    let service = MesosSummaryStore.getServiceFromName(this.props.serviceName);

    if (service == null) {
      return "loading...";
    }

    return (
      <div>
        <h2 className="text-align-center inverse overlay-header">
          {service.name}
        </h2>
        <div className="container container-pod">
          <div className="row">
            <div className="column-8">
            </div>
            <div className="column-4 text-align-right">
              {this.getOpenServiceButton()}
            </div>
          </div>
        </div>
      </div>
    );
  },

  getOpenServiceButton: function () {
    if (!MesosSummaryStore.hasServiceUrl(this.props.serviceName)) {
      return null;
    }

    // We are not using react-router's Link tag due to reactjs-component's
    // Portal going outside of React's render tree.
    return (
      <a className="button button-success text-align-right"
        onClick={this.handleOpenServiceButtonClick}>
        Open service
      </a>
    );
  },

  render: function () {
    let data = this.internalStorage_get();

    // TODO(ml): rename to className
    return (
      <SidePanel classNames="service-detail"
        header={this.getHeader()}
        open={data.didRender && this.props.open}
        onClose={this.handlePanelClose}>
        {this.getServiceDetails()}
      </SidePanel>
    );
  }
});

module.exports = ServiceSidePanel;
