/* eslint-env node */
const child_process = require('child_process')
const fs = require('fs')
const path = require('path')

const base = path.resolve(__dirname, './')
const dist = path.join(base, 'dist')

const items = fs.readdirSync(dist)
child_process.execSync(`rm -rf ${items.join(' ')}`, { shell: true })
