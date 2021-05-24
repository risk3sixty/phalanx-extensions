import assert from 'assert'
import columnify from 'columnify'
import AWS from 'aws-sdk'

;(async function listImages() {
  assert(process.env.AWS_ACCESS_KEY_ID, 'AWS key should be available')
  assert(process.env.AWS_SECRET_ACCESS_KEY, 'AWS secret should be available')
  assert(process.env.AWS_REGION, 'AWS region should be provided')

  const ec2 = new AWS.EC2({ region: process.env.AWS_REGION })

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeImages-property
  const { Images } = await ec2.describeImages().promise()
  
  // console.log(columnify(Images))
  console.log(JSON.stringify(Images, null, 2))

  process.exit()
})()
