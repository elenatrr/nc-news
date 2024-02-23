module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es2021": true,
    "node": true,
    "jest": true
  },
  "extends": "eslint:recommended",
  "overrides": [
    {
      "env": {
        "node": true
      },
      "files": [
        ".eslintrc.{js,cjs}"
      ],
      "parserOptions": {
        "sourceType": "script"
      }
    },
    {
      "files": [
        "**/*.test.js",
        "**/*.spec.js"
      ],
      "env": {
        "jest": true
      }
    }
  ],
  "parserOptions": {
    "ecmaVersion": "latest"
  },
  "rules": {
    "indent": ["error", 2], // Enforce 2-space indentation
    "linebreak-style": ["error", "unix"], // Enforce UNIX linebreaks
    "quotes": ["error", "double"], // Enforce single quotes
    "semi": ["error", "always"], // Require semicolons
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], // Warn about unused variables, Allow Unused Variables That Start With an Underscore
    "eqeqeq": "error", // Require strict equality operators
    "curly": "error", // Require curly braces for all control statements
    "no-trailing-spaces": "error", // Disallow trailing spaces
    "comma-spacing": ["error", { "before": false, "after": true }], // Enforce spacing after commas
    "prefer-const": "error" // Prefer const over let where possible
  }
};
