import assert from 'assert'
import columnify from 'columnify'
import AWS from 'aws-sdk'
import moment from 'moment'
import { listGroupPolicies } from './awsPolicies'
import { exponentialBackoff } from './utils'
;(async function userAccessList() {
  assert(process.env.AWS_ACCESS_KEY_ID, 'AWS key should be available')
  assert(process.env.AWS_SECRET_ACCESS_KEY, 'AWS secret should be available')

  const iam = new AWS.IAM()

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html#getAccountAuthorizationDetails-property
  const {
    UserDetailList,
  }: AWS.IAM.GetAccountAuthorizationDetailsResponse = await exponentialBackoff(
    async () =>
      await iam.getAccountAuthorizationDetails({ MaxItems: 1e3 }).promise()
  )

  if (UserDetailList) {
    const users = await Promise.all(
      UserDetailList.map(async (u: any) => {
        const groupPolicies: string[] = await Promise.all(
          u.GroupList.map(
            async (group: string) => await listGroupPolicies(group)
          )
        )

        return {
          // path: u.Path,
          user: u.UserName,
          user_id: u.UserId,
          // arn: u.Arn,
          created: moment(u.CreateDate).format('MMM Do, YYYY h:mm a'),
          groups: u.GroupList.join(', '),
          group_policies: groupPolicies.flat(1).join(', '),
          user_policies: u.UserPolicyList.map((p: any) => p.PolicyName).join(
            ', '
          ),
          attached_managed_policies: u.AttachedManagedPolicies.map(
            (p: any) => p.PolicyName
          ).join(', '),
        }
      })
    )

    console.log(columnify(users))
  }

  process.exit()
})()
