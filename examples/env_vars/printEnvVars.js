;(async function printEnvVars() {
  console.log('Environment Variables')
  Object.keys(process.env).forEach((key) => console.log(key, process.env[key]))
  process.exit()
})()
