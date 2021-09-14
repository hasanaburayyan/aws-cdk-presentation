### Construct Levels:
The construct library includes 3 level of constructs available to us.
- L1 Cfn Resources
    - these constructs are very low level. They represent CloudFormation resources, and require you to explicitly configure all resource properties which requires a deep
      understanding of the CloudFormation resource model.
- L2 Intent based Resources
    - L2 constructs allow us to represent AWS resources in a higher-level context, where we focus on *intent-based* definitions. This is done via CDK's implementation of
      default boilerplate, and common best practice logic.
- L3 Patterns
    - The highest level of constructs are known as patterns. These are common tasks defined by AWS that involve multiple kinds resources.


#### Examples
##### Level 1 Construct CfnVPC
Here I create a level 1 vpc construct. This construct has 1 required property `cidrBlock` which you can see matches exactly with the required properties in CloudFormation for
VPC creation https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ec2-vpc.html.
```typescript
new ec2.CfnVPC(this, 'level1-vpc', {
            cidrBlock: "10.0.0.0/16"
  })
```
If we take a look at the construct tree produced by this we can see that only 1 resource is being created during synthesis of our CDK
```typescript
construct-tree
`-- my-new-stack
     `-- level1-vpc

```
##### Level 2 Construct VPC
Now from the same package `ec2` I will make a VPC using the level 2 construct. Note that this has 0 required properties
```typescript
new ec2.Vpc(this, 'level2-vpc', {
    
})
```
Unlike the level 1 construct we can see that this construct tree will create and manage MANY more AWS resources.
```typescript
construct-tree
`-- my-new-stack
     `-- level2-vpc
          |-- Resource
          |-- PublicSubnet1
          |    |-- Subnet
          |    |-- Acl
          |    |-- RouteTable
          |    |-- RouteTableAssociation
          |    |-- DefaultRoute
          |    |-- EIP
          |    `-- NATGateway
          |-- PublicSubnet2
          |    |-- Subnet
          |    |-- Acl
          |    |-- RouteTable
          |    |-- RouteTableAssociation
          |    |-- DefaultRoute
          |    |-- EIP
          |    `-- NATGateway
          |-- PublicSubnet3
          |    |-- Subnet
          |    |-- Acl
          |    |-- RouteTable
          |    |-- RouteTableAssociation
          |    |-- DefaultRoute
          |    |-- EIP
          |    `-- NATGateway
          |-- PrivateSubnet1
          |    |-- Subnet
          |    |-- Acl
          |    |-- RouteTable
          |    |-- RouteTableAssociation
          |    `-- DefaultRoute
          |-- PrivateSubnet2
          |    |-- Subnet
          |    |-- Acl
          |    |-- RouteTable
          |    |-- RouteTableAssociation
          |    `-- DefaultRoute
          |-- PrivateSubnet3
          |    |-- Subnet
          |    |-- Acl
          |    |-- RouteTable
          |    |-- RouteTableAssociation
          |    `-- DefaultRoute
          |-- IGW
          `-- VPCGW

```
##### Level 3 Construct (Pattern)
Here I am going to use a level 3 construct called ecs pattern `ApplicationLoadbalancedFargateService`
```typescript
new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'level3-ecs-pattern', {
            taskImageOptions: {
                image: ecs.ContainerImage.fromEcrRepository(
                    ecr.Repository.fromRepositoryName(this, 'my-nginx-repo', 'nginx')
                )
            }
        })
