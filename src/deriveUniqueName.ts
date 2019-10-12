import camelcase from 'camelcase'
import * as path from 'path'
import ts from 'typescript'

import sanitizeIdentifier from './sanitizeIdentifier'


const FileLevelValueSymbol = ts.SymbolFlags.Variable
  | ts.SymbolFlags.Function
  | ts.SymbolFlags.Class
  | ts.SymbolFlags.Enum


export default function deriveUniqueName (
  node: ts.Node, program: ts.Program, pascalCase = false,
): ts.Identifier {

  let name = deriveNameFromSourceFile(node.getSourceFile())
  if (pascalCase) {
    name = camelcase(name, { pascalCase: true })
  }
  const usedNames = resolveNamesInScope(node, program)

  if (!usedNames.has(name)) {
    return ts.createIdentifier(name)
  }
  for (let i = 1; i < 32; i++) {
    if (!usedNames.has(`${name}_${i}`)) {
      return ts.createIdentifier(`${name}_${i}`)
    }
  }
  // NOTE: We don't use this method as primary because it doesn't respect
  // the suggested name in the case of function and class declaration.
  return ts.createFileLevelUniqueName(name)
}

function deriveNameFromSourceFile (sourceFile: ts.SourceFile): string {
  let name = path.basename(sourceFile.fileName).replace(/\.[jt]sx?$/, '')

  if (name === 'index') {
    name = path.basename(path.dirname(sourceFile.fileName))
  }
  return sanitizeIdentifier(name)
}

function resolveNamesInScope (node: ts.Node, program: ts.Program): Set<string> {
  return program.getTypeChecker()
    .getSymbolsInScope(node, FileLevelValueSymbol)
    .reduce((acc, sym) => acc.add(sym.name), new Set<string>())
}
