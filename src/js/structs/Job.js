import Item from './Item';
import JobActiveRunList from './JobActiveRunList';

module.exports = class Job extends Item {
  constructor() {
    super(...arguments);

    const id = this.getId();
    if (id !== '/' && (!id.startsWith('/') || id.endsWith('/'))) {
      throw new Error(`Id (${id}) must start with a leading slash ("/") and should not end with a slash, except for root id which is only a slash`);
    }
  }

  getCommand() {
    return this.get('run').cmd;
  }

  getDescription() {
    return this.get('description');
  }

  getId() {
    return this.get('id') || '/';
  }

  getName() {
    return this.getId().split('/').pop();
  }

  getActiveRuns() {
    return new JobActiveRunList({items: this.get('activeRuns')});
  }

  getLongestRunningActiveRun() {
    let sortedRuns = this.getActiveRuns().getItems().sort(function (a, b) {
      return a.getDateCreated().valueOf() -  b.getDateCreated().valueOf();
    })

    return sortedRuns[0];
  }

  getSchedule() {
    return this.get('schedule');
  }
};