```
Now when we take a look at our construct tree we can see that many resources are being created here just like with the previous level 2 examples. The big
difference here is that this level 3 construct is creating resources from other libraries other than just the ecs package. We can see below the following:
- ecs (cluster, task, services)
- ec2 (load balancers, security groups, vpc, etc...)
- Cloudwatch (log groups)
```typescript
construct-tree
`-- my-new-stack
     |-- my-nginx-repo
     |-- level3-ecs-pattern
     |    |-- LB
     |    |    |-- Resource
     |    |    |-- SecurityGroup
     |    |    |    |-- Resource
     |    |    |    `-- to mynewstacklevel3ecspatternServiceSecurityGroup4E669D7C:80
     |    |    `-- PublicListener
     |    |         |-- Resource
     |    |         `-- ECSGroup
     |    |              `-- Resource
     |    |-- LoadBalancerDNS
     |    |-- ServiceURL
     |    |-- TaskDef
     |    |    |-- TaskRole
     |    |    |    `-- Resource
     |    |    |-- Resource
     |    |    |-- web
     |    |    |    `-- LogGroup
     |    |    |         `-- Resource
     |    |    `-- ExecutionRole
     |    |         |-- Resource
     |    |         `-- DefaultPolicy
     |    |              `-- Resource
     |    `-- Service
     |         |-- Service
     |         `-- SecurityGroup
     |              |-- Resource
     |              |-- from mynewstacklevel3ecspatternLBSecurityGroup2A462752:80
     `-- EcsDefaultClusterMnL3mNNYN
          |-- Resource
          `-- Vpc
               |-- Resource
               |-- PublicSubnet1
               |    |-- Subnet
               |    |-- Acl
               |    |-- RouteTable
               |    |-- RouteTableAssociation
               |    |-- DefaultRoute
               |    |-- EIP
               |    `-- NATGateway
               |-- PublicSubnet2
               |    |-- Subnet
               |    |-- Acl
               |    |-- RouteTable
               |    |-- RouteTableAssociation
               |    |-- DefaultRoute
               |    |-- EIP
               |    `-- NATGateway
               |-- PrivateSubnet1
               |    |-- Subnet
               |    |-- Acl
               |    |-- RouteTable
               |    |-- RouteTableAssociation
               |    `-- DefaultRoute
               |-- PrivateSubnet2
               |    |-- Subnet
               |    |-- Acl
               |    |-- RouteTable
               |    |-- RouteTableAssociation
               |    `-- DefaultRoute
               |-- IGW
               `-- VPCGW

