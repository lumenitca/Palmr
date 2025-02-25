module.exports = {
  "palmr-file": {
    input: "./routes.json",
    output: {
      mode: "single",
      target: "./src/http/endpoints/palmrAPI.ts",
      schemas: "./src/http/models",
    },
  },
};
