import classNames from 'classnames';
import {Dropdown, Modal} from 'reactjs-components';
import React from 'react';

import PackageUpgradeConfirmation from '../PackageUpgradeConfirmation';
import PackageUpgradeDetail from '../PackageUpgradeDetail';

const METHODS_TO_BIND = [];

class UpgradePackageModal extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getModalContent(cosmosPackage) {
    if (cosmosPackage.isUpgrading()) {
      return <PackageUpgradeDetail cosmosPackage={cosmosPackage} />;
    }

    if (this.props.requireConfirmation) {
      return <PackageUpgradeConfirmation cosmosPackage={cosmosPackage} />;
    }

    return 'No upgrade information available.';
  }

  handleVersionSelection(version) {
    this.setState({upgradeVersion: version.id});
  }

  getLatestVersion(cosmosPackage) {
    let availableVersions = cosmosPackage.getUpgradeVersions();
    return availableVersions[availableVersions.length - 1];
  }

  getVersionDropdownItems(availableVersions) {
    return availableVersions.map(function (version) {
      return {id: version, html: `Version ${version}`};
    });
  }

  getModalContents() {
    let {cosmosPackage} = this.props;
    let packageName = cosmosPackage.getName();
    let packageVersion = cosmosPackage.getCurrentVersion();

    return (
      <div className="modal-content">
        <div className="modal-content-inner container container-pod
          container-pod-short horizontal-center">
          <div className="icon icon-jumbo icon-image-container
            icon-app-container">
            <img src={cosmosPackage.getIcons()['icon-large']} />
          </div>
          <h2 className="short">{packageName}</h2>
          <p className="flush">
            {packageName} {packageVersion}
          </p>
        </div>
      </div>
    );
  }

  getModalFooter() {
    let cosmosPackage = this.props.cosmosPackage;

    return (
      <div className="button-collection button-collection-stacked">
        <Dropdown
          buttonClassName="button button-wide dropdown-toggle
            text-align-center flush"
          dropdownMenuClassName="dropdown-menu"
          dropdownMenuListClassName="dropdown-menu-list"
          initialID={this.getLatestVersion(cosmosPackage)}
          items={this.getVersionDropdownItems(
            cosmosPackage.getUpgradeVersions()
          )}
          onItemSelection={this.handleVersionSelection}
          transition={true}
          transitionName="dropdown-menu"
          wrapperClassName="dropdown dropdown-wide
            button-collection-spacing" />
        <button
          disabled={this.props.pendingRequest}
          className="button button-success button-wide"
          onClick={this.handleUpgradeStart}>
          Start Upgrade
        </button>
      </div>
    );
  }

  render() {
    let {props} = this;
    let {cosmosPackage} = props;
    let modalContent;

    if (cosmosPackage != null) {
      modalContent = this.getModalContent(cosmosPackage);
    }

    let modalClasses = classNames('modal', {
      'modal-narrow': cosmosPackage && (!cosmosPackage.isUpgrading()
        || cosmosPackage.hasError())
    });

    return (
      <Modal
        bodyClass="modal-content allow-overflow"
        dynamicHeight={false}
        innerBodyClass="flush-top flush-bottom"
        maxHeightPercentage={1}
        modalClass={modalClasses}
        onClose={props.onClose}
        open={props.open}
        showCloseButton={false}
        useGemini={false}>
        {modalContent}
      </Modal>
    );
  }
}

UpgradePackageModal.defaultProps = {
  onClose: function () {},
  open: false,
  requireConfirmation: false
};

UpgradePackageModal.propTypes = {
  onClose: React.PropTypes.func,
  open: React.PropTypes.bool,
  requireConfirmation: React.PropTypes.bool
};

module.exports = UpgradePackageModal;
