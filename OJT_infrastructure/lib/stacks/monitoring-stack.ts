import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface MonitoringStackProps extends cdk.StackProps {
  appName: string;
  apiId: string;
  alarmEmail?: string; // Not used anymore, kept for compatibility
}

/**
 * Monitoring Stack - CloudWatch Logs & Dashboard (No SNS)
 * 
 * Log Groups for all services:
 * - API Gateway
 * - Lambda
 * - RDS
 * - VPC Flow
 * - CloudFront
 */
export class MonitoringStack extends cdk.Stack {
  public readonly dashboard: cloudwatch.Dashboard;

  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    // ========================================
    // CloudWatch Log Groups
    // ========================================

    // API Gateway Logs
    new logs.LogGroup(this, 'ApiGatewayLogs', {
      logGroupName: `/aws/apigateway/${props.appName}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // RDS Logs
    new logs.LogGroup(this, 'RDSLogs', {
      logGroupName: `/aws/rds/${props.appName}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // VPC Flow Logs
    new logs.LogGroup(this, 'VPCFlowLogs', {
      logGroupName: `/aws/vpc/${props.appName}-flow`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // CloudFront Logs
    new logs.LogGroup(this, 'CloudFrontLogs', {
      logGroupName: `/aws/cloudfront/${props.appName}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ========================================
    // CloudWatch Dashboard
    // ========================================
    this.dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: `${props.appName}-Dashboard`,
    });

    // API Gateway Metrics
    const apiRequests = new cloudwatch.Metric({
      namespace: 'AWS/ApiGateway',
      metricName: 'Count',
      dimensionsMap: { ApiId: props.apiId },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const api4xx = new cloudwatch.Metric({
      namespace: 'AWS/ApiGateway',
      metricName: '4XXError',
      dimensionsMap: { ApiId: props.apiId },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const api5xx = new cloudwatch.Metric({
      namespace: 'AWS/ApiGateway',
      metricName: '5XXError',
      dimensionsMap: { ApiId: props.apiId },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const apiLatency = new cloudwatch.Metric({
      namespace: 'AWS/ApiGateway',
      metricName: 'Latency',
      dimensionsMap: { ApiId: props.apiId },
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    });

    // Lambda Metrics
    const lambdaInvocations = new cloudwatch.Metric({
      namespace: 'AWS/Lambda',
      metricName: 'Invocations',
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const lambdaErrors = new cloudwatch.Metric({
      namespace: 'AWS/Lambda',
      metricName: 'Errors',
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const lambdaDuration = new cloudwatch.Metric({
      namespace: 'AWS/Lambda',
      metricName: 'Duration',
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    });

    // NAT Gateway Metrics
    const natBytes = new cloudwatch.Metric({
      namespace: 'AWS/NATGateway',
      metricName: 'BytesOutToDestination',
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    // Dashboard Widgets
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'API Gateway - Requests',
        left: [apiRequests],
        width: 8,
      }),
      new cloudwatch.GraphWidget({
        title: 'API Gateway - Errors',
        left: [api4xx, api5xx],
        width: 8,
      }),
      new cloudwatch.GraphWidget({
        title: 'API Gateway - Latency (ms)',
        left: [apiLatency],
        width: 8,
      })
    );

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Lambda - Invocations',
        left: [lambdaInvocations],
        width: 8,
      }),
      new cloudwatch.GraphWidget({
        title: 'Lambda - Errors',
        left: [lambdaErrors],
        width: 8,
      }),
      new cloudwatch.GraphWidget({
        title: 'Lambda - Duration (ms)',
        left: [lambdaDuration],
        width: 8,
      })
    );

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'NAT Gateway - Bytes Out',
        left: [natBytes],
        width: 12,
      }),
      new cloudwatch.SingleValueWidget({
        title: 'Total API Requests (5min)',
        metrics: [apiRequests],
        width: 6,
      }),
      new cloudwatch.SingleValueWidget({
        title: 'Lambda Errors (5min)',
        metrics: [lambdaErrors],
        width: 6,
      })
    );

    // Lambda Log Groups (11 modules created in ApiStack)
    const lambdaLogGroups = [
      `/aws/lambda/${props.appName}-AuthModule`,
      `/aws/lambda/${props.appName}-ProductsModule`,
      `/aws/lambda/${props.appName}-ProductDetailsModule`,
      `/aws/lambda/${props.appName}-CartModule`,
      `/aws/lambda/${props.appName}-OrdersModule`,
      `/aws/lambda/${props.appName}-CategoriesModule`,
      `/aws/lambda/${props.appName}-BrandsModule`,
      `/aws/lambda/${props.appName}-BannersModule`,
      `/aws/lambda/${props.appName}-RatingsModule`,
      `/aws/lambda/${props.appName}-UsersModule`,
      `/aws/lambda/${props.appName}-ImagesModule`,
    ];

    // Log Insights Widget - All Lambda Errors
    this.dashboard.addWidgets(
      new cloudwatch.LogQueryWidget({
        title: 'Lambda Errors (All Functions)',
        logGroupNames: lambdaLogGroups,
        queryLines: [
          'fields @timestamp, @logStream, @message',
          'filter @message like /ERROR|error|Error|Exception/',
          'sort @timestamp desc',
          'limit 50',
        ],
        width: 24,
        height: 6,
      })
    );

    // Log Insights Widget - Lambda Debug Logs
    this.dashboard.addWidgets(
      new cloudwatch.LogQueryWidget({
        title: 'Lambda Debug Logs (Recent)',
        logGroupNames: lambdaLogGroups,
        queryLines: [
          'fields @timestamp, @logStream, @message',
          'filter @message not like /START|END|REPORT/',
          'sort @timestamp desc',
          'limit 100',
        ],
        width: 24,
        height: 8,
      })
    );

    // ========================================
    // Outputs
    // ========================================
    new cdk.CfnOutput(this, 'DashboardUrl', {
      value: `https://${this.region}.console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=${this.dashboard.dashboardName}`,
      description: 'CloudWatch Dashboard URL',
    });

    new cdk.CfnOutput(this, 'LogGroups', {
      value: JSON.stringify({
        apiGateway: `/aws/apigateway/${props.appName}`,
        lambda: `/aws/lambda/${props.appName}-*`,
        rds: `/aws/rds/${props.appName}`,
        vpcFlow: `/aws/vpc/${props.appName}-flow`,
        cloudfront: `/aws/cloudfront/${props.appName}`,
      }),
      description: 'CloudWatch Log Groups',
    });

    new cdk.CfnOutput(this, 'ViewLogsCommand', {
      value: `aws logs tail /aws/lambda/${props.appName}-AuthModule --follow --region ${this.region}`,
      description: 'Command to tail Lambda logs',
    });
  }
}
