import fs from 'fs-extra'
import * as path from 'path'
import ts from 'typescript'


type ProgramTransformerFactory = (program: ts.Program) => ts.TransformerFactory<ts.SourceFile>

type Options = ts.CompilerOptions & {
  transformers?: ProgramTransformerFactory[],
}

const tempDir = path.join(__dirname, '../../.tmp')

const defaultOpts: Options = {
  module: ts.ModuleKind.ESNext,
  strict: true,
  target: ts.ScriptTarget.ES2018,
}

export async function transpile (opts: Options, fileName: string, input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const program = createProgram(fileName, input, opts)

      const transformers = opts.transformers
        ? opts.transformers.map(fn => fn(program))
        : []

      const writeFile: ts.WriteFileCallback = (_, data) => {
        resolve(data)
      }
      program.emit(undefined, writeFile, undefined, false, { before: transformers })
    } catch (err) {
      reject(err)
    }
  })
}

export function createProgram (fileName: string, input: string, opts: Options = {}): ts.Program {
  const filePath = path.join(tempDir, fileName)

  fs.mkdirpSync(path.dirname(filePath))
  fs.writeFileSync(filePath, input, 'utf8')

  const program = ts.createProgram([filePath], { ...defaultOpts, ...opts })

  fs.unlinkSync(filePath)

  return program
}
