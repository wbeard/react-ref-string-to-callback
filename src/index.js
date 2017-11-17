module.exports = function(babel) {
  const { types: t } = babel;

  return {
    visitor: {
      MemberExpression(path) {
        if (
          !t.isThisExpression(path.node.object.object) &&
          path.node.object.property !== 'refs'
        ) {
          return;
        }

        path.node.object = t.thisExpression();
      },
      JSXAttribute(path) {
        const name = path.node.name.name;
        const value = path.node.value.value;
        const type = path.node.value.type;

        if (
          name !== 'ref' ||
          (name === 'ref' && type === 'JSXExpressionContainer')
        ) {
          return;
        }

        const thisExp = t.thisExpression();
        const refId = t.identifier(value);
        const membExp = t.memberExpression(thisExp, refId);
        const refVal = t.identifier('el');
        const assignExp = t.assignmentExpression('=', membExp, refVal);
        const expression = t.expressionStatement(assignExp);
        const body = t.blockStatement([expression]);
        const params = [refVal];
        const arrowFunction = t.arrowFunctionExpression(params, body);
        const expContainer = t.jSXExpressionContainer(arrowFunction);

        path.node.value = expContainer;
      },
    },
  };
}
