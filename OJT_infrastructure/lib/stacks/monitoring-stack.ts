import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as cloudwatch_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface MonitoringStackProps extends cdk.StackProps {
  appName: string;
  apiId: string;
  alarmEmail?: string;
}

export class MonitoringStack extends cdk.Stack {
  public readonly dashboard: cloudwatch.Dashboard;

  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    // SNS Topic for alarms
    const alarmTopic = new sns.Topic(this, 'AlarmTopic', {
      displayName: `${props.appName} Alarms`,
      topicName: `${props.appName}-alarms`,
    });

    if (props.alarmEmail) {
      alarmTopic.addSubscription(
        new subscriptions.EmailSubscription(props.alarmEmail)
      );
    }

    // CloudWatch Dashboard
    this.dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: `${props.appName}-Dashboard`,
    });

    // API Gateway Metrics
    const apiMetric4xx = new cloudwatch.Metric({
      namespace: 'AWS/ApiGateway',
      metricName: '4XXError',
      dimensionsMap: {
        ApiId: props.apiId,
      },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const apiMetric5xx = new cloudwatch.Metric({
      namespace: 'AWS/ApiGateway',
      metricName: '5XXError',
      dimensionsMap: {
        ApiId: props.apiId,
      },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const apiLatency = new cloudwatch.Metric({
      namespace: 'AWS/ApiGateway',
      metricName: 'Latency',
      dimensionsMap: {
        ApiId: props.apiId,
      },
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    });

    const apiCount = new cloudwatch.Metric({
      namespace: 'AWS/ApiGateway',
      metricName: 'Count',
      dimensionsMap: {
        ApiId: props.apiId,
      },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    // Alarms
    const highErrorRateAlarm = new cloudwatch.Alarm(this, 'HighErrorRate', {
      metric: apiMetric5xx,
      threshold: 10,
      evaluationPeriods: 2,
      alarmDescription: 'Alert when 5XX errors exceed threshold',
      alarmName: `${props.appName}-High5XXErrors`,
    });
    highErrorRateAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alarmTopic));

    const highLatencyAlarm = new cloudwatch.Alarm(this, 'HighLatency', {
      metric: apiLatency,
      threshold: 2000, // 2 seconds
      evaluationPeriods: 2,
      alarmDescription: 'Alert when API latency is high',
      alarmName: `${props.appName}-HighLatency`,
    });
    highLatencyAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(alarmTopic));

    // Dashboard Widgets
    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'API Requests',
        left: [apiCount],
        width: 12,
      }),
      new cloudwatch.GraphWidget({
        title: 'API Errors',
        left: [apiMetric4xx, apiMetric5xx],
        width: 12,
      })
    );

    this.dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'API Latency',
        left: [apiLatency],
        width: 12,
      }),
      new cloudwatch.SingleValueWidget({
        title: 'Total Requests (5min)',
        metrics: [apiCount],
        width: 6,
      }),
      new cloudwatch.SingleValueWidget({
        title: 'Avg Latency (5min)',
        metrics: [apiLatency],
        width: 6,
      })
    );

    // Outputs
    new cdk.CfnOutput(this, 'DashboardUrl', {
      value: `https://console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=${this.dashboard.dashboardName}`,
      description: 'CloudWatch Dashboard URL',
    });

    new cdk.CfnOutput(this, 'AlarmTopicArn', {
      value: alarmTopic.topicArn,
      description: 'SNS Topic ARN for alarms',
    });
  }
}
