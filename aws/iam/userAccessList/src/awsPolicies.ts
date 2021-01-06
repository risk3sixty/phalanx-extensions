import AWS from 'aws-sdk'
import { exponentialBackoff } from './utils'

const iam = new AWS.IAM()

export async function listGroupPolicies(group: string): Promise<string[]> {
  const [inlinePolicies, managedPolicies] = await Promise.all([
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html#listGroupPolicies-property
    exponentialBackoff(
      async () =>
        await iam
          .listGroupPolicies({ GroupName: group, MaxItems: 1e3 })
          .promise()
    ),
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html#listAttachedGroupPolicies-property
    exponentialBackoff(
      async () =>
        await iam
          .listAttachedGroupPolicies({ GroupName: group, MaxItems: 1e3 })
          .promise()
    ),
  ])

  return [
    ...inlinePolicies.PolicyNames,
    ...managedPolicies.AttachedPolicies.map((p: any) => p.PolicyName),
  ]
}

// export async function getGroupPolicyDocument(
//   group: string,
//   policy: string
// ): Promise<string> {
//   // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html#getGroupPolicy-property
//   const {
//     // GroupName,
//     // PolicyName,
//     PolicyDocument,
//   }: AWS.IAM.GetGroupPolicyResponse = await exponentialBackoff(
//     async () =>
//       await iam
//         .getGroupPolicy({ GroupName: group, PolicyName: policy })
//         .promise()
//   )
//   return PolicyDocument
// }
