// chai.should() works by installing a `should` getter on Object.prototype, so
// every value in the suite gains it at runtime. That is invisible to
// TypeScript, which otherwise reports "Property 'should' does not exist" on
// every assertion in the suite.
//
// Typed as any rather than chai's Assertion: the point is to make the entry
// point resolve, not to typecheck the assertion chains, and chai exports
// Assertion as a value rather than a type. Property access on a primitive
// resolves against its wrapper interface rather than Object, so each one has
// to be listed separately.

declare global {
  interface Object {
    should: any;
  }
  interface Number {
    should: any;
  }
  interface String {
    should: any;
  }
  interface Boolean {
    should: any;
  }
  interface Array<T> {
    should: any;
  }
  interface Function {
    should: any;
  }
}

export {};
