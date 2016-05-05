import List from './List';

class ServicePlanPhases extends List {
  constructor() {
    super(...arguments);

    // Cache lookups
    this._activePhaseIndex = -1;
    this._activePhase = null;

    // Find first phase where status is not complete
    this.getItems().some((phase, phaseIndex) => {
      this._activePhaseIndex = phaseIndex;
      this._activePhase = phase;
      return !phase.isComplete();
    });
  }

  getActive() {
    return this._activePhase;
  }

  getActiveIndex() {
    return this._activePhaseIndex;
  }

}

module.exports = ServicePlanPhases;