```
##### BONUS Custom Constructs
*Please note this is purely an example and not an approved pattern that is ready for use*
We built a custom construct that we reused for deploying each component of our reference application
it creates a pipeline with a source, build, and deploy step. The deploy step will be done following the
AWS documentation for best practice Blue/Green deployments
```typescript
new RainmakersEcsDeploymentService(this,
            'my-blue-green-ecs-service',
            app,
            WARDROBE_BACKEND_ECS_DEFINITION,
            env,
            cluster
)
```
We can see our construct tree plans to deploy a vast array of different AWS resources.
```typescript
construct-tree
`-- my-new-stack
     |-- my-cluster
     |    |-- hsa29-my-fun-app-vpc
     |    |    |-- PrivateSubnet1
     |    |    `-- PrivateSubnet2
     |    `-- hsa29-my-fun-app-ecs-cluster
     |         |-- Resource
     |         `-- DefaultServiceDiscoveryNamespace
     |              `-- Resource
     `-- my-blue-green-ecs-service
          |-- wardrobe-backend-ecs-loadbalancer-stack
          |    |-- hsa29-my-fun-app-vpc
          |    |    |-- PrivateSubnet1
          |    |    |-- PrivateSubnet2
          |    |-- hsa29-my-fun-app-wardrobe-backend-security-group
          |    |    |-- Resource
          |    |    |-- from mynewstackmybluegreenecsservicewardrobebackendecsloadbalancerstackhsa29myfunappwardrobebackendsecuritygroup035AAFD5:80
          |    |    `-- from mynewstackmybluegreenecsservicewardrobebackendecsloadbalancerstackhsa29myfunappwardrobebackendsecuritygroup035AAFD5:8080
          |    |-- hsa29-my-fun-app-wardrobe-backend-alb
          |    |    |-- Resource
          |    |    |-- hsa29-my-fun-app-wardrobe-backend-albProdListener
          |    |    |    `-- Resource
          |    |    `-- hsa29-my-fun-app-wardrobe-backend-albTestListener
          |    |         `-- Resource
          |    |-- hsa29-my-fun-app-wardrobe-backend-blueGroup
          |    |    `-- Resource
          |    `-- hsa29-my-fun-app-wardrobe-backend-greenGroup
          |         `-- Resource
          |-- wardrobe-backend-ecs-service-stack
          |    |-- hsa29-my-fun-app-vpc
          |    |    |-- PrivateSubnet1
          |    |    |-- PrivateSubnet2
          |    |-- hsa29-my-fun-app-wardrobe-backend
          |    |-- wardrobe-backend-hsa29-ecsTaskRoleForWorkshop
          |    |    |-- Resource
          |    |    `-- DefaultPolicy
          |    |         `-- Resource
          |    |-- hsa29dummy-task-for-wardrobe-backend
          |    |    |-- Resource
          |    |    `-- hsa29-dummy-container-def-for-wardrobe-backend
          |    |-- hsa29-dummy-container-for-wardrobe-backend
          |    |    `-- Resource
          |    |-- hsa29-my-fun-app-wardrobe-backend-app-task-def
          |    |    |-- Resource
          |    |    `-- hsa29-my-fun-app-wardrobe-backend-container
          |    |-- hsa29-my-fun-app-demo-app-log-group
          |    |    `-- Resource
          |    |-- hsa29-my-fun-app-wardrobe-backend-cloudmap
          |    `-- hsa29-my-fun-app-wardrobe-backend-service
          |         |-- Service
          |         `-- CloudmapService
          |              `-- Resource
          |-- wardrobe-backend-ecs-cloudwatch-stack
          |    |-- hsa29-my-fun-app-blue4xxErrors
          |    |    `-- Resource
          |    `-- green4xxErrors
          |         `-- Resource
          |-- wardrobe-backend-ecs-code-deploy-stack
          |    |-- hsa29-my-fun-app-wardrobe-backend-ecs-codedeploy
          |    |    `-- Resource
          |    `-- codeDeployServiceRole
          |         `-- Resource
          |-- wardrobe-backend-ecs-code-deploy-groups-stack
          |    |-- hsa29-my-fun-app-ecs-codedeploy-custom-lambda-role
          |    |    |-- Resource
          |    |    `-- DefaultPolicy
          |    |         `-- Resource
          |    |-- hsa29-my-fun-app-createDeploymentGroupLambda
          |    |    |-- Code
          |    |    |    |-- Stage
          |    |    |    `-- AssetBucket
          |    |    |         `-- Notifications
          |    |    `-- Resource
          |    |-- AssetParameters
          |    |    `-- d2afc96a67784738f55fa36aabb3e2fcfc18ddcae4383342d8386a7c5052db84
          |    |         |-- S3Bucket
          |    |         |-- S3VersionKey
          |    |         `-- ArtifactHash
          |    |-- customEcsDeploymentGroup
          |    |    `-- Default
          |    `-- hsa29-my-fun-app-wardrobe-backend-ecs-deployment-group
          `-- wardrobe-backend-ecs-pipeline-stack
               |-- hsa29-my-fun-app-repository
               |    |-- mynewstackmybluegreenecsservicewardrobebackendecspipelinestackhsa29myfunappwardrobebackendcodepipeline2053DEC1EventRule
               |    |    `-- Resource
               |    `-- hsa29-my-fun-app-on-commit
               |         `-- Resource
               |-- hsa29-my-fun-app-wardrobe-backend-ecr
               |-- hsa29-my-fun-app-wardrobe-backend-code-build
               |    |-- Role
               |    |    |-- Resource
               |    |    `-- DefaultPolicy
               |    |         `-- Resource
               |    `-- Resource
               |-- hsa29-my-fun-app-wardrobe-backend-code-pipeline
               |    |-- ArtifactsBucket
               |    |    |-- Notifications
               |    |    `-- Resource
               |    |-- Role
               |    |    |-- Resource
               |    |    |-- DefaultPolicy
               |    |    |    `-- Resource
               |    |-- Resource
               |    |-- Source
               |    |    `-- hsa29-my-fun-app-CodeCommit_Source
               |    |         `-- CodePipelineActionRole
               |    |              |-- Resource
               |    |              `-- DefaultPolicy
               |    |                   `-- Resource
               |    |-- EventsRole
               |    |    |-- Resource
               |    |    `-- DefaultPolicy
               |    |         `-- Resource
               |    |-- Build
               |    |    `-- hsa29-my-fun-app-CodeBuild_Project
               |    |         `-- CodePipelineActionRole
               |    |              |-- Resource
               |    |              |-- DefaultPolicy
               |    |              |    `-- Resource
               |    `-- Deploy
               |         `-- Deploy
               |              `-- CodePipelineActionRole
               |                   |-- Resource
               |                   |-- DefaultPolicy
               |                   |    `-- Resource
               |-- hsa29-my-fun-app-wardrobe-backend-ecsBlueGreenCodeRepo
               `-- hsa29-my-fun-app-wardrobe-backend-ecsBlueGreenLBDns

```
