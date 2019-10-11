import ts from 'typescript'


export default function transformer (program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  return (context) => (source) => source  // TODO
}
