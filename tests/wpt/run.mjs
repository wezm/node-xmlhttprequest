import { WPTRunner } from './runner/runner.mjs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { fork } from 'child_process'
import { on } from 'events'

const serverPath = fileURLToPath(join(import.meta.url, '../../server/server.mjs'))

const child = fork(serverPath, [], {
  stdio: ['pipe', 'pipe', 'pipe', 'ipc']
})

/** @type {WPTRunner} */
let runner

for await (const [message] of on(child, 'message')) {
  if (message.server) {
    runner = new WPTRunner('xhr', message.server)
    runner.run()

    runner.once('completion', () => {
      child.send('shutdown')
    })
  } else if (message.message === 'shutdown') {
    process.exit()
  }
}