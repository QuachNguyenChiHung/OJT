/**
 * Deploy Configuration
 * Centralized config for all deployment scripts
 */
require('dotenv').config();

module.exports = {
  // AWS Configuration
  aws: {
    region: process.env.AWS_REGION || 'ap-southeast-1',
    accountId: process.env.AWS_ACCOUNT_ID || '',
  },

  // Application
  app: {
    name: process.env.APP_NAME || 'OJT-Ecommerce',
    environment: process.env.ENVIRONMENT || 'dev',
  },

  // Lambda Layer
  layer: {
    name: 'OJT-Ecommerce-SharedLayer',
    description: 'Shared dependencies for OJT E-commerce Lambda functions',
    runtime: 'nodejs20.x',
  },

  // 11 Lambda Modules
  modules: {
    auth: {
      folder: 'auth',
      lambdaName: 'OJT-Ecommerce-AuthModule',
      description: 'Auth: login, signup, logout, me',
    },
    products: {
      folder: 'products',
      lambdaName: 'OJT-Ecommerce-ProductsModule',
      description: 'Products: CRUD, search, filters',
    },
    'product-details': {
      folder: 'product-details',
      lambdaName: 'OJT-Ecommerce-ProductDetailsModule',
      description: 'Product Details: CRUD, images',
    },
    cart: {
      folder: 'cart',
      lambdaName: 'OJT-Ecommerce-CartModule',
      description: 'Cart: add, get, update, remove',
    },
    orders: {
      folder: 'orders',
      lambdaName: 'OJT-Ecommerce-OrdersModule',
      description: 'Orders: CRUD, status, filters',
    },
    categories: {
      folder: 'categories',
      lambdaName: 'OJT-Ecommerce-CategoriesModule',
      description: 'Categories: CRUD, search',
    },
    brands: {
      folder: 'brands',
      lambdaName: 'OJT-Ecommerce-BrandsModule',
      description: 'Brands: CRUD',
    },
    banners: {
      folder: 'banners',
      lambdaName: 'OJT-Ecommerce-BannersModule',
      description: 'Banners: CRUD, toggle',
    },
    ratings: {
      folder: 'ratings',
      lambdaName: 'OJT-Ecommerce-RatingsModule',
      description: 'Ratings: get, stats, create',
    },
    users: {
      folder: 'users',
      lambdaName: 'OJT-Ecommerce-UsersModule',
      description: 'Users: getAll, getById, updateProfile',
    },
    images: {
      folder: 'images',
      lambdaName: 'OJT-Ecommerce-ImagesModule',
      description: 'Images: upload to S3',
    },
    database: {
      folder: 'database',
      lambdaName: 'OJT-Ecommerce-DatabaseModule',
      description: 'Database: setup, migrations',
    },
  },

  // Paths
  paths: {
    lambdaRoot: '../OJT_lambda',
    buildDir: './build',
    layerDir: './build/layer',
  },

  // Shared dependencies for Layer
  sharedDependencies: {
    'bcryptjs': '^2.4.3',
    'jsonwebtoken': '^9.0.2',
    'uuid': '^9.0.0',
    'mysql2': '^3.6.5',
    'busboy': '^1.6.0',
  },
};
