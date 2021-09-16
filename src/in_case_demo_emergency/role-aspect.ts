import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';

export class RoleAspect implements cdk.IAspect {
  private PREFIX = 'cas';
  private permissionBoundaryArn: string;
  private counter: number;

  constructor(permissionsBoundaryArn: string) {
    this.permissionBoundaryArn = permissionsBoundaryArn;
    this.counter = 0;
  }

  public visit(node: cdk.IConstruct) {
    if (node instanceof iam.CfnRole) {
      node.addPropertyOverride('RoleName', `${this.PREFIX}-${this.counter}`);
      node.addPropertyOverride('PermissionsBoundary', this.permissionBoundaryArn);
      this.counter++;
    }
  }
}