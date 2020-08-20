module.exports = {
    apps: [
        {
            name: "appointmentApp",
            script: "index.js",
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            },
            instances: 1,
            exec_mode: "fork"
        }
    ]
}