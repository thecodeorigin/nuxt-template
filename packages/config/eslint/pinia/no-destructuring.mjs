/**
 * @type {import('eslint').Rule.RuleModule}
 */
export const noDestructuringPiniaStore = {
  meta: {
    type: 'problem',
    hasSuggestions: true,
    docs: {
      description: 'disallow destructuring Pinia stores',
      category: 'convention',
    },
    messages: {
      noDestructuringPiniaStore: 'destructuring Pinia stores is not allowed.',
    },
  },
  create(context) {
    return {
      VariableDeclarator(node) {
        if (node.id.type === 'ObjectPattern' && node.init.type === 'CallExpression') {
          const callee = node.init.callee

          if (callee.name.startsWith('use') && callee.name.endsWith('Store')) {
            context.report({
              node: node.id,
              messageId: 'noDestructuringPiniaStore',
              suggest: [
                {
                  desc: 'replace with the camelCased store name to have a namespaced-style code',
                  fix(fixer) {
                    const storeName = callee.name.replace(/^use/, '').replace(/^\w/, c => c.toLowerCase())

                    return fixer.replaceText(node.id, storeName)
                  },
                },
              ],
            })
          }
        }
      },
    }
  },
}
