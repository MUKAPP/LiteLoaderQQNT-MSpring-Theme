const fs = require('fs');
const archiver = require('archiver');

console.log('Creating release zip...');

const output = fs.createWriteStream('mspring-theme.zip');
const archive = archiver('zip', {
  zlib: { level: 9 }
});

output.on('close', function () {
  console.log(archive.pointer() + ' total bytes');
  console.log('Release zip created successfully: mspring-theme.zip');
});

archive.on('warning', function (err) {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

archive.on('error', function (err) {
  throw err;
});

archive.pipe(output);

// 1. 添加完整的源码目录
archive.directory('main/', 'main');
archive.directory('preload/', 'preload');
archive.directory('renderer/', 'renderer');

// 2. 精细化添加 src 目录中的文件
// 使用 glob 模式匹配 src 下的所有文件，但排除不需要的
archive.glob('**/*', {
  cwd: 'src',
  ignore: [
    'scss/**',       // 排除 css 文件夹及其内容
    'style.scss',   // 排除 style.scss 源文件
    '*.map'         // 可选：排除可能产生的 sourcemap 文件
  ]
}, { prefix: 'src' });

// 3. 添加 res 目录
archive.glob('**/*', {
  cwd: 'res',
  ignore: ['github/**']
}, { prefix: 'res' });

// 4. 添加根目录下的关键文件
archive.file('manifest.json', { name: 'manifest.json' });
archive.file('package.json', { name: 'package.json' });
// 如果有 README 或 LICENSE 也可以加进来
archive.file('README.md', { name: 'README.md' });
archive.file('LICENSE', { name: 'LICENSE' });

archive.finalize();