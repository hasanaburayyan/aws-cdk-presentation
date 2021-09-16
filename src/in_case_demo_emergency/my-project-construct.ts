import * as cdk from '@aws-cdk/core';
import { MyCodeBuildConstruct } from './codebuild';
import { devEnv } from '../common-functions';
import { MyPipelineConstruct } from './pipeline';
import { MyRepositoryConstruct } from './repository-construct';

export class MyProject extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    const myStack = new cdk.Stack(this, 'pipeline-stack', { env: devEnv });

    const repositoryConstruct = new MyRepositoryConstruct(myStack, 'my-repository-stuff');

    const codeBuildProject = new MyCodeBuildConstruct(myStack, 'my-codebuild-project');
    new MyPipelineConstruct(myStack, 'my-codepipeline', repositoryConstruct, codeBuildProject);
  }
}