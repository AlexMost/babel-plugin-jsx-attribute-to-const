const babel = require('@babel/core');
const plugin = require('../src/index');

const normalizeWhitespace = (code) => code.replace(/\s+/g, ' ').trim();

const transform = (code) => {
  return normalizeWhitespace(
    babel.transformSync(code, {
      plugins: [plugin],
      presets: ['@babel/preset-react'],
    }).code
  );
};

describe('babel-plugin-jsx-attribute-to-const', () => {
  test('transforms multiple attributes with array and object to constants', () => {
    const inputCode = `
      const MyComponent = () => {
        return (
          <Box
            box-padding={['m', 'l@large']}
            style={{ width: 100 }}
            customData={{ key: 'value' }}
          />
        );
      };
    `;

    const expectedOutput = normalizeWhitespace(`
      const _hoist_attr_customData = { key: 'value' };
      const _hoist_attr_style = { width: 100 };
      const _hoist_attr_boxPadding = ['m', 'l@large'];
      const MyComponent = () => {
        return /*#__PURE__*/React.createElement(Box, {
          "box-padding": _hoist_attr_boxPadding,
          style: _hoist_attr_style,
          customData: _hoist_attr_customData
        });
      };
    `);

    const outputCode = transform(inputCode);
    expect(outputCode).toEqual(expectedOutput);
  });

  test('should not extract template literals', () => {
    const inputCode = `
    const MyComponent = (props) => {
      return <Box box-padding={{ size: \`100-\${props.size}\`, color: 'blue' }} />;
    };
  `;

    const outputCode = transform(inputCode);
    const expectedOutput = normalizeWhitespace(`
    const MyComponent = props => {
      return /*#__PURE__*/React.createElement(Box, { "box-padding": { size: \`100-\${props.size}\`, color: 'blue' } });
    };
    `);
    expect(outputCode).toEqual(expectedOutput);
  });
});

describe('babel-plugin-jsx-attribute-to-const objects', () => {
  test('transforms simple object JSX attribute to constant', () => {
    const inputCode = `
      const MyComponent = () => {
        return <Box style={{ width: 100, height: 200 }} />;
      };
    `;

    const expectedOutput = normalizeWhitespace(`
      const _hoist_attr_style = { width: 100, height: 200 };
      const MyComponent = () => {
        return /*#__PURE__*/React.createElement(Box, {
        style: _hoist_attr_style
      });
    };
    `);

    const outputCode = transform(inputCode);
    expect(outputCode).toEqual(expectedOutput);
  });

  test('transforms nested simple object JSX attribute to constant', () => {
    const inputCode = `
      const MyComponent = () => {
        return <Box style={{ width: [100, 200], height: 200 }} />;
      };
    `;

    const expectedOutput = normalizeWhitespace(`
      const _hoist_attr_style = { width: [100, 200], height: 200 };
      const MyComponent = () => {
        return /*#__PURE__*/React.createElement(Box, {
        style: _hoist_attr_style
      });
    };
    `);

    const outputCode = transform(inputCode);
    expect(outputCode).toEqual(expectedOutput);
  });

  test('handles two components with overlapping attribute names', () => {
    const inputCode = `
      const FirstComponent = () => {
        return <Box boxPadding={{ size: 'small' }} />;
      };

      const SecondComponent = () => {
        return <Box boxPadding={{ size: 'large' }} />;
      };
    `;

    const outputCode = transform(inputCode);
    const expectedOutput = normalizeWhitespace(`
    const _hoist_attr_boxPadding2 = { size: 'large' };
    const _hoist_attr_boxPadding = { size: 'small' };
    const FirstComponent = () => {
      return /*#__PURE__*/React.createElement(Box, { boxPadding: _hoist_attr_boxPadding });
    };
    const SecondComponent = () => {
      return /*#__PURE__*/React.createElement(Box, { boxPadding: _hoist_attr_boxPadding2 });
    };
    `);
    expect(outputCode).toEqual(expectedOutput);
  });

  test('should not transform to constant if object has non-primitive value', () => {
    const inputCode = `
    const MyComponent = (props) => {
      return <Box box-padding={{ size: props.size, color: 'blue' }} />;
    };
  `;

    const expectedOutput = normalizeWhitespace(`
    const MyComponent = props => {
      return /*#__PURE__*/React.createElement(Box, { "box-padding": { size: props.size, color: 'blue' } });
    };
  `);

    const outputCode = transform(inputCode);
    expect(outputCode).toEqual(expectedOutput);
  });
});

describe('babel-plugin-jsx-attribute-to-const arrays', () => {
  test('transforms simple array JSX attribute to constant', () => {
    const inputCode = `
      const MyComponent = () => {
        return <Box box-padding={['m', 'l@large']} />;
      };
    `;

    const expectedOutput = normalizeWhitespace(`
      const _hoist_attr_boxPadding = ['m', 'l@large'];
      const MyComponent = () => {
        return /*#__PURE__*/React.createElement(Box, {
        "box-padding": _hoist_attr_boxPadding
      });
    };
    `);

    const outputCode = transform(inputCode);
    expect(outputCode).toEqual(expectedOutput);
  });

  test('should not transform to constant if array has no primitive value', () => {
    const inputCode = `
      const MyComponent = (props) => {
        return <Box box-padding={[props.m, 'l@large']} />;
      };
    `;

    const expectedOutput = normalizeWhitespace(`
    const MyComponent = props => {
      return /*#__PURE__*/React.createElement(Box, { "box-padding": [props.m, 'l@large'] });
    };
    `);

    const outputCode = transform(inputCode);
    expect(outputCode).toEqual(expectedOutput);
  });

  test('handles two components with overlapping attribute names', () => {
    const inputCode = `
      const FirstComponent = () => {
        return <Box boxPadding={['m', 'small' ]} />;
      };

      const SecondComponent = () => {
        return <Box boxPadding={['m','large' ]} />;
      };
    `;

    const outputCode = transform(inputCode);
    const expectedOutput = normalizeWhitespace(`
    const _hoist_attr_boxPadding2 = ['m', 'large'];
    const _hoist_attr_boxPadding = ['m', 'small'];
    const FirstComponent = () => {
      return /*#__PURE__*/React.createElement(Box, { boxPadding: _hoist_attr_boxPadding });
    };
    const SecondComponent = () => {
      return /*#__PURE__*/React.createElement(Box, { boxPadding: _hoist_attr_boxPadding2 });
    };
    `);
    expect(outputCode).toEqual(expectedOutput);
  });

  test('transforms nested simple arrays to constant', () => {
    const inputCode = `
      const MyComponent = () => {
        return <Box style={[{ width: [100, 200]},  {height: 200 }]} />;
      };
    `;

    const expectedOutput = normalizeWhitespace(`
    const _hoist_attr_style = [{ width: [100, 200] }, { height: 200 }];
    const MyComponent = () => {
      return /*#__PURE__*/React.createElement(Box, { style: _hoist_attr_style });
    };
    `);

    const outputCode = transform(inputCode);
    expect(outputCode).toEqual(expectedOutput);
  });
});
