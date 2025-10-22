# Backend Unit Tests

This directory contains comprehensive unit tests for the backend application, organized by component type.

## Test Structure

```
backend/src/test/
├── controllers/     # Controller tests (13 files)
├── utils/          # Utility function tests
├── helpers/        # Helper function tests
├── middleware/     # Middleware tests
├── models/         # Model tests
└── README.md       # This file
```

## Test Coverage

### Controllers (13 test files)
- **auth.test.js** - Authentication endpoints (register, login, profile, logout, Google OAuth)
- **users.test.js** - User management CRUD operations
- **students.test.js** - Student management with user creation
- **lecturers.test.js** - Lecturer management with user creation
- **classes.test.js** - Class management with lecturer filtering
- **courses.test.js** - Course management with file uploads
- **grades.test.js** - Grade management with report files
- **levels.test.js** - Level management
- **programs.test.js** - Program management
- **prices.test.js** - Price management
- **teacher_level.test.js** - Teacher-level assignments
- **course_files.test.js** - Course file retrieval
- **report_files.test.js** - Report file retrieval

### Utils (1 test file)
- **auth.test.js** - Authentication utilities (password hashing, JWT operations)

### Helpers (2 test files)
- **fields.test.js** - Field selection helpers for database queries
- **payload.test.js** - Payload transformation and validation

### Middleware (2 test files)
- **auth.test.js** - JWT authentication middleware
- **storage.test.js** - File storage operations (upload, delete, URLs)

### Models (2 test files)
- **course.test.js** - Course file model operations
- **reports.test.js** - Report file model operations

## Running Tests

### Run All Tests
```bash
# From backend directory
npm test

# Or using npx
npx jest
```

### Run Tests by Category

#### Controllers Only
```bash
npx jest src/test/controllers/
```

#### Utils Only
```bash
npx jest src/test/utils/
```

#### Helpers Only
```bash
npx jest src/test/helpers/
```

#### Middleware Only
```bash
npx jest src/test/middleware/
```

#### Models Only
```bash
npx jest src/test/models/
```

### Run Specific Test File
```bash
# Run auth controller tests
npx jest src/test/controllers/auth.test.js

# Run auth utils tests
npx jest src/test/utils/auth.test.js

# Run payload helper tests
npx jest src/test/helpers/payload.test.js
```

### Run Tests with Coverage
```bash
# All tests with coverage
npm test -- --coverage

# Specific category with coverage
npx jest src/test/controllers/ --coverage

# Specific file with coverage
npx jest src/test/utils/auth.test.js --coverage
```

### Run Tests in Watch Mode
```bash
# Watch all tests
npm test -- --watch

# Watch specific category
npx jest src/test/controllers/ --watch

# Watch specific file
npx jest src/test/utils/auth.test.js --watch
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
- **Test Environment**: Node.js
- **Test Pattern**: `**/test/**/*.test.js`
- **Setup File**: `jest.setup.js`
- **Coverage Collection**: From `src/` excluding test files and migrations
- **Mock Setup**: Global mocks for external dependencies

### Global Mocks (`jest.setup.js`)
- **Supabase**: Mocked database client
- **bcryptjs**: Mocked password hashing
- **jsonwebtoken**: Mocked JWT operations
- **Storage**: Mocked file operations
- **Helpers**: Mocked field and payload functions

## Test Features

### Mocking Strategy
- **Database**: All Supabase operations mocked
- **File System**: Storage operations mocked
- **External APIs**: No real network calls
- **Environment**: Configurable test environments

### Test Types
- **Unit Tests**: Individual function testing
- **Integration Tests**: Component interaction testing
- **Error Tests**: Failure scenario testing
- **Security Tests**: Input validation and sanitization
- **Performance Tests**: Load and concurrency testing

### Coverage Goals
- **Controllers**: 100% coverage (all endpoints tested)
- **Utils**: 100% coverage (all utility functions)
- **Helpers**: 100% coverage (all transformation functions)
- **Middleware**: 100% coverage (all middleware functions)
- **Models**: 100% coverage (all model operations)

## Test Results

### Expected Test Counts
- **Controllers**: ~150+ tests across 13 files
- **Utils**: ~20+ tests
- **Helpers**: ~50+ tests
- **Middleware**: ~40+ tests
- **Models**: ~30+ tests
- **Total**: ~290+ individual test cases

### Test Categories
1. **Success Cases**: Normal operation scenarios
2. **Error Cases**: Database, network, and validation errors
3. **Edge Cases**: Boundary conditions and unusual inputs
4. **Security Cases**: Input validation and sanitization
5. **Integration Cases**: Component interaction testing

## Troubleshooting

### Common Issues

#### 1. Module Not Found Errors
```bash
# Ensure you're in the backend directory
cd backend

# Check if all dependencies are installed
npm install

# Verify test file paths are correct
ls src/test/controllers/
```

#### 2. Mock Issues
```bash
# Clear Jest cache
npx jest --clearCache

# Restart test runner
npm test -- --watch
```

#### 3. Environment Issues
```bash
# Check Node version
node --version

# Verify environment variables
echo $NODE_ENV
```

#### 4. Coverage Issues
```bash
# Run with verbose coverage
npx jest --coverage --verbose

# Check specific file coverage
npx jest src/controllers/auth.js --coverage
```

### Debug Mode
```bash
# Run tests with debug output
NODE_ENV=test npm test -- --verbose

# Run specific test with debugging
npx jest src/test/controllers/auth.test.js --verbose
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Backend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: npm test -- --coverage
      - run: npm run test:ci
```

### Coverage Reporting
```bash
# Generate coverage report
npm test -- --coverage --coverageReporters=html

# View coverage in browser
open coverage/lcov-report/index.html
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Mock External Dependencies**: Don't call real APIs or databases
3. **Test Error Cases**: Always test failure scenarios
4. **Use Descriptive Names**: Test names should explain what they test
5. **Keep Tests Fast**: Avoid slow operations in tests
6. **Regular Updates**: Update tests when code changes

## Contributing

When adding new features:
1. Add corresponding tests in appropriate directory
2. Follow existing naming conventions
3. Include success, error, and edge cases
4. Update this README if adding new test categories
5. Ensure all tests pass before committing
