import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { join } from 'path'
import boxen from 'boxen'
import chalk from 'chalk'
import clipboard from "clipboardy";
import os from 'os'
import { ArgumentsCamelCase, InferredOptionTypes } from "yargs";
import inquirer from "inquirer";

interface GistData {
  gists: Record<string, string>
}
// 定义Gist命令行参数类型
type GistArgv = ArgumentsCamelCase<{
  key?: string;
  value?: any;
  a?: boolean;
}>
interface Command {
  execute(args: GistArgv): void;
}
// 常量
const LAST_GIST_KEY = 'LAST_GIST_KEY'
// 默认数据
const defaultData: GistData = {
  gists: {}
}

// 格式化输出
const colorful = (str: string, type: 'success' | 'fail' | 'warning' = 'success', desc = '') => {
  const types = {
    success: chalk.green,
    fail: chalk.red,
    warning: chalk.yellow,
  }
  const borderColor = {
    success: 'green',
    fail: 'red',
    warning: 'yellow',
  }
  const color = types[type]
  console.log(
    boxen(color(`${desc}${str}`), {
      padding: 0,
      borderColor: borderColor[type],
      margin: 0,
    })
  )
}

// 设置Gist
export class SetGistCommand implements Command {
  public async execute(args: GistArgv): Promise<void> {
    const { key, value } = args
    if (!key) {
      colorful('异常: 请提供gist键', 'fail');
      return;
    }
    if (!value) {
      colorful('异常: 请提供gist值', 'fail');
      return;
    }
    const homeDir = os.homedir();
    const file = join(homeDir, 'gist.json')
    const db = new Low<GistData>(new JSONFile(file), defaultData);
    await db.read();
    db.data = db.data || defaultData;
    db.data.gists[key] = value.toString();
    db.data.gists[LAST_GIST_KEY] = value.toString();
    await db.write();
    await clipboard.write(value.toString());
    colorful(value.toString())
  }
}

// 获取Gist
export class GetGistCommand implements Command {
  public async execute(args: GistArgv): Promise<void> {
    const homeDir = os.homedir();
    const file = join(homeDir, 'gist.json')
    const db = new Low<GistData>(new JSONFile(file), defaultData);
    await db.read();
    db.data = db.data || defaultData;
    const { key } = args
    const { gists = {} } = db.data
    if (key && gists[key]) {
      colorful(gists[key]);
      db.data.gists[LAST_GIST_KEY] = gists[key];
      await db.write();
    } else if (gists[LAST_GIST_KEY]) {
      colorful(gists[LAST_GIST_KEY]);
    } else if (key) {
      colorful('异常: 数据不存在', 'fail');
    } else {
      colorful('如何使用: gist --help', 'warning')
    }
  }
}

// 获取所有Gist
export class GetAllGistsCommand implements Command {
  public async execute(args: GistArgv): Promise<void> {
    const homeDir = os.homedir();
    const file = join(homeDir, 'gist.json')
    const db = new Low<GistData>(new JSONFile(file), defaultData);
    await db.read();
    db.data = db.data || defaultData;
    const { gists = {} } = db.data
    const { a = false } = args
    const maps: Record<string, string> = {}
    Object.keys(gists).forEach((gist) => {
      if (a) {
        maps[gist] = gists[gist];
      } else {
        maps[gist] =
          gists[gist].slice(0, 40) + (gists[gist].slice(40) ? '..' : '')
      }
    })
    delete maps[LAST_GIST_KEY]
    if (Object.keys(maps).length) {
      console.table(maps)
    } else {
      colorful('异常: 暂无gist数据', 'warning');
    }
  }
}

// 删除Gist
export class DelGistCommand implements Command {
  public async execute(args: GistArgv): Promise<void> {
    const { key } = args
    if (!key) {
      colorful('异常: 请提供gist键', 'fail');
      return;
    }
    const homeDir = os.homedir();
    const file = join(homeDir, 'gist.json')
    const db = new Low<GistData>(new JSONFile(file), defaultData);
    await db.read();
    db.data = db.data || defaultData;
    const { gists = {} } = db.data
    if (gists[key]) {
      if (gists[key] === gists[LAST_GIST_KEY]) {
        delete db.data.gists[LAST_GIST_KEY];
      }
      delete db.data.gists[key];
      await db.write();
      colorful(`已删除键为${key}的gist`, 'success');
    }

  }
}

// 清空Gist
export class ClearGistCommand implements Command {
  public async execute(args: GistArgv): Promise<void> {
    const homeDir = os.homedir();
    const file = join(homeDir, 'gist.json')
    const db = new Low<GistData>(new JSONFile(file), defaultData);
    const answers = await inquirer.prompt([{
      type: 'confirm',
      name: 'clear',
      message: '确定要清空所有gist吗？',
      default: false,
    }])
    if (answers.clear) {
      db.data = defaultData;
      await db.write();
      colorful('所有gist已清空')
    }
  }
}

export class Manager {
  private command: Command | null = null;
  public setCommand(command: Command): void {
    this.command = command;
  }
  public executeCommand(argv: GistArgv): void {
    if (this.command) {
      this.command.execute(argv);
    } else {
      console.error("No command set.");
    }
  }
}