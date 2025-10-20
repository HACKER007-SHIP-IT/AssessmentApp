export default [
  { ignores: ["node_modules", ".next", "dist", "coverage", "_archive/**"] },
  {
    files: ["**/*.{ts,tsx,js}"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module" },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error"
    }
  }
];
