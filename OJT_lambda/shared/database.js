// Database utilities for Lambda functions
const { RDSDataService } = require('@aws-sdk/client-rds-data');

const rdsData = new RDSDataService({ region: process.env.AWS_REGION });

const executeStatement = async (sql, parameters = []) => {
  const params = {
    resourceArn: process.env.DB_CLUSTER_ARN,
    secretArn: process.env.DB_SECRET_ARN,
    database: process.env.DB_NAME,
    sql,
    parameters,
  };

  try {
    const response = await rdsData.executeStatement(params);
    return response;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const formatRecords = (records) => {
  if (!records || records.length === 0) return [];
  
  return records.map(record => {
    const obj = {};
    record.forEach((field, index) => {
      const key = Object.keys(field)[0];
      obj[key] = field[key];
    });
    return obj;
  });
};

module.exports = {
  executeStatement,
  formatRecords,
};
