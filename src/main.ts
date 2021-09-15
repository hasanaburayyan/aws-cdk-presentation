import { App } from '@aws-cdk/core';
import { PubSubModel } from './sample-pub-sub';


// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new PubSubModel(app, 'my-pub-sub-stack', { env: devEnv });


app.synth();