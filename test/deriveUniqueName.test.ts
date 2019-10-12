import test from 'tape-async'
import ts from 'typescript'

import { createProgram } from './support/compiler'

import deriveUniqueName from '../src/deriveUniqueName'


// eslint-disable-next-line @typescript-eslint/require-await
async function createProgramAndGetNode (fileName: string, input: string): Promise<[ts.Node, ts.Program]> {
  return new Promise((resolve, reject) => {
    try {
      const program = createProgram(fileName, input, { allowJs: true, jsx: ts.JsxEmit.Preserve })
      const sourceFile = program.getSourceFile(program.getRootFileNames()[0])

      if (!sourceFile) { throw Error('SourceFile not found') }

      ts.visitNode(sourceFile, node => {
        resolve([node, program])
        return undefined
      })
    } catch (err) {
      reject(err)
    }
  })
}


test('when derived name does not conflict with anything', async t => {
  const [node, program] = await createProgramAndGetNode('fillet.ts', 'const foo = 42')

  t.equal(deriveUniqueName(node, program).text, 'fillet',
    'name equals the file name without extension')
})

test('when filename is index', async t => {
  const [node, program] = await createProgramAndGetNode('dir/index.ts', 'let x = 1')

  t.equal(deriveUniqueName(node, program).text, 'dir',
    'name is derived from the directory name')
})

;[/* desc           | fileName    | input              | expected   */
  ['global variable', 'console.ts', 'let x = 1'        , 'console_1'],
  ['global function', 'escape.js' , 'let x = 1'        , 'escape_1' ],
  ['local const'    , 'cons.tsx'  , 'const cons = 1'   , 'cons_1'   ],
  ['local var'      , 'war.jsx'   , 'var war = 1'      , 'war_1'    ],
  ['local function' , 'fun.ts'    , 'function fun() {}', 'fun_1'    ],
  ['local class'    , 'klass.ts'  , 'class klass {}'   , 'klass_1'  ],
  ['local enum'     , 'enu.ts'    , 'enum enu {}'      , 'enu_1'    ],
].forEach(([desc, fileName, input, expected]) => {

  test(`when derived name conflicts with a ${desc}`, async t => {
    const [node, program] = await createProgramAndGetNode(fileName, input)

    t.equal(deriveUniqueName(node, program).text, expected,
      'derived name is suffixed with _1')
  })
})

test('when first few index suffixes are also used', async t => {
  const [node, program] = await createProgramAndGetNode('foo.ts', `
    const foo = 0
    let foo_1 = 1
    var foo_2 = 2
    const foo_5 = 5
    export default () => 3
  `)

  t.equal(deriveUniqueName(node, program).text, 'foo_3',
    'derived name is suffixed with the first free index')
})

test('when source contains an equally-named variable in a function scope', async t => {
  const [node, program] = await createProgramAndGetNode('loc.ts', `
    function fun () {
      const loc = 'local'
    }
    export default () => 42
  `)

  t.equal(deriveUniqueName(node, program).text, 'loc',
    'derived name is not suffixed')
})
