// Jest test for preview script
const { spawnSync } = require('child_process');
const path = require('path');

test('preview script exits with code 0', () => {
  const scriptPath = path.resolve(__dirname, '..', 'scripts', 'preview.sh');
  const result = spawnSync(scriptPath, { stdio: 'ignore', shell: true });
  expect(result.status).toBe(0);
});
