#!/usr/bin/env node
import 'source-map-support/register';
import {App} from 'aws-cdk-lib';
import {MessagingBotStack} from '../lib/stacks/messaging-bot-stack';

const app = new App();
new MessagingBotStack(app, 'ReplyCloneMessagingBot');
