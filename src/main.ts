import { App, Aspects } from '@aws-cdk/core';
import { getPermissionsBoundaryArn } from './common-functions';
import { MyProject } from './in_case_demo_emergency/my-project-construct';
import { RoleAspect } from './in_case_demo_emergency/role-aspect';

const app = new App();

new MyProject(app, 'my-project');

Aspects.of(app).add(new RoleAspect(getPermissionsBoundaryArn()));

app.synth();