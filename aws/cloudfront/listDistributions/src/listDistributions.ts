import assert from 'assert'
// import columnify from 'columnify'
import AWS from 'aws-sdk'
;(async function listDistributions() {
  assert(process.env.AWS_ACCESS_KEY_ID, 'AWS key should be available')
  assert(process.env.AWS_SECRET_ACCESS_KEY, 'AWS secret should be available')

  const cf = new AWS.CloudFront()
  const { DistributionList } = await cf.listDistributions().promise()
  // console.log(columnify(DistributionList))
  console.log(JSON.stringify(DistributionList, null, 2))

  process.exit()
})()
