var _ = require("underscore");
var React = require("react/addons");
import Router, {RouteHandler} from "react-router";

var AlertPanel = require("../components/AlertPanel");
var EventTypes = require("../constants/EventTypes");
var FilterHealth = require("../components/FilterHealth");
var FilterHeadline = require("../components/FilterHeadline");
var FilterInputText = require("../components/FilterInputText");
var InternalStorageMixin = require("../mixins/InternalStorageMixin");
var Page = require("../components/Page");
var MarathonStore = require("../stores/MarathonStore");
var MesosSummaryStore = require("../stores/MesosSummaryStore");
var ResourceBarChart = require("../components/charts/ResourceBarChart");
var ServiceTable = require("../components/ServiceTable");
var ServiceSidePanel = require("../components/ServiceSidePanel");
var SidebarActions = require("../events/SidebarActions");

function getCountByHealth(frameworks) {
  return _.foldl(frameworks, function (acc, framework) {
    let appHealth = MarathonStore.getServiceHealth(framework.name);
    if (acc[appHealth.value] === undefined) {
      acc[appHealth.value] = 1;
    } else {
      acc[appHealth.value]++;
    }
    return acc;
  }, {});
}

function getMesosServices(state) {
  var filters = _.pick(state, "searchString", "healthFilter");
  var frameworks = MesosSummaryStore.getFrameworks(filters);

  var services = MesosSummaryStore.get("states").last().getServiceList();
  var filteredServices = services.filter({
    health: filters.healthFilter,
    name: filters.searchString
  });

  return {
    services: filteredServices,
    totalServices: services.getItems().length,
    countByHealth: getCountByHealth(services.getItems()),
    statesProcessed: MesosSummaryStore.get("statesProcessed"),
    refreshRate: MesosSummaryStore.getRefreshRate(),
    totalFrameworksResources:
      MesosSummaryStore.getTotalFrameworksResources(frameworks),
    totalResources: MesosSummaryStore.getTotalResources()
  };
}

var DEFAULT_FILTER_OPTIONS = {
  searchString: "",
  healthFilter: null
};

var ServicesPage = React.createClass({

  displayName: "ServicesPage",

  mixins: [InternalStorageMixin],

  statics: {
    routeConfig: {
      label: "Services",
      icon: "services",
      matches: /^\/services/
    },

    // Static life cycle method from react router, that will be called
    // "when a handler is about to render", i.e. on route change:
    // https://github.com/rackt/react-router/
    // blob/master/docs/api/components/RouteHandler.md
    willTransitionTo: function () {
      SidebarActions.close();
    }
  },

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function () {
    return _.extend({selectedResource: "cpus"}, DEFAULT_FILTER_OPTIONS);
  },

  componentWillMount: function () {
    this.internalStorage_set(_.extend(
      {openServicePanel: false},
      getMesosServices(this.state)
    ));
  },

  componentDidMount: function () {
    MesosSummaryStore.addChangeListener(
      EventTypes.MESOS_SUMMARY_CHANGE,
      this.onMesosStateChange
    );

    this.internalStorage_update({
      openServicePanel: this.props.params.serviceName != null
    });
  },

  componentWillReceiveProps: function (nextProps) {
    this.internalStorage_update({
      openServicePanel: nextProps.params.serviceName != null
    });
  },

  componentWillUnmount: function () {
    MesosSummaryStore.removeChangeListener(
      EventTypes.MESOS_SUMMARY_CHANGE,
      this.onMesosStateChange
    );
  },

  onMesosStateChange: function () {
    this.internalStorage_update(getMesosServices(this.state));
    this.forceUpdate();
  },

  handleHealthFilterChange: function (healthFilter) {
    var stateChanges = _.clone(DEFAULT_FILTER_OPTIONS);
    stateChanges.healthFilter = healthFilter;

    this.internalStorage_update(getMesosServices(stateChanges));
    this.setState(stateChanges);
  },

  onResourceSelectionChange: function (selectedResource) {
    if (this.state.selectedResource !== selectedResource) {
      this.setState({selectedResource: selectedResource});
    }
  },

  handleSearchStringChange: function (searchString) {
    var data = getMesosServices({
      searchString: searchString,
      healthFilter: this.state.healthFilter
    });

    this.internalStorage_update(data);
    this.setState({searchString: searchString});
  },

  handleSideBarClose: function () {
    Router.History.back();
  },

  resetFilter: function () {
    var state = _.clone(DEFAULT_FILTER_OPTIONS);
    this.internalStorage_update(getMesosServices(state));
    this.setState(state);
  },

  getServicesPageContent: function () {
    let state = this.state;
    let data = this.internalStorage_get();
    let appsProcessed = MarathonStore.hasProcessedApps();

    return (
      <div>
        <ResourceBarChart
          itemCount={data.services.length}
          resources={data.totalFrameworksResources}
          totalResources={data.totalResources}
          refreshRate={data.refreshRate}
          resourceType="Services"
          selectedResource={state.selectedResource}
          onResourceSelectionChange={this.onResourceSelectionChange} />
        <FilterHeadline
          onReset={this.resetFilter}
          name="Services"
          currentLength={data.services.length}
          totalLength={data.totalServices} />
        <ul className="list list-unstyled list-inline flush-bottom">
          <li>
            <FilterHealth
              countByHealth={data.countByHealth}
              healthFilter={state.healthFilter}
              handleFilterChange={this.handleHealthFilterChange}
              servicesLength={data.totalServices} />
          </li>
          <li>
            <FilterInputText
              searchString={state.searchString}
              handleFilterChange={this.handleSearchStringChange} />
          </li>
        </ul>
        <ServiceTable
          services={data.services}
          healthProcessed={appsProcessed} />
        <ServiceSidePanel
          open={data.statesProcessed && data.openServicePanel}
          serviceName={this.props.params.serviceName}
          onClose={this.handleSideBarClose} />
      </div>
    );
  },

  getEmptyServicesPageContent: function () {
    return (
      <AlertPanel title="No Services Installed">
        <p>Use the DCOS command line tools to find and install services.</p>
      </AlertPanel>
    );
  },

  getContents: function (isEmpty) {
    if (isEmpty) {
      return this.getEmptyServicesPageContent();
    } else {
      return this.getServicesPageContent();
    }
  },

  render: function () {
    var data = this.internalStorage_get();
    var isEmpty = data.statesProcessed && data.totalServices === 0;

    return (
      <Page title="Services">
        {this.getContents(isEmpty)}
        <RouteHandler />
      </Page>
    );
  }

});

module.exports = ServicesPage;
