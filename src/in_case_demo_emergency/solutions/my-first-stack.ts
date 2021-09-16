import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codecommit from '@aws-cdk/aws-codecommit';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { MyFirstAspect } from '../in_case_demo_emergency/solutions/my-first-aspect';

export class MyFirstStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const myRepo = new codecommit.Repository(this, 'my-code-repo', {
      repositoryName: 'cdk-demo',
      description: 'dont fail me now demo!',
    });

    const myBucket = new s3.Bucket(this, 'my-bucket', {
      bucketName: 'hsa29-cool-demo-bucket',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    let codeBuildProject = new codebuild.Project(this, 'my-code-build-project', {
      source: codebuild.Source.codeCommit({ repository: myRepo }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        environmentVariables: {
          BUCKET_NAME: {
            value: myBucket.bucketName,
            type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          },
        },
      },
    });

    myBucket.grantReadWrite(codeBuildProject);
    // const permissionBoundaryArn: string = iam.ManagedPolicy.fromManagedPolicyName(this, 'permission-boundary', 'cas-infrastructure/cas-permissions-boundary').managedPolicyArn;
    cdk.Aspects.of(this).add(new MyFirstAspect('arn:aws:iam::893236348299:policy/cas-infrastructure/permission-boundary-policy'));
  }
}