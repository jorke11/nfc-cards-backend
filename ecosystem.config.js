module.exports = {
  apps: [
    {
      name: 'backend-nfc-profiles',
      script: 'dist/src/main.js',
      cwd: '/home/webapp/projects/nfc-profiles/nfc-cards-backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
