import assert from 'assert'
import columnify from 'columnify'
import AWS from 'aws-sdk'
import R3sSdk from '@risk3sixty/extension-sdk'
import { /* exponentialBackoff, */ WorkbookHandler } from './utils'
;(async function webAppFirewalls() {
  try {
    assert(process.env.AWS_ACCESS_KEY_ID, 'AWS key should be available')
    assert(process.env.AWS_SECRET_ACCESS_KEY, 'AWS secret should be available')
    assert(process.env.AWS_REGION, 'AWS region should be provided')

    const elb = new AWS.ELBv2({ region: process.env.AWS_REGION })

    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ELBv2.html#describeLoadBalancers-property
    //
    const [{ LoadBalancers }, { TargetGroups }] = await Promise.all([
      elb.describeLoadBalancers().promise(),
      elb.describeTargetGroups().promise(),
    ])

    const loadBalancerArnTargetGroupsMap = TargetGroups?.reduce(
      (obj: any, group: AWS.ELBv2.TargetGroup) => {
        group.LoadBalancerArns?.forEach((elbArn) => {
          obj[elbArn] = obj[elbArn] || []
          obj[elbArn].push(group)
        })
        return obj
      },
      {}
    )
    const loadBalancersWithTargetGroups =
      LoadBalancers?.map((balancer) => {
        try {
          assert(balancer.LoadBalancerArn, 'load balancer ARN not present')
          return {
            LoadBalancerName: balancer.LoadBalancerName,
            DNSName: balancer.DNSName,
            CreatedTime: balancer.CreatedTime,
            State: balancer.State?.Code,
            Type: balancer.Type,
            AvailabilityZones: balancer.AvailabilityZones?.map(
              (z) => `${z.ZoneName || 'No zone'} (${z.SubnetId || 'No subnet'})`
            ).join('\n'),
            IpAddressType: balancer.IpAddressType,
            TargetGroups: loadBalancerArnTargetGroupsMap[
              balancer.LoadBalancerArn
            ]
              .map(
                (g: any) =>
                  `TargetGroupName: ${g.TargetGroupName} -- Protocol: ${g.Protocol} -- Port: ${g.Port}`
              )
              .join('\n'),
          }
        } catch (err) {
          console.error(`Error parsing balancer`, err)
        }
      }).filter((b) => !!b) || []

    WorkbookHandler.addSheet(
      loadBalancersWithTargetGroups as any[],
      'ELB Load Balancers'
    )
    await Promise.all([
      R3sSdk.addExecutionTabularRows(loadBalancersWithTargetGroups),
      R3sSdk.uploadFile(WorkbookHandler.getXlsx(), `elb_load_balancers.xlsx`),
    ])
    console.log(columnify(loadBalancersWithTargetGroups))
  } catch (err) {
    console.error(`Error getting web app firewalls`, err)
  } finally {
    process.exit()
  }
})()
