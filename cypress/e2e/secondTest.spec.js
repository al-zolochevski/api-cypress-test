/// <reference types="cypress" />

describe('Log out from the App', () => {
  beforeEach('Login to app', () => {
    cy.loginToApp()
  })

  it('log out from the app', () => {
    cy.get('a[href^="/profile"]').click()
    cy.get('a[href^="/settings"]').click()
    cy.contains('Or click here to logout.').click()
    cy.get('.navbar-nav li').should('contain.text', 'Sign up')
  })
})
