module.exports = {
  apps: [{
    name: "backend",
    script: "./dist/app.js",
    env_production: {
      NODE_ENV: "production"
    }
  }]
}