import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';

export class MyFirstAspect implements cdk.IAspect {
  private PREFIX = 'cas';
  private permissionBoundaryArn: string;

  constructor(permissionsBoundaryArn: string) {
    this.permissionBoundaryArn = permissionsBoundaryArn;
  }

  public visit(node: cdk.IConstruct) {
    if (node instanceof iam.CfnRole) {
      node.addPropertyOverride('RoleName', `${this.PREFIX}-${node.path}`);
      node.addPropertyOverride('PermissionsBoundary', this.permissionBoundaryArn);
    }
  }
}