import assert from 'assert'
import axios from 'axios'
import columnify from 'columnify'
;(async function getUsers() {
  assert(
    process.env.PHALANX_API_KEY,
    'Phalanx API key required to make API requests'
  )

  const {
    data: { users },
  } = await axios.get(
    `${
      process.env.PHALANX_HOST || 'https://phalanx.risk3sixty.com'
    }/api/1.0/teams/users/get`,
    {
      headers: {
        ['x-r3s-key']: process.env.PHALANX_API_KEY,
      },
    }
  )

  console.log(
    columnify(
      users.map((user: any) => ({
        email: user.username_email,
        name: user.name,
        phone_number: user.phone_number,
        two_factor_enabled: user.two_factor_enabled && 'yes',
        last_login: user.last_login,
        added: user.created_at,
      }))
    )
  )
  process.exit()
})()
