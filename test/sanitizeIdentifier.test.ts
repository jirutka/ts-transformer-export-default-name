import test from 'tape-async'

import sanitizeIdentifier from '../src/sanitizeIdentifier'


[/* input        | expected    */
  ['foo'         , 'foo'       ],
  ['num42'       , 'num42'     ],
  ['12monkeys'   , 'monkeys'   ],
  ['$dolar'      , '$dolar'    ],
  ['em@il'       , 'emil'      ],
  ['percent%'    , 'percent'   ],
  ['hyp-hen-name', 'hypHenName'],
  ['under_sco_re', 'underScoRe'],
  ['for'         , 'for_1'     ],
  ['const'       , 'const_1'   ],
  ['enum'        , 'enum_1'    ],
].forEach(([input, expected]) => {

  test(`${input} -> ${expected}`, t => {
    t.equal(sanitizeIdentifier(input), expected)
    t.end()
  })
})
