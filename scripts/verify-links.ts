import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { glob } from 'tinyglobby'

import markdownLinkExtractor from 'markdown-link-extractor'

const errors: Array<{
  file: string
  link: string
  resolvedPath: string
  reason: string
}> = []

function isRelativeLink(link: string) {
  return (
    !link.startsWith('/') &&
    !link.startsWith('http://') &&
    !link.startsWith('https://') &&
    !link.startsWith('//') &&
    !link.startsWith('#') &&
    !link.startsWith('mailto:')
  )
}

function stripExtension(p: string): string {
  return p.replace(`${extname(p)}`, '')
}

function relativeLinkExists(link: string, file: string): boolean {
  const linkWithoutHash = link.split('#')[0]

  if (!linkWithoutHash) return false

  const filePath = stripExtension(file)
  const linkPath = stripExtension(linkWithoutHash)

  let absPath = resolve(filePath, '..', linkPath)

  const docsRoot = resolve('docs')
  if (!absPath.startsWith(docsRoot)) {
    errors.push({
      link,
      file,
      resolvedPath: absPath,
      reason: 'Path outside /docs',
    })
    return false
  }

  const isExample = absPath.includes('/examples/')

  let exists = false

  if (isExample) {
    absPath = absPath.replace(/\/docs\/framework\/([^/]+)\/examples\//, '/examples/$1/')

    exists = existsSync(absPath) && statSync(absPath).isDirectory()
  } else {
    if (!absPath.endsWith('.md')) {
      absPath = `${absPath}.md`
    }
    exists = existsSync(absPath)
  }

  if (!exists) {
    errors.push({
      link,
      file,
      resolvedPath: absPath,
      reason: 'Not found',
    })
  }
  return exists
}

async function verifyMarkdownLinks() {
  const markdownFiles = await glob('docs/**/*.md', {
    ignore: ['**/node_modules/**'],
  })

  console.log(`Found ${markdownFiles.length} markdown files\n`)

  for (const file of markdownFiles) {
    const content = readFileSync(file, 'utf-8')
    const links: Array<string> = markdownLinkExtractor(content)

    const relativeLinks = links.filter((link: string) => {
      return isRelativeLink(link)
    })

    if (relativeLinks.length > 0) {
      relativeLinks.forEach((link) => {
        relativeLinkExists(link, file)
      })
    }
  }

  if (errors.length > 0) {
    console.log(`\n❌ Found ${errors.length} broken links:`)
    errors.forEach((err) => {
      console.log(
        `${err.file}\n  link:      ${err.link}\n  resolved:  ${err.resolvedPath}\n  why:       ${err.reason}\n`,
      )
    })
    process.exit(1)
  } else {
    console.log('\n✅ No broken links found!')
  }
}

verifyMarkdownLinks().catch(console.error)
