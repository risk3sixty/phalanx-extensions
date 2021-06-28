import assert from 'assert'
import AWS, { CloudFront } from 'aws-sdk'
import columnify from 'columnify'
import R3sSdk from '@risk3sixty/extension-sdk'
import { exponentialBackoff, WorkbookHandler } from './utils'
;(async function listDistributions() {
  try {
    assert(process.env.AWS_ACCESS_KEY_ID, 'AWS key should be available')
    assert(process.env.AWS_SECRET_ACCESS_KEY, 'AWS secret should be available')

    const cf = new AWS.CloudFront()
    const { DistributionList }: CloudFront.Types.ListDistributionsResult =
      await exponentialBackoff(
        async () => await cf.listDistributions().promise()
      )
    if (DistributionList && DistributionList.Items) {
      const tabularDistributions = DistributionList.Items.map((dist) => {
        return {
          Id: dist.Id,
          Status: dist.Status,
          DomainName: dist.DomainName,
          Aliases: (dist.Aliases.Items || []).join('\n'),
          OriginDomainNames: dist.Origins.Items.map(
            (origin) => origin.DomainName
          ).join('\n'),
          Enabled: dist.Enabled,
          HttpVersion: dist.HttpVersion,
          IsIPV6Enabled: dist.IsIPV6Enabled,
          AliasICPRecordals: (dist.AliasICPRecordals || [])
            .map(
              (r) =>
                `${r.CNAME || 'No CNAME'} (${r.ICPRecordalStatus || 'N/A'})`
            )
            .join('\n'),
        }
      })

      WorkbookHandler.addSheet(tabularDistributions, 'Cloudfront Distributions')
      await Promise.all([
        R3sSdk.addExecutionTabularRows(tabularDistributions),
        R3sSdk.uploadFile(
          WorkbookHandler.getXlsx(),
          `cloudfront_distributions.xlsx`
        ),
      ])
      console.log(columnify(tabularDistributions))
    }
  } catch (err) {
    console.error(`Error getting distributions`, err)
  } finally {
    process.exit()
  }
})()
