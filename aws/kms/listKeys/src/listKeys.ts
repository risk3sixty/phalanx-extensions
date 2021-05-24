import assert from 'assert'
import columnify from 'columnify'
import AWS from 'aws-sdk'

;(async function listKeys() {
  assert(process.env.AWS_ACCESS_KEY_ID, 'AWS key should be available')
  assert(process.env.AWS_SECRET_ACCESS_KEY, 'AWS secret should be available')
  assert(process.env.AWS_REGION, 'AWS region should be provided')

  const kms = new AWS.KMS({ region: process.env.AWS_REGION })

  let allKeys:any = []
  let moreResults: boolean = true
  let nextMarker: string | undefined
  while (moreResults) {
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

  const keysWithRotation = await Promise.all(
    allKeys.map(async (key: any) => {
      try {
        const { KeyRotationEnabled } = await kms.getKeyRotationStatus({ KeyId: key.KeyId }).promise()
        return {
          ...key,
          KeyRotationEnabled
        }
      } catch (e) {
        // Typically permission denied for getting key rotation information,
        // but will handle all errors
        return { 
          ...key,
          KeyRotationEnabled: e.message
        }
      }
    })
  )
  
  // console.log(columnify(keysWithRotation))
  console.log(JSON.stringify(keysWithRotation, null, 2))

  process.exit()
})()
