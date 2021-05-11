import assert from 'assert'
import columnify from 'columnify'
import AWS from 'aws-sdk'
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
    const loadBalancersWithTargetGroups = LoadBalancers?.map((balancer) => {
      assert(balancer.LoadBalancerArn, 'load balancer ARN not present')
      return {
        ...balancer,
        targetGroups: loadBalancerArnTargetGroupsMap[balancer.LoadBalancerArn],
      }
    })

    // TODO: filter relevant columns and endpoints and send back in
    // meaningful export for evidence request upload
    // console.log(columnify(devices))
    console.log(JSON.stringify(loadBalancersWithTargetGroups, null, 2))
  } catch (err) {
    console.error(`Error getting web app firewalls`, err)
  } finally {
    process.exit()
  }
})()
