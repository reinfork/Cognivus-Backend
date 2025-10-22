process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "test-client-id"
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "test-client-secret"
process.env.GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback"

// Provide a global mock for Supabase used in tests. Tests expect both
// `require('.../config/supabase').from` (a jest.fn) and
// `require('.../config/supabase').storage.from` to exist and be mockable.
jest.mock("./src/config/supabase", () => {
  const fromMock = jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  }))

  const storageFromMock = jest.fn(() => ({
    upload: jest.fn().mockResolvedValue({ error: null }),
    remove: jest.fn().mockResolvedValue({ error: null }),
    getPublicUrl: jest.fn().mockResolvedValue({ data: { publicUrl: "" }, error: null }),
    createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: "" }, error: null }),
  }))

  return {
    from: fromMock,
    storage: {
      from: storageFromMock,
    },
    auth: {
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  }
})

// Global user model mock removed - individual tests will handle their own user model mocking

// Make Date.now deterministic in tests so generated paths match expected fixtures.
// Use an incrementing counter so consecutive calls produce unique but predictable values.
let _now = 1234567890
jest.spyOn(Date, "now").mockImplementation(() => {
  _now += 1
  return _now
})

// Mock bcryptjs
jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn().mockResolvedValue(true), // Default valid password
}))

// Mock jsonwebtoken
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn().mockReturnValue({ id: 1, username: 'testuser' }), // Default valid token
}))

jest.mock("dotenv", () => ({
  config: jest.fn(),
}))
