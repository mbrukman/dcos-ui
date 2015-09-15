jest.dontMock("../DetailSidePanel");
jest.dontMock("../../mixins/GetSetMixin");
jest.dontMock("../../stores/MesosSummaryStore");
jest.dontMock("../../utils/MesosSummaryUtil");
jest.dontMock("../NodeSidePanel");
jest.dontMock("../../utils/Store");
jest.dontMock("../TaskTable");
jest.dontMock("../TaskView");
jest.dontMock("../RequestErrorMsg");

var React = require("react/addons");
var TestUtils = React.addons.TestUtils;

var MesosStateStore = require("../../stores/MesosStateStore");
var MesosSummaryActions = require("../../events/MesosSummaryActions");
var MesosSummaryStore = require("../../stores/MesosSummaryStore");
var NodeSidePanel = require("../NodeSidePanel");

describe("NodeSidePanel", function () {
  beforeEach(function () {
    this.fetchSummary = MesosSummaryActions.fetchSummary;
    this.getTasksFromNodeID = MesosStateStore.getTasksFromNodeID;
    this.storeGet = MesosStateStore.get;
    this.storeGetNode = MesosStateStore.getNodeFromNodeID;

    MesosSummaryActions.fetchSummary = function () {
      return null;
    };
    MesosStateStore.getTasksFromNodeID = function () {
      return [];
    };
    MesosStateStore.get = function (key) {
      if (key === "lastMesosState") {
        return {};
      }
    };
    MesosStateStore.getNodeFromNodeID = function (id) {
      if (id === "nonExistent") {
        return null;
      }

      return {
        id: "existingNode",
        version: "10",
        active: true,
        registered_time: 10
      };
    };
    MesosSummaryStore.init();
    MesosSummaryStore.processSummary({slaves: [{
      "id": "foo",
      "hostname": "bar"
    }]});

    this.instance = TestUtils.renderIntoDocument(
      <NodeSidePanel open={true} onClose={this.callback} />
    );
  });

  afterEach(function () {
    MesosSummaryActions.fetchSummary = this.fetchSummary;
    MesosStateStore.getTasksFromNodeID = this.getTasksFromNodeID;
    MesosStateStore.get = this.storeGet;
    MesosStateStore.getNodeFromNodeID = this.storeGetNode;
  });

  describe("#getInfo", function () {
    it("should return null if node does not exist", function () {
      var instance = TestUtils.renderIntoDocument(
        <NodeSidePanel open={true} itemID="nonExistent" />
      );
      var result = instance.getInfo();
      expect(result).toEqual(null);
    });

    it("should return an array of elements if node exists", function () {
      var instance = TestUtils.renderIntoDocument(
        <NodeSidePanel open={true} itemID="existingNode" />
      );

      var result = instance.getInfo();
      expect(TestUtils.isElement(result[0])).toEqual(true);
    });
  });

  it("should show error if node is not to be found", function () {
    let contents = TestUtils.renderIntoDocument(this.instance.getContents());
    let headline = TestUtils.findRenderedDOMComponentWithTag(contents, "h1");

    expect(headline.getDOMNode().textContent).toBe("Error finding node");
  });

  it("should show the nodes hostname if it is found", function () {
    var instance = TestUtils.renderIntoDocument(
      <NodeSidePanel open={true} onClose={this.callback} itemID="foo" />
    );
    let contents = TestUtils.renderIntoDocument(instance.getContents());
    let headline = TestUtils.findRenderedDOMComponentWithTag(contents, "h1");

    expect(headline.getDOMNode().textContent).toBe("bar");
  });
});