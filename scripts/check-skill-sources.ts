import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { glob } from 'tinyglobby'

const REPO_PREFIX = 'TanStack/time:'
const shouldWrite = process.argv.includes('--write')

type SourceShas = Record<string, string>

interface SyncState {
  library_version?: string
  skills: Record<string, { sources_sha: SourceShas }>
}

interface Skill {
  file: string
  packageDir: string
  name: string
  sources: Array<string>
}

const problems: Array<string> = []

function readFrontmatter(file: string): string | undefined {
  return readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1]
}

function readSources(file: string, frontmatter: string): Array<string> {
  const lines = frontmatter.split(/\r?\n/)
  const start = lines.findIndex((line) => /^sources:\s*$/.test(line))
  if (start === -1) {
    problems.push(`${file}: no block-style "sources:" list`)
    return []
  }
  const sources: Array<string> = []
  for (const line of lines.slice(start + 1)) {
    const item = line.match(/^\s+-\s+['"]?([^'"]+?)['"]?\s*$/)
    if (!item) break
    sources.push(item[1]!)
  }
  if (sources.length === 0) problems.push(`${file}: "sources:" list is empty`)
  return sources
}

async function hashSource(source: string, file: string): Promise<string | undefined> {
  if (!source.startsWith(REPO_PREFIX)) {
    problems.push(`${file}: source "${source}" is outside ${REPO_PREFIX} and cannot be checked`)
    return undefined
  }
  const pattern = source.slice(REPO_PREFIX.length)
  const paths = (await glob(pattern, { onlyFiles: true })).sort()
  if (paths.length === 0) {
    problems.push(`${file}: source "${source}" matches no files`)
    return undefined
  }
  const hash = createHash('sha256')
  for (const path of paths) {
    hash.update(path).update('\0')
    hash.update(readFileSync(path, 'utf8').replace(/\r\n/g, '\n')).update('\0')
  }
  return hash.digest('hex')
}

function readSyncState(path: string): SyncState {
  if (!existsSync(path)) return { skills: {} }
  return JSON.parse(readFileSync(path, 'utf8')) as SyncState
}

function readPackageVersion(packageDir: string): string | undefined {
  return (
    JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8')) as { version?: string }
  ).version
}

function diffShas(skill: string, stored: SourceShas | undefined, current: SourceShas) {
  if (!stored) {
    problems.push(`${skill}: no recorded source hashes`)
    return
  }
  for (const [source, sha] of Object.entries(current)) {
    if (!(source in stored)) problems.push(`${skill}: new source ${source}`)
    else if (stored[source] !== sha) problems.push(`${skill}: source changed ${source}`)
  }
  for (const source of Object.keys(stored)) {
    if (!(source in current)) problems.push(`${skill}: source removed ${source}`)
  }
}

const skillFiles = (await glob('packages/*/skills/**/SKILL.md')).sort()
const skills: Array<Skill> = []

for (const file of skillFiles) {
  const frontmatter = readFrontmatter(file)
  if (!frontmatter) {
    problems.push(`${file}: missing frontmatter`)
    continue
  }
  const skillsDir = file.slice(0, file.indexOf('/skills/') + '/skills'.length)
  skills.push({
    file,
    packageDir: dirname(skillsDir),
    name: relative(skillsDir, dirname(file)),
    sources: readSources(file, frontmatter),
  })
}

const skillsByPackage = Map.groupBy(skills, (skill) => skill.packageDir)

for (const [packageDir, packageSkills] of skillsByPackage) {
  const statePath = join(packageDir, 'skills', 'sync-state.json')
  const stored = readSyncState(statePath)
  const next: SyncState = { library_version: readPackageVersion(packageDir), skills: {} }

  for (const skill of packageSkills) {
    const current: SourceShas = {}
    for (const source of skill.sources) {
      const sha = await hashSource(source, skill.file)
      if (sha) current[source] = sha
    }
    next.skills[skill.name] = { sources_sha: current }
    if (!shouldWrite) diffShas(skill.file, stored.skills[skill.name]?.sources_sha, current)
  }

  if (!shouldWrite) {
    for (const name of Object.keys(stored.skills)) {
      if (!(name in next.skills)) problems.push(`${statePath}: entry for deleted skill "${name}"`)
    }
  }

  if (shouldWrite) writeFileSync(statePath, `${JSON.stringify(next, null, 2)}\n`)
}

if (problems.length > 0) {
  console.error(`Skill source check failed (${problems.length}):\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  if (!shouldWrite) {
    console.error(
      '\nReview each listed SKILL.md against its changed sources, update it if needed,',
      'then run `pnpm skills:sync` to record the reviewed hashes.',
    )
  }
  process.exit(1)
}

console.log(
  shouldWrite
    ? `Recorded source hashes for ${skills.length} skills`
    : `All ${skills.length} skills match their recorded sources`,
)
