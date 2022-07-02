module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-extended/all'],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
};
