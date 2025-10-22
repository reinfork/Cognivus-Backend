describe("Passport Config", () => {
  let passport

  beforeEach(() => {
    jest.resetModules()
    // Import passport config after modules are reset
    passport = require("../../config/passport")
  })

  describe("Passport Initialization", () => {
    it("should export passport instance", () => {
      expect(passport).toBeDefined()
      expect(passport.constructor.name).toBe("Authenticator")
    })

    it("should have use method for strategies", () => {
      expect(typeof passport.use).toBe("function")
    })

    it("should have authenticate method", () => {
      expect(typeof passport.authenticate).toBe("function")
    })

    it("should have initialize method", () => {
      expect(typeof passport.initialize).toBe("function")
    })

    it("should have session method", () => {
      expect(typeof passport.session).toBe("function")
    })

    it("should be a valid Express middleware", () => {
      const initMiddleware = passport.initialize()
      expect(typeof initMiddleware).toBe("function")
    })
  })

  describe("Google Strategy Registration", () => {
    it("should have GoogleStrategy registered", () => {
      const strategies = passport._strategies
      expect(strategies).toBeDefined()
      expect(strategies["google"]).toBeDefined()
    })

    it("should have correct strategy name", () => {
      const strategies = passport._strategies
      expect(strategies["google"].name).toBe("google")
    })
  })
})
