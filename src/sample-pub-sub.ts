import * as path from 'path';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaEventSources from '@aws-cdk/aws-lambda-event-sources';
import * as sns from '@aws-cdk/aws-sns';
import * as sqs from '@aws-cdk/aws-sqs';
import * as cdk from '@aws-cdk/core';

export class PubSubModel extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    let myTopic = new sns.Topic(this, 'my-topic', {
      topicName: 'my-cool-topic',
    });

    let myQueue = new sqs.Queue(this, 'my-sqs-queue', {
      queueName: 'my-cool-queue',
    });

    new sns.Subscription(this, 'my-sns-subscription', {
      topic: myTopic,
      protocol: sns.SubscriptionProtocol.SQS,
      endpoint: myQueue.queueArn,
    });

    let myLambda = new lambda.Function(this, 'my-lambda', {
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'empty-queue.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, './lambda_scripts'),
        {
          exclude: ['**', '!empty-queue.py'],
        },
      ),
      environment: {
        QUEUE_ARN: myQueue.queueArn,
        QUEUE_NAME: myQueue.queueName,
      },
    });

    myQueue.grantConsumeMessages(myLambda);
    myLambda.addEventSource(new lambdaEventSources.SqsEventSource(myQueue));
  }
}