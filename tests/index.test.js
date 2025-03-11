const babel = require('@babel/core');
const plugin = require('../src/index');

describe('Babel Plugin', () => {
  it('should rename identifier "foo" to "bar"', () => {
    const inputCode = `const foo = 'Hello, world!';\nconsole.log(foo);`;
    const outputCode = `const bar = 'Hello, world!';\nconsole.log(bar);`;

    const { code } = babel.transformSync(inputCode, {
      plugins: [plugin],
    });

    expect(code).toBe(outputCode);
  });

  it('should not change other identifiers', () => {
    const inputCode = `const baz = 'Hello, world!';\nconsole.log(baz);`;
    const outputCode = `const baz = 'Hello, world!';\nconsole.log(baz);`;

    const { code } = babel.transformSync(inputCode, {
      plugins: [plugin],
    });

    expect(code).toBe(outputCode);
  });
});
