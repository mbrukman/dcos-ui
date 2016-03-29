import Item from './Item';
import FrameworkUtil from '../utils/FrameworkUtil';
import Util from '../utils/Util';

// TODO (John): Remove all randomized data.
function randomBoolean() {
  return Math.floor(Math.random() * 10) >= 5;
}

function randomNumber(upperLimit) {
  return Math.floor(Math.random() * upperLimit) + 1;
}

class UniversePackage extends Item {
  constructor() {
    super(...arguments);

    this._activeDecisionPoint = randomNumber(3);
    this._activeBlock = randomNumber(300);
    this._isDecisionPointActive = randomBoolean();
    this._isUpgradeAvailable = randomBoolean();
    this._isUpgradePaused = randomBoolean();
    this._isUpgrading = randomBoolean();
  }

  getActiveBlock() {
    return this._activeBlock;
  }

  getActiveDecisionPoint() {
    return this._activeDecisionPoint;
  }

  getAppId() {
    return this.get('appId');
  }

  getAppIdName() {
    let appId = this.getAppId();
    // Remove initial slash if present
    if (appId.charAt(0) === '/') {
      appId = appId.slice(1);
    }

    return appId;
  }

  getBlockCount() {
    return this.getActiveBlock() + 10;
  }

  getDecisionPointCount() {
    return this.getActiveDecisionPoint() + 10;
  }

  getDecisionPointIndices() {
    let indices = [];

    for (let i = 0; i < this.getDecisionPointCount(); i++) {
      indices.push(randomNumber(this.getDecisionPointCount()));
    }

    return indices;
  }

  getCurrentPhase() {
    return {
      label: 'Pre-flight',
      status: 'Configuring Update'
    };
  }

  getPhases() {
    return [
      {
        label: 'Pre-flight',
        progress: 100,
        upgradeState: 'ongoing'
      }, {
        label: 'Upgrade',
        progress: 0,
        upgradeState: 'upcoming'
      }, {
        label: 'Post-flight',
        progress: 0,
        upgradeState: 'upcoming'
      }
    ];
  }

  getIcons() {
    return FrameworkUtil.getServiceImages(
      this.get('images') ||
      Util.findNestedPropertyInObject(
        this.get('resourceDefinition'), 'images'
      ) ||
      Util.findNestedPropertyInObject(this.get('resource'), 'images')
    );
  }

  getName() {
    return this.get('packageDefinition').name;
  }

  getScreenshots() {
    return Util.findNestedPropertyInObject(
      this.get('resource'),
      'images.screenshots'
    );
  }

  isSelected() {
    if (this.get('package') && this.get('package').hasOwnProperty('selected')) {
      return this.get('package').selected;
    }

    return this.get('selected');
  }

  getMaintainer() {
    return Util.findNestedPropertyInObject(
      this.get('package'),
      'maintainer'
    );
  }

  getPreinstallNotes() {
    return Util.findNestedPropertyInObject(
      this.get('package'),
      'preInstallNotes'
    );
  }

  getPostInstallNotes() {
    return Util.findNestedPropertyInObject(
      this.get('package'),
      'postInstallNotes'
    );
  }

  getPostUninstallNotes() {
    return Util.findNestedPropertyInObject(
      this.get('packageDefinition'),
      'postUninstallNotes'
    );
  }

  // TODO (John): Use actual data.
  getUpgradeVersions() {
    return ['0.1.0', '0.1.5', '0.2.0', '0.2.5'];
  }

  getCurrentVersion() {
    return this.get('packageDefinition').version;
  }

  getSelectedUpgradeVersion() {
    let upgradeVersions = this.getUpgradeVersions();
    return upgradeVersions[upgradeVersions.length - 1];
  }

  getUpgradeHealth() {
    return 'Healthy';
  }

  hasError() {
    return false;
  }

  isDecisionPointActive() {
    return this._isDecisionPointActive;
  }

  isUpgradeAvailable() {
    return this._isUpgradeAvailable;
  }

  isUpgradePaused() {
    return this._isUpgradePaused;
  }

  isUpgrading() {
    return this._isUpgrading;
  }
}

module.exports = UniversePackage;
