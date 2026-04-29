module.exports = {
  apps: [
    {
      name: 'magicflow',
      script: './config/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/magicflow/error.log',
      out_file: '/var/log/magicflow/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      ignore_watch: ['node_modules', 'dist', 'logs', '.env'],
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 3000,
      kill_timeout: 5000,
    }
  ],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'seu-servidor.com',
      ref: 'origin/main',
      repo: 'git@github.com:seu-usuario/magicflow.git',
      path: '/var/www/magicflow',
      'post-deploy': 'pnpm install && pm2 restart ecosystem.config.js --env production'
    }
  }
};
