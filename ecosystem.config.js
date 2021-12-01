exports.apps = [
  {
    name: 'scorr_api',
    script: './build/app.js',
    instances: '1',
    max_memory_restart: '2G',
    node_args: '--max_old_space_size=2048',
    watch: true,
    env: {
      NODE_ENV: 'production',
    },
  },
];

// ('-c gunicorn -w 32 -k gevent --timeout 120 -b 0.0.0.0:8088 --limit-request-line 0 --limit-request-field_size 0 "superset.app:create_app()" ');
