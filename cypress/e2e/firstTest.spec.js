/// <reference types="cypress"/>

describe('Test with backend', () => {

  beforeEach('login to the app', () => {
    cy.server()
    cy.route('GET', '**/tags', 'fixture:tags.json')
    cy.loginToApp()
  })

  it('verify correct request and responce', () => {
    //server() and route() The old syntax that deprecated in Cypress 6
    cy.server()
    cy.route('POST', '**/articles').as('postArticles')

    cy.contains('New Article').click()
    cy.get('[formcontrolname="title"]').type('Article Title')
    cy.get('[formcontrolname="description"]').type('Article description text')
    cy.get('[formcontrolname="body"]').type('Article body text')
    cy.contains('Publish Article').click()

    cy.wait('@postArticles')
    cy.get('@postArticles').then(xhr => {
      console.log(xhr)

      expect(xhr.status).to.equal(200)
      expect(xhr.request.body.article.body).to.equal('Article body text')
      expect(xhr.request.body.article.description).to.equal('Article description text')
    })

    // cy.contains('Delete Article').click()
  });

  it('should gave text with routing object', () => {
    cy.get('.tag-list').should('contain', 'Alex')
      .and('contain', 'cypress')
      .and('contain', 'automation')
      .and('contain', 'testing')
  });

  it.only('verify global feed likes count', () => {
    cy.route('GET', '**/articles/feed*', '{"articles":[],"articlesCount":0}')
    cy.route('GET', '**/articles*', 'fixture:articles.json')

    cy.contains('Global Feed').click()
    cy.get('app-article-list button').then(articleList => {
      expect(articleList[0]).to.contain('0')
      expect(articleList[1]).to.contain('100')
    })

    cy.fixture('articles').then(file => {
      const articleLink = file.articles[1].slug
      cy.route('POST', '**/articles/' + articleLink + '/favorite', file);
    })

    // cy.get('app-article-list button').eq(1).click().should('contain','101')
    cy.get('app-article-list button').eq(1).click().then(button => {
      const text = button.text().trim()
      expect(text).to.equal('101')
    })
  });
});
