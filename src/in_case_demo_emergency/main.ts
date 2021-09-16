import { App, Aspects } from '@aws-cdk/core';
import { getPermissionsBoundaryArn } from '../common-functions';
import { MyProject } from './my-project-construct';
import { RoleAspect } from './role-aspect';

const app = new App();

new MyProject(app, 'my-project');

Aspects.of(app).add(new RoleAspect(getPermissionsBoundaryArn()));

app.synth();