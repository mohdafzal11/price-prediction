// Custom webpack plugin to suppress specific React errors
class SuppressErrorsPlugin {
  messagesToSuppress = [
    'Minified React error',
    "Hydration failed"
  ]
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    // Suppress React error #418 and other errors as needed
    compiler.hooks.done.tap('SuppressErrorsPlugin', stats => {
      if (stats.compilation.errors && stats.compilation.errors.length) {
        stats.compilation.errors = stats.compilation.errors.filter(error => {
          // Filter out React error #418
          if (error.message && this.messagesToSuppress.some(message => error.message.includes(message))) {
            return false;
          }
          return true;
        });
      }
    });
  }
}

module.exports = SuppressErrorsPlugin;
