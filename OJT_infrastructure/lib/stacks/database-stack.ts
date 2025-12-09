import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface DatabaseStackProps extends cdk.StackProps {
  appName: string;
  vpc: ec2.IVpc;
}

export class DatabaseStack extends cdk.Stack {
  public readonly dbInstance: rds.DatabaseInstance;
  public readonly dbSecret: secretsmanager.ISecret;
  public readonly dbSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const dbName = process.env.DB_NAME || 'ojtdb';

    // Database credentials secret
    this.dbSecret = new secretsmanager.Secret(this, 'DBSecret', {
      secretName: `${props.appName}-db-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: process.env.DB_USERNAME || 'admin',
        }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: 16,
      },
    });

    // Security Group for RDS
    this.dbSecurityGroup = new ec2.SecurityGroup(this, 'DBSecurityGroup', {
      vpc: props.vpc,
      securityGroupName: `${props.appName}-rds-sg`,
      description: 'Security group for RDS MySQL - allows Lambda access',
      allowAllOutbound: true,
    });

    // Allow from VPC (Lambda in private subnet)
    this.dbSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(3306),
      'Allow MySQL access from VPC'
    );

    // Allow from anywhere (for development - Query Editor, local tools)
    this.dbSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3306),
      'Allow MySQL access from anywhere (dev only)'
    );

    // RDS MySQL Instance - FREE TIER ELIGIBLE
    this.dbInstance = new rds.DatabaseInstance(this, 'MySQLInstance', {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO // Free Tier: 750 hours/month
      ),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC, // Public for Query Editor access
      },
      securityGroups: [this.dbSecurityGroup],
      credentials: rds.Credentials.fromSecret(this.dbSecret),
      databaseName: dbName,
      allocatedStorage: 20, // Free Tier: 20GB
      maxAllocatedStorage: 20, // Keep at 20GB for Free Tier
      multiAz: false,
      publiclyAccessible: true, // For Query Editor and local tools
      deletionProtection: false,
      backupRetention: cdk.Duration.days(1),
      preferredBackupWindow: '03:00-04:00',
      preferredMaintenanceWindow: 'sun:04:00-sun:05:00',
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Easy cleanup for dev
      storageType: rds.StorageType.GP2,
    });

    // Parameter Store for database endpoint
    new cdk.aws_ssm.StringParameter(this, 'DBEndpointParameter', {
      parameterName: `/${props.appName}/db/endpoint`,
      stringValue: this.dbInstance.dbInstanceEndpointAddress,
      description: 'RDS MySQL endpoint',
    });

    // Outputs
    new cdk.CfnOutput(this, 'DBEndpoint', {
      value: this.dbInstance.dbInstanceEndpointAddress,
      description: 'Database endpoint',
      exportName: `${props.appName}-DBEndpoint`,
    });

    new cdk.CfnOutput(this, 'DBPort', {
      value: '3306',
      description: 'Database port',
    });

    new cdk.CfnOutput(this, 'DBSecretArn', {
      value: this.dbSecret.secretArn,
      description: 'Database credentials secret ARN',
      exportName: `${props.appName}-DBSecretArn`,
    });

    new cdk.CfnOutput(this, 'DBName', {
      value: dbName,
      description: 'Database name',
      exportName: `${props.appName}-DBName`,
    });

    new cdk.CfnOutput(this, 'DBSecurityGroupId', {
      value: this.dbSecurityGroup.securityGroupId,
      description: 'RDS Security Group ID',
      exportName: `${props.appName}-DBSecurityGroupId`,
    });
  }
}
