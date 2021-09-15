# What is AWS CDK?

AWS Cloud Development Kit (CDK) is an opensource software development framework used to define our Infrastructure as Code (IaC). Using CDK allows us to use familiar programming languages
to provision our AWS Resources. At its core CDK makes use of AWS CloudFormation in order to deploy our AWS resources. This makes having some level of CloudFormation understanding
very useful as you continue to create your CDK application templates.

*Important Note:* Keep in mind, though CDK uses CloudFormation we are NOT writing CloudFormation templates in Typescript or Python. We are writing CDK code that happens to 
use CloudFormation for deployment.

## CDK vs. Pure CloudFormation
This is a loaded topic, which we will discuss at length all through this repo. For now from a high level view here are some key benefits of choosing CDK.

### Imperative vs. Declarative
As IaC becomes more popular many topics surrounding have been highly debated. One of those that we will discuss at length is Imperative programming vs. Declarative programming.
Both Imperative and Declarative programming are paradigms that can be followed when we are writing code. To think about how these paradigms differ we can consider the following:
- Declarative Programming:
    - Is an expression of logic that does not describe a control flow.
    - Often more easily understood
    - "Is what we want"
- Imperative Programming:
    - Uses statements to change a program's state.
    - Finer grain control over execution
    - "Is how to get what we want"

CDK is often referred to as an Imperative tool, and at first glance that is the easiest way to view it. Though really CDK is a declarative tool that is broadened by the use of
imperative programming languages that we used to create our CDK definitions. The idea of using an imperative language to create declarative templates may be a little strange at 
first, however we will soon see the simplicity behind the concept and what benefits we gain by using it.

### Language Choices
CDK currently supports:
- Fully Supported:
    - TypeScript
- Supported With Experimental Features:
    - Python
    - Java
    - C#
- Developer Preview Available:
    - GO
    
*Important Note:* Only Typescript is fully supported with all CDK features. As well it is the ONLY language that has a testing framework we can use to test our code before
deploying it.

### Overview of Benefits
One of the most exciting benefits about CDK is the speed and agility it gives us to create complex AWS Resources. Lets take this example from AWS
```typescript
export class MyEcsConstructStack extends core.Stack {
  constructor(scope: core.App, id: string, props?: core.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "MyVpc", {
      maxAzs: 3 // Default is all AZs in region
    });

    const cluster = new ecs.Cluster(this, "MyCluster", {
      vpc: vpc
    });

    // Create a load-balanced Fargate service and make it public
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "MyFargateService", {
      cluster: cluster, // Required
      cpu: 512, // Default is 256
      desiredCount: 6, // Default is 1
      taskImageOptions: { image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample") },
      memoryLimitMiB: 2048, // Default is 512
      publicLoadBalancer: true // Default is false
    });
  }
}
```

The above code snippet produces a CloudFormation template of over 500 lines and 50 resources. [CloudFormation Template HERE](https://github.com/awsdocs/aws-cdk-guide/blob/main/doc_source/my_ecs_construct-stack.yaml)

You may also note we did not have to create any IAM roles or policies, that is because CDK will use least privilege principles to generate Roles and Policies for us. 
Though if we desired defining or adding to the policies we can easily with CDK.

Some other advantages consist of:
- Use of logic when defining infrastructure (if statements, loops, etc)
- Object-oriented techniques that our chosen language provides the tool set for
- Define high level abstractions, that can be shared across the organization
- Creating a reusable and sharable infrastructure library
- Testing infrastructure before we ever deploy
- IDE Intelli-sense support
