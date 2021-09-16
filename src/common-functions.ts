import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';
// for development, use account/region from cdk cli
export const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

export const CAS_PERMISSION_BOUNDARY_NAME = 'cas-infrastructure/permission-boundary-policy';

export function getPermissionsBoundaryArn(): string {
  return iam.ManagedPolicy.fromManagedPolicyName(
    new cdk.Stack(),
    'cas-infrastructure-permission-boundary',
    CAS_PERMISSION_BOUNDARY_NAME).managedPolicyArn;
}