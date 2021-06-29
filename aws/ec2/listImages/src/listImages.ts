import assert from 'assert'
import columnify from 'columnify'
import AWS from 'aws-sdk'
import dayjs from 'dayjs'
import R3sSdk from '@risk3sixty/extension-sdk'
import stringify from 'csv-stringify'

async function generateCsv(arrayOfObjects: any[]): Promise<string> {
  return new Promise((resolve, reject) => {
    stringify(
      arrayOfObjects,
      {
        header: true,
        columns: Object.keys(arrayOfObjects[0] || {}),
      },
      function (err: any, data: any) {
        if (err) return reject(err)
        resolve(data)
      }
    )
  })
}

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
          public: i.Public ? 'true' : 'false',
          state: i.State,
          created: dayjs(i.CreationDate).format('MMM D, YYYY h:mm a'),
        }
      })

      const csvData = await generateCsv(images)
      await Promise.all([
        R3sSdk.addExecutionTabularRows(images),
        R3sSdk.uploadFile(csvData, 'ec2-images.csv'),
      ])
      console.log(columnify(images))
    }
  } catch (e) {
    console.log(e.message)
  }

  process.exit()
})()
