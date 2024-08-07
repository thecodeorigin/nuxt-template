import fs from 'node:fs'
import type { TypeAliasDeclaration } from 'typescript'
import { EmitHint, NewLineKind, ScriptTarget, SyntaxKind, createPrinter, createSourceFile, factory } from 'typescript'
import { $ } from 'execa'

(async function () {
  const filePath = 'server/types/supabase.ts'

  await $`supabase gen types typescript --local --schema public > ${filePath}`

  const generatedTypes = fs.readFileSync(filePath, 'utf-8')

  const typeAst = createSourceFile(filePath, generatedTypes, ScriptTarget.ESNext)

  const newAst = factory.updateSourceFile(
    typeAst,
    [
      factory.createTypeAliasDeclaration(
        [factory.createToken(SyntaxKind.ExportKeyword)],
        factory.createIdentifier('Json'),
        undefined,
        factory.createUnionTypeNode([
          factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
          factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
          factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword),
          factory.createLiteralTypeNode(factory.createNull()),
          factory.createTypeLiteralNode([factory.createIndexSignature(
            undefined,
            [factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('key'),
              undefined,
              factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
              undefined,
            )],
            factory.createKeywordTypeNode(SyntaxKind.AnyKeyword),
          )]),
          factory.createArrayTypeNode(factory.createTypeLiteralNode([factory.createIndexSignature(
            undefined,
            [factory.createParameterDeclaration(
              undefined,
              undefined,
              factory.createIdentifier('key'),
              undefined,
              factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
              undefined,
            )],
            factory.createKeywordTypeNode(SyntaxKind.AnyKeyword),
          )])),
        ]),
      ),
      ...typeAst.statements.filter((statement) => {
        const _temp = statement as TypeAliasDeclaration

        return !(statement.kind === SyntaxKind.TypeAliasDeclaration && _temp?.name?.escapedText === 'Json')
      }),
    ],
  )

  const printer = createPrinter({
    newLine: NewLineKind.LineFeed,
  })

  const outputText = printer.printNode(EmitHint.Unspecified, newAst, newAst)

  fs.writeFileSync(filePath, outputText)

  await $`eslint ${filePath} --fix`
})()
