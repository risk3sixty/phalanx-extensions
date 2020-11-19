const axios = require('axios')

;(async function getMyIp() {
  const { data } = await axios.get('https://geo.risk3sixty.com/me')
  process.stdout.write(data.ip)
  process.exit()
})()
