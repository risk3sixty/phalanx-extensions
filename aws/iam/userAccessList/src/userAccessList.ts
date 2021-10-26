import assert from 'assert'
import columnify from 'columnify'
import AWS from 'aws-sdk'
import moment from 'moment'
import R3sSdk from '@risk3sixty/extension-sdk'
import { listAccountPolicies, listGroupPolicies } from './awsPolicies'
import { exponentialBackoff, WorkbookHandler } from './utils'

interface PolicyObj {
  [key: string]: AWS.IAM.Policy
}

;(async function userAccessList() {
  assert(process.env.AWS_ACCESS_KEY_ID, 'AWS key should be available')
  assert(process.env.AWS_SECRET_ACCESS_KEY, 'AWS secret should be available')

  const iam = new AWS.IAM()

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html#getAccountAuthorizationDetails-property
  const { UserDetailList }: AWS.IAM.GetAccountAuthorizationDetailsResponse =
    await exponentialBackoff(
      async () =>
        await iam.getAccountAuthorizationDetails({ MaxItems: 1e3 }).promise()
    )

  if (UserDetailList) {
    let policies: string[] = []
    const users = await Promise.all(
      UserDetailList.map(async (u: any) => {
        const groupPolicies: string[] = await Promise.all(
          u.GroupList.map(
            async (group: string) => await listGroupPolicies(group)
          )
        )

        const groupPolAry = groupPolicies.flat(1)
        const userPolAry = u.UserPolicyList.map((p: any) => p.PolicyName)
        const attachedPolAry = u.AttachedManagedPolicies.map(
          (p: any) => p.PolicyName
        )

        // append to policies to use in API to get policies and their
        // respective descriptions
        policies = [
          ...policies,
          ...groupPolAry,
          ...userPolAry,
          ...attachedPolAry,
        ]

        return {
          // path: u.Path,
          user: u.UserName,
          user_id: u.UserId,
          // arn: u.Arn,
          created: moment(u.CreateDate).format('MMM D, YYYY h:mm a'),
          groups: u.GroupList.join(', '),
          group_policies: groupPolAry.join(', '),
          user_policies: userPolAry.join(', '),
          attached_managed_policies: attachedPolAry.join(', '),
        }
      })
    )

    WorkbookHandler.addSheet(users, 'User Access List')

    // get description of all policies in UAL and store in another sheet
    const uniquePolicies = [...new Set(policies)].sort()
    let allAccountPolicies = await listAccountPolicies()
    if (allAccountPolicies) {
      allAccountPolicies = await Promise.all(
        allAccountPolicies.map(async (pol: AWS.IAM.Policy) => {
          const { Policy }: AWS.IAM.GetPolicyResponse =
            await exponentialBackoff(async () => {
              assert(pol.Arn, 'ARN not available for policy')
              return await iam.getPolicy({ PolicyArn: pol.Arn }).promise()
            })
          return { ...pol, ...Policy }
        })
      )

      const policiesByName: PolicyObj = allAccountPolicies.reduce(
        (obj: PolicyObj, policy: AWS.IAM.Policy) => {
          assert(policy.PolicyName, 'policy name must exist')
          return { ...obj, [policy.PolicyName]: policy }
        },
        {}
      )
      WorkbookHandler.addSheet(
        uniquePolicies.map((p: string) => ({
          policy: p,
          // arn: policiesByName[p].Arn
          description: policiesByName[p].Description,
        })),
        'Policy Definitions'
      )
    }

    await Promise.all([
      R3sSdk.addExecutionTabularRows(users),
      R3sSdk.uploadFile(WorkbookHandler.getXlsx(), `user_access_list.xlsx`),
    ])
    console.log(columnify(users))
  }

  process.exit()
})()
