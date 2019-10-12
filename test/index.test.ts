import { curry } from 'curriable'
import test from 'tape-async'

import './support/tapeExtensions'
import * as compiler from './support/compiler'

import transformer from '../src'


const transpile = curry(compiler.transpile)({
  transformers: [transformer],
})


test('export default () => {}', async t => {
  const output = await transpile('arrow.ts', `
    export default () => 42
  `)
  t.includes(output, 'const arrow = () => 42;')
  t.includes(output, 'export default arrow;')
})

test('export default () => {} - conflicting name', async t => {
  const output = await transpile('arrow.ts', `
    function arrow () {}
    export default () => 42
  `)
  t.includes(output, 'const arrow_1 = () => 42;')
  t.includes(output, 'export default arrow_1;')
})

test('export const named = () => {}', async t => {
  const output = await transpile('anything.ts', `
    export const named = () => 42
  `)
  t.includes(output, 'export const named = () => 42;')
})


test('export default function() {}', async t => {
  const output = await transpile('fun.ts', `
    export default function () { return 42 }
  `)
  t.includes(output, 'export default function fun() { return 42; }')
})

test('export default function() {} - conflicting name', async t => {
  const output = await transpile('fun.ts', `
    const fun = 1
    var fun_1 = 2
    export default function () { return 42 }
  `)
  t.includes(output, 'export default function fun_2() { return 42; }')
})

test('export default function named() {}', async t => {
  const output = await transpile('anything.ts', `
    export default function named() { return 42 }
  `)
  t.includes(output, 'export default function named() { return 42; }')
})

test('export function named () {}', async t => {
  const output = await transpile('anything.ts', `
    export function named () { return 42; }
  `)
  t.includes(output, 'export function named() { return 42; }')
})


test('export default class {}', async t => {
  const output = await transpile('classy.ts', `
    export default class { foo() {} }
  `)
  t.includes(output, 'export default class Classy {')
  t.includes(output, 'foo()')
})

test('export default class {} - conflicting name', async t => {
  const output = await transpile('classy.ts', `
    class Classy {}
    export default class { foo() {} }
  `)
  t.includes(output, 'export default class Classy_1 {')
  t.includes(output, 'foo()')
})

test('export default class Named {}', async t => {
  const output = await transpile('classy.ts', `
    export default class Named { foo() {} }
  `)
  t.includes(output, 'export default class Named {')
})


test('const fn = () =>; export default fn', async t => {
  const output = await transpile('anything.ts', `
    const fn = () => 42
    export default fn
  `)
  t.includes(output, 'const fn = () => 42;')
  t.includes(output, 'export default fn;')
})
