# babel-plugin-jsx-attribute-to-const

A Babel plugin that intelligently transforms specified JSX attributes into constants, 
aims to enhance performance of your React components. 
This plugin targets inline object and array definitions, which, when used directly in JSX, 
can lead to unnecessary re-renders and affect performance.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Examples](#examples)
- [Contributing](#contributing)

## Installation

You can install the plugin via npm or yarn:

```bash
npm install --save-dev babel-plugin-jsx-attribute-to-const
```

or

```bash
yarn add --dev babel-plugin-jsx-attribute-to-const
```

## Usage

To use the plugin, add it to your Babel configuration file (e.g., `.babelrc` or `babel.config.js`):

```json
{
  "presets": ["@babel/preset-react"],
  "plugins": ["babel-plugin-jsx-attribute-to-const"]
}
```

## Options

This plugin does not have any configurable options currently. It automatically extracts JSX attributes that are defined as primitives, objects, or arrays into constants.

## Examples

### Basic Usage

Given the following JSX:

```jsx
const MyComponent = () => {
  return <Box box-padding={['m', 'l@large']} />;
};
```

After transformation, it will become:

```jsx
const _hoist_attr_box_padding = ['m', 'l@large'];
const MyComponent = () => {
  return <Box box-padding={_hoist_attr_box_padding} />;
};
```

### Nested Objects and Arrays

This plugin also handles nested structures:

Input:

```jsx
const MyComponent = () => {
  return (
    <Box style={{ width: { size: 100, values: [100, 200] }, height: 200 }} />
  );
};
```

Output:

```jsx
const _hoist_attr_style = { width: { size: 100, values: [100, 200] }, height: 200 };
const MyComponent = () => {
  return <Box style={_hoist_attr_style} />;
};
```

### Handling Non-Primitives

If an attribute contains non-primitive values, it remains unchanged. For example:

Input:

```jsx
const MyComponent = (props) => {
  return <Box box-padding={{ size: props.size }} />;
};
```

Output remains the same:

```jsx
const MyComponent = (props) => {
  return <Box box-padding={{ size: props.size }} />;
};
```

## Contributing

Contributions are welcome! Feel free to open issues, submit pull requests, or suggest features.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.
