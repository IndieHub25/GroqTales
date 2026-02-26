// Jest setup file
// This file runs after the test framework is initialized

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
  AuthOptions: {},
}));

// Mock mongoose
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue(true),
    connection: {
      ...Object.assign(
        Object.create(Object.getPrototypeOf(actualMongoose.connection)),
        actualMongoose.connection,
        { close: jest.fn().mockResolvedValue(true) }
      ),
    },  };
});

// Mock dbConnect
jest.mock('@/lib/dbConnect', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
}));

// Suppress console logs during tests unless needed
// Suppress console output during tests; individual tests can still spy/restore
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'debug').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});