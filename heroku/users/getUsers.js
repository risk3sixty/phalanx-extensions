const assert = require('assert')
const columnify = require('columnify')
const Heroku = require('heroku-client')

;(async function getUsers() {
  assert(
    process.env.HEROKU_API_KEY,
    'Heroku API key required to make API requests'
  )
  assert(process.env.HEROKU_TEAM, 'Heroku team name or ID should be provided')

  const heroku = new Heroku({ token: process.env.HEROKU_API_KEY })
  const res = await heroku.get(`/teams/${process.env.HEROKU_TEAM}/members`)
  console.log(
    columnify(
      res.map((user) => ({
        ...user.user,
        role: user.role,
        two_factor_authentication: user.two_factor_authentication && 'yes',
        created_at: user.created_at,
        updated_at: user.updated_at,
      }))
    )
  )

  process.exit()
})()
