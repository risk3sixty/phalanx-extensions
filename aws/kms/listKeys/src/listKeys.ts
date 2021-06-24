import assert from 'assert'
import columnify from 'columnify'
import AWS from 'aws-sdk'
import R3sSdk from '@risk3sixty/extension-sdk'

;(async function listKeys() {
  assert(process.env.AWS_ACCESS_KEY_ID, 'AWS key should be available')
  assert(process.env.AWS_SECRET_ACCESS_KEY, 'AWS secret should be available')
  assert(process.env.AWS_REGION, 'AWS region should be provided')

  const kms = new AWS.KMS({ region: process.env.AWS_REGION })

  try {
    let allKeys:any = []
    let moreResults: boolean = true
    let nextMarker: string | undefined
    while (moreResults) {
      // https://docs.aws.amazon.com/kms/latest/APIReference/API_ListKeys.html
      const { Keys, NextMarker } = await kms.listKeys({ Limit: 1000, Marker: nextMarker}).promise()

      if (Keys) {
        allKeys = allKeys.concat(Keys)
      }

      if (NextMarker) {
        nextMarker = NextMarker
      } else {
        moreResults = false
      }
    }

    if (!allKeys || allKeys.length === 0) {
      console.log(
        `No keys in your account in region ${process.env.AWS_REGION}.`
      )
    } else {
      const keysWithRotation = await Promise.all(
        allKeys.map(async (key: any) => {
          try {
            // https://docs.aws.amazon.com/kms/latest/APIReference/API_GetKeyRotationStatus.html
            const { KeyRotationEnabled } = await kms.getKeyRotationStatus({ KeyId: key.KeyId }).promise()
            return {
              id: key.KeyId,
              arn: key.KeyArn,
              rotation_enabled: KeyRotationEnabled
            }
          } catch (e) {
            // Typical error is permission denied
            return {
              id: key.KeyId,
              arn: key.KeyArn,
              rotation_enabled: 'permission denied'
            }
          }
        })
      )
      
      console.log(columnify(keysWithRotation))
      await Promise.all([
        R3sSdk.addExecutionTabularRows(keysWithRotation),
        // R3sSdk.uploadFile(),
      ])
    }
  } catch (e) {
    console.log(e.message)
  }

  process.exit()
})()
