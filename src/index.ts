#! /usr/bin/env node

import yargs from "yargs";
import { hideBin } from 'yargs/helpers'
import { ClearGistCommand, DelGistCommand, GetAllGistsCommand, GetGistCommand, Manager, SetGistCommand } from "./gist.js";

const usage = `\n使用： gist [--version] [--help] <commond> [<args>]`
const manager = new Manager();
yargs(hideBin(process.argv))
  .usage(usage)
  .command(['get [key]', '$0'], '获取gist', {}, (argv) => {
    manager.setCommand(new GetGistCommand())
    manager.executeCommand(argv);
  })
  .command(['$0', 'last'], '获取最近使用的gist', {}, (argv) => {
    manager.setCommand(new GetGistCommand())
    manager.executeCommand(argv);
  })
  .command('set <key> [value]', '设置gist', {}, (argv) => {
    manager.setCommand(new SetGistCommand())
    manager.executeCommand(argv);
  })
  .command('list [-d]', '获取gist列表(gist数据过长时会截断显示, 完整显示使用-d)', {}, (argv) => {
    manager.setCommand(new GetAllGistsCommand())
    manager.executeCommand(argv);
  })
  .command('del <key>', '删除gist', {}, (argv) => {
    manager.setCommand(new DelGistCommand())
    manager.executeCommand(argv);
  })
  .command('clear', '清空gist', {}, (argv) => {
    manager.setCommand(new ClearGistCommand())
    manager.executeCommand(argv);
  })
  .option('d', {
    alias: 'detail',
    type: 'boolean',
    description: `'gist list -d'显示完整gist`,
    demandOption: false
  })
  .locale('zh_CN')
  .parse()