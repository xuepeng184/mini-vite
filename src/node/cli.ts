//命令行工具
import cac from 'cac';
import { startDevServer } from './server';

const cli = cac();

cli
  .command('[root]', 'Run the development server')
  .alias('serve')
  .alias('dev')
  .action(async () => {
    await startDevServer();
    // console.log('ceshi');
  });

cli.help();

cli.parse();
