import ts from 'typescript'

import deriveUniqueName from './deriveUniqueName'


export default function transformer (program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  const visitor = (node: ts.Node) => visitNode(node, program)
  return (context) => (source) => ts.visitEachChild(source, visitor, context)
}

function visitNode (node: ts.Node, program: ts.Program): ts.Node[] | ts.Node {
  if (ts.isExportAssignment(node) && !node.isExportEquals && ts.isArrowFunction(node.expression)) {
    return nameExportedArrowFunction(node, deriveUniqueName(node, program))
  }
  if (ts.isFunctionDeclaration(node) && !node.name && isExportDefault(node)) {
    return updateFunctionDeclarationName(node, deriveUniqueName(node, program))
  }
  if (ts.isClassDeclaration(node) && !node.name && isExportDefault(node)) {
    return updateClassDeclarationName(node, deriveUniqueName(node, program, true))
  }
  return node
}

function isExportDefault (node: ts.Declaration): boolean {
  const modifier = ts.ModifierFlags.ExportDefault
  return (ts.getCombinedModifierFlags(node) & modifier) === modifier
}

function nameExportedArrowFunction (node: ts.ExportAssignment, name: ts.Identifier) {
  return [
    createConstVariableStatement(name, undefined, node.expression),
    ts.updateExportAssignment(node, node.decorators, node.modifiers, name),
  ]
}

function createConstVariableStatement (...args: Parameters<typeof ts.createVariableDeclaration>) {
  return ts.createVariableStatement(undefined, ts.createVariableDeclarationList(
    [ts.createVariableDeclaration(...args)],
    ts.NodeFlags.Const,
  ))
}

function updateClassDeclarationName (node: ts.ClassDeclaration, name: ts.Identifier) {
  return ts.updateClassDeclaration(
    node,
    node.decorators,
    node.modifiers,
    name,
    node.typeParameters,
    node.heritageClauses,
    node.members,
  )
}

function updateFunctionDeclarationName (node: ts.FunctionDeclaration, name: ts.Identifier) {
  return ts.updateFunctionDeclaration(
    node,
    node.decorators,
    node.modifiers,
    node.asteriskToken,
    name,
    node.typeParameters,
    node.parameters,
    node.type,
    node.body,
  )
}
