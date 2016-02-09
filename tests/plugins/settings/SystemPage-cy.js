describe('System Page [0dw]', function () {

  context('Components tab [0e0]', function () {

    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy',
        plugins: 'settings-enabled'
      })
      .visitUrl({url: '/settings/system', identify: true});
    });

    it('goes to Component Health page when Component tab clicked [0dz]', function () {
      cy.get('.page-header-navigation .tab-item-label').contains('Components')
      .click();
      cy.hash().should('match', /components/);
    });

  });
});
