import Item from './Item';
import VolumeStatus from '../constants/VolumeStatus';

class Volume extends Item {

  getContainerPath() {
    return this.get('containerPath');
  }

  getHost() {
    return this.get('host');
  }

  getId() {
    return this.get('id');
  }

  getMode() {
    return this.get('mode');
  }

  getStatus() {
    return this.get('status') || VolumeStatus.UNAVAILABLE;
  }

  getSize() {
    return this.get('size');
  }

  getType() {
    return this.get('type');
  }

};

module.exports = Volume;
