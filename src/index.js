module.exports = function () {
  return {
    visitor: {
      Identifier(path) {
        // Example transformation: rename all identifiers 'foo' to 'bar'
        if (path.node.name === 'foo') {
          path.node.name = 'bar';
        }
      },
    },
  };
};
