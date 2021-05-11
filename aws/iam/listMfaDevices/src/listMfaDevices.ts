import assert from 'assert'
import columnify from 'columnify'
import AWS from 'aws-sdk'
;(async function userAccessList() {
  assert(process.env.AWS_ACCESS_KEY_ID, 'AWS key should be available')
  assert(process.env.AWS_SECRET_ACCESS_KEY, 'AWS secret should be available')

  const iam = new AWS.IAM()

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html#listVirtualMFADevices-property
  const devices = await iam.listVirtualMFADevices().promise()
  // console.log(columnify(devices))
  console.log(JSON.stringify(devices, null, 2))

  process.exit()
})()
