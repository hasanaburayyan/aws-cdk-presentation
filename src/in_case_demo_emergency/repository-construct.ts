import * as codecommit from '@aws-cdk/aws-codecommit';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';

export class MyRepositoryConstruct extends cdk.Construct {
  public repo: codecommit.Repository;
  public bucket: s3.Bucket;

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    this.bucket = new s3.Bucket(this, 'my-web-pages-bucket', {
      bucketName: 'hsa29-super-cool-bucket',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.repo = new codecommit.Repository(this, 'my-code-repo', {
      repositoryName: 'cdk-demo',
      description: 'hopefully it works',
    });

    new cdk.CfnOutput(this, 'bucket-url', {
      value: this.bucket.bucketWebsiteUrl,
    });
  }
}