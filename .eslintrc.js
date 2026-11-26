module.exports = {
  root: true, // Make sure eslint picks up the config at the root of the directory
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020, // Use the latest ecmascript standard
    sourceType: "module", // Allows using import/export statements
    ecmaFeatures: {
      jsx: true // Enable JSX since we're using React
    }
  },
  plugins: ["simple-import-sort", "react-hooks"],

  settings: {
    react: {
      version: "detect" // Automatically detect the react version
    }
  },
  env: {
    browser: true, // Enables browser globals like window and document
    amd: true, // Enables require() and define() as global variables as per the amd spec.
    node: true // Enables Node.js global variables and Node.js scoping.
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    // Last, so prettier turns off the formatting rules above. eslint-config-prettier 8 folded
    // the old "prettier/@typescript-eslint" config into this one.
    "plugin:prettier/recommended"
  ],
  rules: {
    "prettier/prettier": ["error", {}, { usePrettierrc: true }], // Use our .prettierrc file as source
    "react/react-in-jsx-scope": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    // TypeScript types the props; prop-types would duplicate them.
    "react/prop-types": "off",
    // Inference is enough for module boundaries; this rule only adds noise here.
    "@typescript-eslint/explicit-module-boundary-types": "off",
    // Existing debt, kept visible as a warning: fix it in files you touch.
    "@typescript-eslint/ban-types": "warn",
    "prefer-const": [
      "error",
      {
        destructuring: "any",
        ignoreReadBeforeAssign: false
      }
    ],
    "jsx-a11y/anchor-is-valid": [
      "error",
      {
        components: ["Link"],
        specialLink: ["hrefLeft", "hrefRight"],
        aspects: ["invalidHref", "preferButton"]
      }
    ]
  },
  overrides: [
    {
      // react-three-fiber elements take three.js props (args, position, intensity, ...),
      // which the DOM-oriented rule doesn't know.
      files: ["components/shared/ThreeViewer/**/*.tsx"],
      rules: { "react/no-unknown-property": "off" }
    }
  ]
};
