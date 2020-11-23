import assert from 'assert'
import columnify from 'columnify'
import AWS from 'aws-sdk'
;(async function getDbs() {
  assert(process.env.AWS_ACCESS_KEY_ID, 'AWS key should be available')
  assert(process.env.AWS_SECRET_ACCESS_KEY, 'AWS secret should be available')
  assert(process.env.AWS_REGION, 'AWS region should be specified')

  const rds = new AWS.RDS({ region: process.env.AWS_REGION })
  const { DBInstances } = await rds.describeDBInstances().promise()
  if (!DBInstances || DBInstances.length === 0) {
    console.log(
      `No databases in your account in region ${process.env.AWS_REGION}.`
    )
  } else {
    console.log(
      columnify(
        DBInstances.map((inst) => ({
          DBInstanceIdentifier: inst.DBInstanceIdentifier,
          DBInstanceClass: inst.DBInstanceClass,
          Engine: inst.Engine,
          DBInstanceStatus: inst.DBInstanceStatus,
          DBName: inst.DBName,
          InstanceCreateTime: inst.InstanceCreateTime,
          AvailabilityZone: inst.AvailabilityZone,
          StorageEncrypted: inst.StorageEncrypted,
        }))
      )
    )
  }

  process.exit()
})()
