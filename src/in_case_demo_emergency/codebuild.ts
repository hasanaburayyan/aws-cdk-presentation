import * as codebuild from '@aws-cdk/aws-codebuild';
import * as cdk from '@aws-cdk/core';

export class MyCodeBuildConstruct extends cdk.Construct {
  private _codeBuildProject: codebuild.Project;
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    this._codeBuildProject = new codebuild.Project(this, 'build-project', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: [
          {
            install: {
              commands: [
                'echo INSTALLING!!',
              ],
            },
          },
          {
            build: {
              commands: [
                'echo Building!!',
                '$S3_BUCKET',
              ],
            },
          },
          {
            post_build: {
              commands: [
                'echo POST BUILDING!!!',
              ],
            },
          },
        ],
        artifacts: [
          {
            files: [
              'docs/*',
            ],
          },
        ],
      }),
    });
  }
  public get codeBuildProject() : codebuild.Project {
    return this._codeBuildProject;
  }
}