const {spec} = require('pactum');
const apiResponcesText = require('../fixtures/apiResponcesText.json');
const createdArticle = require('../../createdArticle.json');

//Created user data
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsZWtzZXkuem9sb2Nod3Zza2krMDAxQGdtYWkuY29tIiwidXNlcm5hbWUiOiJBbGV4LVplYnJvdnNraSsxIiwiaWF0IjoxNjU5MDg5MTExLCJleHAiOjE2NjQyNzMxMTF9.naJjRSE1olBXZZGHrGDoOfeqF2tS1TSyC7Y_2AILRJw'
const username = 'Alex-Zebrovski+1'
const email = 'aleksey.zolochwvski+001@gmai.com'
const pass = '1234123123'

describe('API test suite', async () => {

  it('Get article tags', async () => {
    await spec()
      .get('https://api.realworld.io/api/tags')
      .expectStatus(200);
  });

  // it('Create new User', async () => {
  //   await spec()
  //     .post('https://api.realworld.io/api/users')
  //     .withJson({
  //       'user': {
  //         'email': 'aleksey.zolochwvski+001@gmai.com',
  //         'password': '1234123123',
  //         'username': 'Alex-Zebrovski+1'
  //       }
  //     })
  //     .expectStatus(200)
  // });


  it('Sign Up. Check has already been taken Email', async () => {
    await spec()
      .post('https://api.realworld.io/api/users')
      // .withHeaders('accept','application/json')
      .withJson({
        'user': {
          'email': 'aleksey.zolochwvski+001@gmai.com',
          'password': '1234123123',
          'username': 'Alex-Zebrovski+1'
        }
      })
      .expectStatus(422)
      .expectBodyContains(apiResponcesText.existEmailError)
      .expectBodyContains(apiResponcesText.existUsernameError)
  });

  it('Login', async () => {
    await spec()
      .post('https://api.realworld.io/api/users/login')
      .withJson({
        "user": {
          "email": email,
          "password": pass
        }
      })
  });

  const articleTitle = 'Custom title 019'
  const articleDesc = 'Custom desc 019'
  const articleText = 'Custom text 019'
  it('create article', async () => {
    await spec()
      .post('https://api.realworld.io/api/articles/')
      .withHeaders('Authorization', 'Token ' + token)
      .withJson({
        "article": {
          "tagList": [],
          "title": articleTitle,
          "description": articleDesc,
          "body": articleText
        }
      })
      .expectStatus(200)
      .expectBodyContains(articleTitle)
      .expectBodyContains(articleDesc)
      .expectBodyContains(articleText)
      .expectBodyContains(username)
      .save('createdArticle.json')
  });

  const slug = createdArticle.article.slug;

  it('delete article', async () => {
    await spec()
      .delete(`https://api.realworld.io/api/articles/${slug}`)
      .withHeaders('Authorization', 'Token ' + token)
      .expectBodyContains({})
  });
})
