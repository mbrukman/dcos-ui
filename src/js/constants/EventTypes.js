let EventTypes = {};
[
  'APP_STORE_CHANGE',
  'CONFIG_ERROR',
  'CONFIG_LOADED',
  'COSMOS_DESCRIBE_CHANGE',
  'COSMOS_DESCRIBE_ERROR',
  'COSMOS_INSTALL_ERROR',
  'COSMOS_INSTALL_SUCCESS',
  'COSMOS_LIST_CHANGE',
  'COSMOS_LIST_ERROR',
  'COSMOS_REPOSITORIES_ERROR',
  'COSMOS_REPOSITORIES_SUCCESS',
  'COSMOS_REPOSITORY_ADD_ERROR',
  'COSMOS_REPOSITORY_ADD_SUCCESS',
  'COSMOS_REPOSITORY_DELETE_ERROR',
  'COSMOS_REPOSITORY_DELETE_SUCCESS',
  'COSMOS_SEARCH_CHANGE',
  'COSMOS_SEARCH_ERROR',
  'COSMOS_UNINSTALL_ERROR',
  'COSMOS_UNINSTALL_SUCCESS',
  'DCOS_METADATA_CHANGE',
  'HEALTH_NODE_ERROR',
  'HEALTH_NODE_SUCCESS',
  'HEALTH_NODE_UNIT_ERROR',
  'HEALTH_NODE_UNIT_SUCCESS',
  'HEALTH_NODE_UNITS_ERROR',
  'HEALTH_NODE_UNITS_SUCCESS',
  'HEALTH_NODES_CHANGE',
  'HEALTH_NODES_ERROR',
  'HEALTH_UNIT_ERROR',
  'HEALTH_UNIT_NODE_ERROR',
  'HEALTH_UNIT_NODE_SUCCESS',
  'HEALTH_UNIT_NODES_ERROR',
  'HEALTH_UNIT_NODES_SUCCESS',
  'HEALTH_UNIT_SUCCESS',
  'HEALTH_UNITS_CHANGE',
  'HEALTH_UNITS_ERROR',
  'HISTORY_CHANGE',
  'INTERCOM_CHANGE',
  'MARATHON_APPS_CHANGE',
  'MARATHON_APPS_ERROR',
  'MESOS_INITIALIZE_LOG_CHANGE',
  'MESOS_INITIALIZE_LOG_REQUEST_ERROR',
  'MESOS_LOG_CHANGE',
  'MESOS_LOG_REQUEST_ERROR',
  'MESOS_STATE_CHANGE',
  'MESOS_STATE_REQUEST_ERROR',
  'MESOS_SUMMARY_CHANGE',
  'MESOS_SUMMARY_REQUEST_ERROR',
  'METADATA_CHANGE',
  'NETWORKING_VIP_SUMMARIES_CHANGE',
  'NETWORKING_VIP_SUMMARIES_REQUEST_ERROR',
  'PLUGINS_CONFIGURED',
  'SHOW_CLI_INSTRUCTIONS',
  'SHOW_TOUR',
  'SHOW_VERSIONS_ERROR',
  'SHOW_VERSIONS_SUCCESS',
  'SIDEBAR_CHANGE',
  'TASK_DIRECTORY_CHANGE',
  'TASK_DIRECTORY_ERROR',
  'USER_CREATE_ERROR',
  'USER_CREATE_SUCCESS',
  'USER_DELETE_ERROR',
  'USER_DELETE_SUCCESS',
  'USERS_CHANGE',
  'USERS_REQUEST_ERROR'
].forEach(function (eventType) {
  EventTypes[eventType] = eventType;
});

module.exports = EventTypes;
