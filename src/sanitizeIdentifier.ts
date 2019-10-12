import camelcase from 'camelcase'
import ts from 'typescript'

let scanner: ts.Scanner

function scanToken (text: string): ts.Scanner {
  if (!scanner) {
    scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard)
  }
  scanner.setText(text)
  scanner.scan()

  return scanner
}

function isValidIdentifier (text: string): boolean {
  const scan = scanToken(text)

  return scan.isIdentifier()
    && scan.getTextPos() === text.length
    && scan.getTokenPos() === 0
}

export default function sanitizeIdentifier (text: string): string {
  text = camelcase(text.replace(/^\d+/, '')).replace(/[^A-Za-z0-9_$]/, '') || 'default_1'

  return isValidIdentifier(text) ? text : text + '_1'
}
