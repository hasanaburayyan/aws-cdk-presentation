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
