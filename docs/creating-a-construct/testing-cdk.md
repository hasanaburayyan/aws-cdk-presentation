# Testing CDK

## Sample Stack With Tags
```typescript
import * as cdk from "@aws-cdk/core";
import {RemovalPolicy} from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";

export class SampleStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        let myBucket = new s3.Bucket(this, 'super-cool-bucket', {
            bucketName: "my-super-cool-bucket",
            removalPolicy: RemovalPolicy.DESTROY,
            publicReadAccess: true
        });

        cdk.Tags.of(this).add("created-by", "me")
        cdk.Tags.of(this).add("contact-fax", "614-555-1122")
    }
}

```

## Testing The Stack
```typescript
import * as cdk from '@aws-cdk/core';
import '@aws-cdk/assert/jest';
import {expect as expectCDK, haveResource, haveResourceLike} from '@aws-cdk/assert';
import {SampleStack} from "../lib/sample-stack";

test('Check Tags', () => {
    // GIVEN
    const app = new cdk.App();
    
    // WHEN
    const stack: cdk.Stack = new SampleStack(app, 'my-test-stack')

    // THEN
    expectCDK(stack).to(haveResourceLike("AWS::S3::Bucket", {
        "Tags": [
            {
                "Key": "created-by"
            },
            {
                "Key": "contact-fax"
            }
        ]
    }))
});
```
