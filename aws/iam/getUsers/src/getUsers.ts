import assert from 'assert'
import columnify from 'columnify'
import AWS from 'aws-sdk'
;(async function getUsers() {
  assert(process.env.AWS_ACCESS_KEY_ID, 'AWS key should be available')
  assert(process.env.AWS_SECRET_ACCESS_KEY, 'AWS secret should be available')

  const iam = new AWS.IAM()
  const { Users } = await iam.listUsers().promise()
  console.log(columnify(Users))

  process.exit()
})()
