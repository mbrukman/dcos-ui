import Item from './Item';

/**
 * An application deployment.
 *
 * @struct
 * @see the
 *   {@link http://mesosphere.github.io/marathon/docs/deployments.html|Marathon
 *   application deployment documentation}
 */
module.exports = class Deployment extends Item {

  /**
   * @return {string} the id of this deployment
   */
  getId() {
    return this.get('id');
  }

  /**
   * @return {Array.<string>} an array of app IDs affected by this deployment.
   */
  getAffectedServiceIds() {
    return this.get('affectedApps');
  }

  /**
   * @return {Date} the date and time at which the deployment was started.
   */
  getStartTime() {
    return new Date(this.get('version'));
  }

  /**
   * @return {number} the index of the deployment step currently underway.
   * @see {@link getTotalSteps}
   */
  getCurrentStep() {
    return this.get('currentStep');
  }

  /**
   * @return {number} the number of steps in this deployment.
   * @see {@link getCurrentStep}
   */
  getTotalSteps() {
    return this.get('totalSteps');
  }

}
