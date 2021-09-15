# CDK Core Concepts
The real potential behind CDK is unlocked when we have a solid understanding of some key concepts in CDK. Here we will review some of those concepts in order to comprehend how
we can make use of constructs, and the CDK construct tree.

## Constructs
Constructs are the basic building blocks of a CDK application. AWS describes constructs as representing a "cloud component" and encapsulates everything CloudFormation needs to
create the component. *Important Note:* Constructs can represent a single resource OR they can represent high level components consisting of multiple resources that span across
multiple accounts.

[More Construct Details Here](./constructs.md)

## Stacks
Stacks are the unit of deployment for CDK. Any resource that is deployed with CDK will be defined within the scope of a stack. CDK stacks are implemented using CloudFormation
Stacks, so they share the same limitations. There are currently no limits on the number of stacks we can define within our CDK app. Stacks can be managed through the use of
constructs as well.

[More Stack Details Here](./stacks.md)

## Construct Tree
CDK Constructs are managed via the use of the Construct Tree. The construct tree enables us to define constructs inside of other constructs. The tree will maintain the scope
for each construct. This data structure allows us to easily manage nested stacks, enforce stack deployment order, and even do some cool validation at synthesis time using 
existing or custom visitors.

[More Construct Details Here](./construct-tree.md)

## Aspects
Aspects allow us to apply some operation to all constructs within a scope. This is enabled by the Construct tree, since the tree maintains scope for all constructs, stacks,
and resources.

[More Aspect Details Here](./aspects.md)
