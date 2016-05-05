import Item from './Item';
import ServicePlanPhase from './ServicePlanPhase';
import ServicePlanPhases from './ServicePlanPhases';
import ServicePlanStatusTypes from '../constants/ServicePlanStatusTypes';

class ServicePlan extends Item {
  getPhases() {
    let items = this.get('phases').map(function (phase) {
      return new ServicePlanPhase(phase);
    });

    return new ServicePlanPhases({items});
  }

  getErrors() {
    return this.get('errors');
  }

  hasError() {
    return this.get('status') === ServicePlanStatusTypes.ERROR;
  }

  isComplete() {
    return this.get('status') === ServicePlanStatusTypes.COMPLETE;
  }

  isInProgress() {
    return this.get('status') === ServicePlanStatusTypes.IN_PROGRESS;
  }

  isPending() {
    return this.get('status') === ServicePlanStatusTypes.PENDING;
  }

  isWaiting() {
    return this.get('status') === ServicePlanStatusTypes.WAITING;
  }

}

module.exports = ServicePlan;
