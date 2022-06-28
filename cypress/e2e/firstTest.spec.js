/// <reference types="cypress"/>

describe('Test with backend', () => {

  beforeEach('login to the app', () => {
    //Intercept the server tags to fixture tags
    cy.intercept({method: 'GET', path: 'tags'}, {fixture: 'tags.json'})
    cy.loginToApp()
  })

  it('verify correct request and responce', () => {

    cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticles')

    cy.contains('New Article').click()
    cy.get('[formcontrolname="title"]').type('Article Title')
    cy.get('[formcontrolname="description"]').type('Article description text')
    cy.get('[formcontrolname="body"]').type('Article body text')
    cy.contains('Publish Article').click()

    cy.wait('@postArticles')
    cy.get('@postArticles').then(xhr => {
      // console.log(xhr)

      expect(xhr.response.statusCode).to.equal(200)
      expect(xhr.request.body.article.body).to.equal('Article body text')
      expect(xhr.request.body.article.description).to.equal('Article description text')
    })

    cy.contains('Delete Article').click()
  });
//TODO: finished the test with reply
  it('intercepting and modifying the request and responce', () => {

    //changed the request to the server
    // cy.intercept('POST', 'https://api.realworld.io/api/articles/', req => {
    //   req.body.article.body = "The body text is modified with intercept() method"
    // }).as('postArticles')

    // changed the response from the server
    // https://api.realworld.io/api/articles/
    cy.intercept('POST', 'https://api.realworld.io/api/articles/', (req) => {
      req.reply(res => {
        // expect(res.body.article.description).to.equal('Article description text')
        res.body.article.description = "Text from REPLY method"
      })
    }).as('postArticles')

    cy.contains('New Article').click()
    cy.get('[formcontrolname="title"]').type('Article Title')
    cy.get('[formcontrolname="description"]').type('Article description text')
    cy.get('[formcontrolname="body"]').type('Article body text')
    cy.contains('Publish Article').click()

    cy.wait('@postArticles')
    cy.get('@postArticles').then(xhr => {
      // console.log(xhr)
      expect(xhr.response.statusCode).to.equal(200)
      expect(xhr.request.body.article.body).to.equal('Article body text')
      expect(xhr.request.body.article.description).to.equal('Text from REPLY method')
    })

    // cy.contains('Delete Article').click()
  });

  it('should gave text with routing object', () => {
    cy.get('.tag-list').should('contain', 'Alex')
      .and('contain', 'cypress')
      .and('contain', 'automation')
      .and('contain', 'testing')
  });

  it('verify global feed likes count', () => {
    cy.intercept('GET', '**/articles/feed*', '{"articles":[],"articlesCount":0}')
    cy.intercept('GET', '**/articles*', {fixture: 'articles.json'})

    cy.contains('Global Feed').click()
    cy.get('app-article-list button').then(articleList => {
      expect(articleList[0]).to.contain('0')
      expect(articleList[1]).to.contain('100')
    })

    cy.fixture('articles').then(file => {
      const articleLink = file.articles[1].slug
      cy.intercept('POST', '**/articles/' + articleLink + '/favorite', file);
    })

    //TODO: I do not why, but the test works properly with .then not with should()
    // cy.get('app-article-list button').eq(1).click().should('contain','10111')
    cy.get('app-article-list button').eq(1).click().then(button => {
      const text = button.text().trim()
      expect(text).to.equal('101')
    })
  });

  it.only('delete a new article in a global feed', () => {

    const bodyArticle = {
      "article": {
        "tagList": [],
        "title": "New article 17",
        "description": "New description 1",
        "body": "New article's text 1"
      }
    }

    cy.get('@token').then(token => {

      cy.request({
        method: 'POST',
        url: 'https://api.realworld.io/api/articles',
        headers: {"Content-type": "application/json", "Authorization": "Token " + token},
        body: bodyArticle
      }).then(responce => {
        expect(responce.status).to.equal(200)
      })

      cy.contains('Global Feed').click()
      cy.get('.article-preview').first().click()
      cy.get('.article-actions').contains('Delete Article').click()
      cy.wait(500)

      cy.request({
        method: 'GET',
        url: 'https://api.realworld.io/api/articles?limit=10&offset=0',
        headers: {"Content-type": "application/json", "Authorization": "Token " + token}
      }).its('body').then(body => {
        console.log(body.articles[0].title)
        const firstArticleTitle = body.articles[0].title
        expect(firstArticleTitle).not.equal('New article 17')
      })
    })
  })

});
