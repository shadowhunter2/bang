module.exports.autoreload = {
  active: true,
  usePolling: false,
  dirs: [
    "api/controllers",
    "api/services",
    "api/customs"
  ],
  ignored: [
    // Ignore all files with .ts extension
    "**.ts"
  ]
};










