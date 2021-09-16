import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipelineAction from '@aws-cdk/aws-codepipeline-actions';
import * as targets from '@aws-cdk/aws-events-targets';
import * as cdk from '@aws-cdk/core';
import { MyCodeBuildConstruct } from './codebuild';
import { MyRepositoryConstruct } from './repository-construct';

export class MyPipelineConstruct extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, repositoryConstruct: MyRepositoryConstruct, codeBuildConstruct: MyCodeBuildConstruct) {
    super(scope, id);

    const sourceOutput = new codepipeline.Artifact('source-output');

    const myPipeline = new codepipeline.Pipeline(this, 'my-pipeline', {
      crossAccountKeys: false,
      pipelineName: 'please-work-demo',
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipelineAction.CodeCommitSourceAction({
              actionName: 'source',
              output: sourceOutput,
              branch: 'main',
              repository: repositoryConstruct.repo,
            }),
          ],
        },
        {
          stageName: 'Build',
          actions: [
            new codepipelineAction.CodeBuildAction({
              actionName: 'build',
              input: sourceOutput,
              project: codeBuildConstruct.codeBuildProject,
              environmentVariables: {
                S3_BUCKET: {
                  type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
                  value: repositoryConstruct.bucket.bucketName,
                },
              },
            }),
          ],
        },
      ],
    });

    repositoryConstruct.bucket.grantReadWrite(codeBuildConstruct.codeBuildProject);
    repositoryConstruct.repo.onCommit('main-commit', {
      target: new targets.CodePipeline(myPipeline),
      branches: ['main'],
    });
  }
}