const Module = require("module");
const path = require("path");
const resolveFrom = require("resolve-from");
const Dotenv = require("dotenv-webpack");
// Required before the Module.prototype.require patch below, so Sentry's own
// module resolution is not routed through the react/react-dom redirect.
const { withSentryConfig } = require("@sentry/nextjs");
const node_modules = path.resolve(__dirname, "node_modules");

const originalRequire = Module.prototype.require;

// The following ensures that there is always only a single (and same)
// copy of React in an app at any given moment.
Module.prototype.require = function (modulePath) {
  // Only redirect resolutions to non-relative and non-absolute modules
  if (
    ["/react/", "/react-dom/", "/react-query/"].some((d) => {
      try {
        return require.resolve(modulePath).includes(d);
      } catch (err) {
        return false;
      }
    })
  ) {
    try {
      modulePath = resolveFrom(node_modules, modulePath);
    } catch (err) {
      // ignored
    }
  }

  return originalRequire.call(this, modulePath);
};
const DEPLOY_ENV =
  process.env.DEPLOY_ENV && process.env.DEPLOY_ENV.toLowerCase();
const DEPLOY_ENV_MAPPING = {
  dev: "development",
  staging: "staging",
  prod: "production"
};
const envFile = path.join(__dirname, `.env.${DEPLOY_ENV_MAPPING[DEPLOY_ENV]}`);
loadEnvVariables();
const isLocalDevEnvironment = !process.env.DEPLOY_ENV;
const moduleExports = {
  swcMinify: true,
  sentry: {
    // Upload source maps to Sentry but do not serve them to browsers, so the
    // storefront's original source is not readable from production devtools.
    // Default in @sentry/nextjs 8+, opt-in on the 7.x line this app is pinned to.
    hideSourceMaps: true
  },
  webpack: (config, { webpack }) => {
    config.resolve.alias["@components"] = path.join(__dirname, "components");
    config.resolve.alias["@config"] = path.join(__dirname, "config");
    config.resolve.alias["@contrib"] = path.join(__dirname, "contrib");
    config.resolve.alias["@data"] = path.join(__dirname, "data");
    config.resolve.alias["@hooks"] = path.join(__dirname, "hooks");
    config.resolve.alias["@lib"] = path.join(__dirname, "lib");
    config.resolve.alias["@models"] = path.join(__dirname, "models");
    config.resolve.alias["@pages"] = path.join(__dirname, "pages");
    config.resolve.alias["@public"] = path.join(__dirname, "public");
    config.resolve.alias["@styles"] = path.join(__dirname, "styles");
    config.resolve.alias["@typings"] = path.join(__dirname, "typings");
    config.resolve.alias["@utilities"] = path.join(__dirname, "utilities");
    config.plugins = config.plugins || [];
    config.plugins = [
      ...config.plugins,
      new Dotenv({
        path: envFile,
        systemvars: true
      })
    ];
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        react$: resolveFrom(path.resolve("node_modules"), "react"),
        "react-query$": resolveFrom(
          path.resolve("node_modules"),
          "react-query"
        ),
        "react-dom$": resolveFrom(path.resolve("node_modules"), "react-dom")
      }
    };
    return config;
  }
};

// Source maps are uploaded only when SENTRY_AUTH_TOKEN, SENTRY_ORG and
// SENTRY_PROJECT are all set. Without this guard the plugin fails the build in
// environments that have no token, such as the Docker image build and a local
// `yarn build`.
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  dryRun: !(
    process.env.SENTRY_AUTH_TOKEN &&
    process.env.SENTRY_ORG &&
    process.env.SENTRY_PROJECT
  )
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);

function loadEnvVariables() {
  // eslint-disable-next-line global-require
  require("dotenv").config({
    path: envFile
  });
}
