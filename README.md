# SETUP

Add .editorconfig file for vscode

Initialise node project

```
yarn init
```

## Create src folder and src/app.ts, src/types/index.ts files

app.ts file is entry point of the application

# LINTING

Linting is important as it ensures that code is standardized

Run the command to install linting dependencies

```
yarn add --dev typescript eslint prettier tslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier eslint-plugin-prettier
```

Create .eslintrc, .prettierrc .eslintignore tsconfig.json files

# TYPES

Add typings

Run

```
yarn add --dev @types/node @types/mongoose @types/agenda @types/express @types/jest @types/lodash
```

# TESTS

Add ts-jest jest for test environment

Run

```
yarn add --dev ts-jest jest
```

# RUNNING

Add the following devtools

Run

```
yarn add --dev husky lint-staged ts-node
```

Add jest.config.js, .lintstagedrc, nodemon.json files

Make changes to package.json scripts and hooks

# ENVIRONMENT

Add .env file

```
SERVER_PORT=?
NODE_ENV=?
JWT_SECRET=?
JWT_EXPIRY=? // '1d' '1m' etc
LOG_LEVEL=? // 'debug'
MONGO_DB_URI=? // eg 'mongodb://localhost:27017/test-db'
FILE_PATH=? // file upload folder eg '../.nodeapi_files', either add this folder to gitignore to avoid commit the folder or set the folder outside the project folder
AFRICASTALKING_API_KEY=? // SMS Getway Config, You can replace this with other sms getways eg twilio
AFRICASTALKING_USERNAME=?  // SMS Getway Config, You can replace this with other sms getways eg twilio
AFRICASTALKING_FROM=?  // SMS Getway Config, You can replace this with other sms getways eg twilio: NOTE: Remember to edit smsService implementation as well
PROJECT_NAME=? // Name of the project, shown in SMS
PROJECT_OTP_LENGTH=? // Length of OTP
PROJECT_OTP_EXPIRY=? // Duration before OTP expires
PROJECT_OTP_CHARACTER_SET=? // Characters used to generate OTP eg '0123456789abcdefghijklmnopqrstuvwxyz', NOTE: To prevent bruteforce use alphanumeric PROJECT_OTP_CHARACTER_SET, short PROJECT_OPT_EXPIRY and long PROJECT_OTP_LENGTH
```
# PRODUCTION

Add ecosystem.config.js file (Read more from PM2 documentation)

```
exports.apps = [
  {
    name: ?, // name of the process
    script: './build/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '4G',
    node_args: '--max_old_space_size=4096',
  },
];
```

To start
```
yarn serve
```

To stop
```
yarn stop
```