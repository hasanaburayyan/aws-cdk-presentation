import { App } from '@aws-cdk/core';
import { devEnv } from './common-functions';
import { MyFirstStack } from './demo/my-first-stack';

const app = new App();

new MyFirstStack(app, 'my-first-stack', { env: devEnv });

app.synth();