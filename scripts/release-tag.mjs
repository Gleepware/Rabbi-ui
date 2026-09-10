import { execSync } from 'node:child_process'

const pad = (n) => String(n).padStart(2, '0')
const d = new Date()
const stamp =
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-` +
  `${pad(d.getHours())}${pad(d.getMinutes())}`

const semverTag = process.argv[2]
const stampTag = `${semverTag}+${stamp}`

execSync(`git tag -a "${stampTag}" -m "release ${stamp}"`)
execSync(`git push origin "${stampTag}"`)