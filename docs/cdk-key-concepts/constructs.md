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
