#! /usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { Low, JSONFile } from 'lowdb'
import { join } from 'path'
import { write } from 'clipboardy'
import os from 'os'
import chalk from 'chalk'
import boxen from 'boxen'
import inquirer from 'inquirer'
const usage =
  '\nUsage： gist [--version] [--help] [-r | --remote] <commond> [<args>]'

/**
 * 打印样式
 * @param {string} str 打印值
 * @param {'success'|'fail'|'warning'} type 类别
 */
const colorful = (str, type = 'success', desc = '') => {
  const types = {
    success: 'green',
    fail: 'red',
    warning: 'yellow',
  }
  const color = types[type]
  console.log(
    boxen(chalk[color](`${desc}${str}`), {
      padding: 0,
      borderColor: color,
      margin: 0,
    })
  )
}

const clearPromptList = [
  {
    type: 'confirm',
    name: 'clear',
    message: 'Whether to clear all gists?',
    default: false,
  },
]

/**
 * 处理commond
 * @param {*} argv command参数
 * @param {*} type command类型
 */
const handleGist = async (argv, type) => {
  const homedir = os.homedir()
  const file = join(homedir, 'gist.json')
  const adapter = new JSONFile(file)
  const db = new Low(adapter)
  await db.read()
  db.data = db.data || { gists: {} }
  const { gists = {} } = db.data
  const { key, value, d = false } = argv
  const maps = {}
  switch (type) {
    case 'get':
      if (key && gists[key]) {
        await write(gists[key])
        colorful(gists[key])
        db.data.gists['LAST_GIST'] = gists[key]
        await db.write()
      } else {
        colorful(
          key
            ? `Error: Key '${key}' gist is not exist`
            : 'Error: Please type gist key',
          'fail'
        )
      }
      break
    case 'set':
      if (key && value) {
        db.data.gists[key] = value
        await db.write()
        await write(value)
        colorful(value)
      } else {
        colorful(
          key
            ? value
              ? ''
              : 'Please type gist value'
            : 'Please type gist key',
          'fail'
        )
      }
      break
    case 'list':
      Object.keys(gists).forEach((gist) => {
        if (d) {
          maps[gist] = gists[gist]
        } else {
          maps[gist] =
            gists[gist].slice(0, 40) + (gists[gist].slice(40) ? '..' : '')
        }
      })
      delete maps['LAST_GIST']
      if (Object.keys(maps).length) {
        console.table(maps)
      } else {
        colorful('Warning: This is no gist yet', 'warning')
      }
      break
    case 'delete':
      if (key && gists[key]) {
        delete db.data.gists[key]
        db.write()
        colorful(`Delete Key '${key}' successfully`)
      } else {
        colorful(`Warning: Key '${key}' is not exist`, 'warning')
      }
      break
    case 'clear':
      inquirer.prompt(clearPromptList).then((answers) => {
        if (answers['clear']) {
          db.data.gists = {}
          db.write()
          colorful('Clear all gist successfully')
        }
      })
      break
    default:
      if (gists['LAST_GIST']) {
        await write(gists['LAST_GIST'])
        colorful(gists['LAST_GIST'])
      } else {
        colorful(`See 'gist --help'`, 'warning')
      }
      break
  }
}

yargs(hideBin(process.argv))
  .usage(usage)
  .command(['$0', 'last'], 'get last gist', {}, (argv) => {
    handleGist(argv, '')
  })
  .command(['get <key>', 'g'], 'get gist', {}, (argv) => {
    handleGist(argv, 'get')
  })
  .command(['set <key> [value]', 's', 'add'], 'set gist', {}, (argv) => {
    handleGist(argv, 'set')
  })
  .command(['list', 'l'], '', {}, (argv) => {
    handleGist(argv, 'list')
  })
  .command(['delete <key>', 'd'], 'delete gist', {}, (argv) => {
    handleGist(argv, 'delete')
  })
  .command(['clear', 'c'], 'clear all gist', {}, (argv) => {
    handleGist(argv, 'clear')
  })
  .option('r', {
    alias: 'remote',
    describe: 'get gist from remote[wip]',
    type: 'boolean',
    demandOption: false,
  })
  .option('d', {
    alias: 'detail',
    describe: `'gist list -d' list all gist`,
    type: 'boolean',
    demandOption: false,
  })
  .locale('en')
  .parse()
