import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codecommit from '@aws-cdk/aws-codecommit';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';

export class MyFirstStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const myRepo = new codecommit.Repository(this, 'my-code-repo', {
      repositoryName: 'cdk-demo',
      description: 'dont fail me now demo!',
    });

    new codebuild.Project(this, 'my-code-build-project', {
      source: codebuild.Source.codeCommit({ repository: myRepo }),
      role: new iam.Role(this, 'build-role', {
        roleName: 'cas-my-build-role',
        permissionsBoundary: iam.ManagedPolicy.fromManagedPolicyName(this,
          'permission-boundary',
          'cas-infrastructure/permission-boundary-policy'),
        assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
      },
    });
  }
}