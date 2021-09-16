# Infrastructure As Code

Infrastructure As Code (IaC) gives us a way to manage the provisioning of our infrastructure resources as code. Making our deployment and configuration process of physical and virtual equipment faster and reliably repeatable. Typically there are two types of IaC, declarative (functional) and imperative (procedural). We will discuss the differences in more depth shortly.

=== "CloudFormation"
    ```yaml linenums="1"
    Resources:
        myTopic:
            Type: 'AWS::SNS::Topic'
            Properties:
                TopicName: my-cool-topic
        myQueue:
            Type: 'AWS::SQS::Queue'
            Properties:
                QueueName: my-cool-queue
                UpdateReplacePolicy: Delete
                DeletionPolicy: Delete
        mySnsSubscription:
            Type: 'AWS::SNS::Subscription'
            Properties:
                Protocol: sqs
                TopicArn: !Ref myTopic
                Endpoint: !GetAtt 
                    - myQueue
                    - Arn
        mylambdaServiceRole:
            Type: 'AWS::IAM::Role'
            Properties:
                AssumeRolePolicyDocument:
                    Statement:
                    - Action: 'sts:AssumeRole'
                        Effect: Allow
                        Principal:
                        Service: lambda.amazonaws.com
                    Version: 2012-10-17
                ManagedPolicyArns:
                    - !Join 
                    - ''
                    - - 'arn:'
                        - !Ref 'AWS::Partition'
                        - ':iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
        mylambdaServiceRoleDefaultPolicy:
            Type: 'AWS::IAM::Policy'
            Properties:
                PolicyDocument:
                    Statement:
                    - Action:
                        - 'sqs:ReceiveMessage'
                        - 'sqs:ChangeMessageVisibility'
                        - 'sqs:GetQueueUrl'
                        - 'sqs:DeleteMessage'
                        - 'sqs:GetQueueAttributes'
                        Effect: Allow
                        Resource: !GetAtt 
                        - myQueue
                        - Arn
                    Version: 2012-10-17
                PolicyName: mylambdaServiceRoleDefaultPolicy
                Roles:
                    - !Ref mylambdaServiceRole
        mylambda:
            Type: 'AWS::Lambda::Function'
            Properties:
                Code:
                    S3Bucket: !Ref WHATEVER_BUCKET_YOU_UPLOADED_LAMBDA_TO
                    S3Key: !Ref KEY_TO_REFERENCE_LAMBDA
                Role: !GetAtt 
                    - mylambdaServiceRole
                    - Arn
                Environment:
                    Variables:
                    QUEUE_ARN: !GetAtt 
                        - myQueue
                        - Arn
                    QUEUE_NAME: !GetAtt 
                        - myQueue
                        - QueueName
                Handler: empty-queue.handler
                Runtime: python3.8
                DependsOn:
                    - mylambdaServiceRoleDefaultPolicy
                    - mylambdaServiceRole
        mylambdaSqsEvent:
            Type: 'AWS::Lambda::EventSourceMapping'
            Properties:
                FunctionName: !Ref mylambda
                EventSourceArn: !GetAtt 
                    - myQueue
                    - Arn
    ```

=== "Terraform"
    ```json linenums="1"
    terraform {
        required_providers {
            aws = {
            source = "hashicorp/aws"
            version = "3.58.0"
            }
        }
    }

    provider "aws" {
        region = "us-east-2"
    }

    resource "aws_sns_topic" "user_updates" {
        name = "user-updates-topic"
    }

    resource "aws_sqs_queue" "terraform_queue" {
        name                      = "terraform-example-queue"
    }

    resource "aws_sns_topic_subscription" "user_updates_sqs_target" {
        topic_arn = "arn:aws:sns:us-west-2:432981146916:user-updates-topic"
        protocol  = "sqs"
        endpoint  = "arn:aws:sqs:us-west-2:432981146916:terraform-queue-too"
    }

    resource "aws_iam_role" "iam_for_lambda" {
        name = "iam_for_lambda"

        assume_role_policy = <<EOF
        {
        "Version": "2012-10-17",
        "Statement": [
            {
            "Action": "sts:AssumeRole",
            "Principal": {
                "Service": "lambda.amazonaws.com"
            },
            "Effect": "Allow",
            "Sid": ""
            }
        ]
        }
        EOF
    }

    resource "aws_lambda_function" "test_lambda" {
        filename      = "empty-queue.py"
        function_name = "handler"
        role          = aws_iam_role.iam_for_lambda.arn
        handler       = "empty-queue.handler"

        source_code_hash = filebase64sha256("lambda_function_payload.zip")

        runtime = "nodejs12.x"

        environment {
                variables = {
                foo = "bar"
            }
        }
    }
    ```

=== "CDK"
    ```typescript linenums="1"
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
    ```

=== "Lambda Code"
    ```python linenums="1"
    import json
    import logging
    import os
    import boto3
    from __future__ import print_function

    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    QUEUE_ARN = os.getenv('QUEUE_ARN')
    QUEUE_NAME = os.getenv('QUEUE_NAME')
    LOGGER = logging.getLogger(__name__)
    LOGGER.setLevel(logging.DEBUG)

    sqs = boto3.resource('sqs')

    def handler(event, context):
        LOGGER.info("Recieved event: " + json.dumps(event, indent=2))
        for record in event['Records']:
            print("test")
            payload = record["body"]
            print(str(payload))

    ```