module.exports = function ({ types: t }) {
  return {
    visitor: {
      Program(path) {
        const extractedArraysAndObjects = [];

        // Function to check if all elements in an array are primitives
        const areAllPrimitives = (node) => {
          if (t.isArrayExpression(node)) {
            return node.elements.every((el) => areAllPrimitives(el));
          }
          if (t.isObjectExpression(node)) {
            return node.properties.every(
              (prop) => t.isObjectProperty(prop) && areAllPrimitives(prop.value)
            );
          }
          return t.isLiteral(node) && !t.isTemplateLiteral(node); // Check if it's a primitive (including strings, numbers, booleans)
        };

        path.traverse({
          JSXAttribute(innerPath) {
            if (!t.isJSXExpressionContainer(innerPath.node.value)) return;

            const expr = innerPath.node.value.expression;

            // Check if the expression is an object or array
            if (!t.isObjectExpression(expr) && !t.isArrayExpression(expr))
              return;

            // Ensure all properties or elements are primitives
            if (!areAllPrimitives(expr)) return;

            const componentName = '_hoist_attr';

            const uniqueVarName = innerPath.scope.generateUidIdentifier(
              `${componentName}_${innerPath.node.name.name}`
            );
            extractedArraysAndObjects.push({
              identifier: uniqueVarName,
              expression: expr,
            });

            // Replace the original object or array with the new identifier
            innerPath.node.value = t.jSXExpressionContainer(uniqueVarName);
          },
        });

        // Insert all new variable declarations at the top of the module
        extractedArraysAndObjects.forEach(({ identifier, expression }) => {
          path.node.body.unshift(
            t.variableDeclaration('const', [
              t.variableDeclarator(identifier, expression),
            ])
          );
        });
      },
    },
  };
};
