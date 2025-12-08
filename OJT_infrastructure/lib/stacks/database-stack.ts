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
  public readonly dbCluster: rds.DatabaseCluster;
  public readonly dbSecret: secretsmanager.ISecret;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

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
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DBSecurityGroup', {
      vpc: props.vpc,
      description: 'Security group for RDS SQL Server',
      allowAllOutbound: true,
    });

    dbSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(1433),
      'Allow SQL Server access from VPC'
    );

    // RDS SQL Server Cluster (Aurora doesn't support SQL Server, using RDS instance)
    const dbInstance = new rds.DatabaseInstance(this, 'SQLServerInstance', {
      engine: rds.DatabaseInstanceEngine.sqlServerEx({
        version: rds.SqlServerEngineVersion.VER_15_00_4236_7_V1, // SQL Server 2019
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO  // Cost optimization: ~$15/month vs $54/month for t3.small
      ),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [dbSecurityGroup],
      credentials: rds.Credentials.fromSecret(this.dbSecret),
      databaseName: process.env.DB_NAME || 'demoaws',
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      multiAz: false, // Set to true for production
      publiclyAccessible: false,
      deletionProtection: false, // Set to true for production
      backupRetention: cdk.Duration.days(1), // Cost optimization: 1 day vs 7 days
      preferredBackupWindow: '03:00-04:00',
      preferredMaintenanceWindow: 'sun:04:00-sun:05:00',
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
    });

    // Parameter Store for database endpoint
    new cdk.aws_ssm.StringParameter(this, 'DBEndpointParameter', {
      parameterName: `/${props.appName}/db/endpoint`,
      stringValue: dbInstance.dbInstanceEndpointAddress,
      description: 'RDS SQL Server endpoint',
    });

    // Outputs
    new cdk.CfnOutput(this, 'DBEndpoint', {
      value: dbInstance.dbInstanceEndpointAddress,
      description: 'Database endpoint',
      exportName: `${props.appName}-DBEndpoint`,
    });

    new cdk.CfnOutput(this, 'DBSecretArn', {
      value: this.dbSecret.secretArn,
      description: 'Database credentials secret ARN',
      exportName: `${props.appName}-DBSecretArn`,
    });

    new cdk.CfnOutput(this, 'DBName', {
      value: process.env.DB_NAME || 'demoaws',
      description: 'Database name',
      exportName: `${props.appName}-DBName`,
    });
  }
}
