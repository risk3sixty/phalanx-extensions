import assert from 'assert'
import columnify from 'columnify'
import AWS from 'aws-sdk'
import moment from 'moment'
import R3sSdk from '@risk3sixty/extension-sdk'

;(async function listImages() {
  assert(process.env.AWS_ACCESS_KEY_ID, 'AWS key should be available')
  assert(process.env.AWS_SECRET_ACCESS_KEY, 'AWS secret should be available')

  const ec2 = new AWS.EC2()

  try {
    var params = { 
      Owners: [
        'self'
      ]
    }
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeImages-property
    const { Images } = await ec2.describeImages(params).promise()

    if (!Images || Images.length === 0) {
      console.log(
        `No images found in your account.`
      )
    } else {
      const images = Images.map(i => {
        return {
          id: i.ImageId,
          name: i.Name,
          description: i.Description,
          type: i.ImageType,
          public: i.Public,
          state: i.State,
          created: moment(i.CreationDate).format('MMM Do, YYYY h:mm a'),
        }
      })

      console.log(columnify(images))
      await Promise.all([
        R3sSdk.addExecutionTabularRows(images),
        // R3sSdk.uploadFile(),
      ])
    }
  } catch (e) {
    console.log(e.message)
  }

  process.exit()
})()
