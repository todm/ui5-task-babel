# ui5-task-babel

Task (and **Middleware**) for transpiling next-gen javascript into backwards compatible code using [BabelJS](https://babeljs.io/). Also provides project shims for polyfills.

Without any configuration the task will use `@babel/preset-env` to transpile the code. With babel config files you can further control the transpile process (e.g. typescript, ESModules...).

# Installation

Add the task to your project as a dev dependency.

```sh
npm i -D git+https://github.com/todm/ui5-task-babel.git
```

Add the package to the ui5 dependencies of `package.json`

```yaml
"ui5": {
  "dependencies": [
    #...
    "ui5-task-babel"
  ]
}
```

# Include Task and Middleware

Include the task in `ui5.yaml`

Task:

```yaml
builder:
  customTasks:
    - name: ui5-task-babel
      beforeTask: generateComponentPreload
```

Server Middleware:

```yaml
server:
  customMiddleware:
    - name: ui5-middleware-babel
      beforeMiddleware: serveResources
```

# Configuration

Without any configuration the task will default to the `@babel/preset-env` preset. You can change the babel configuration by adding a babel config file (`babel.config.js`) or by changing the babelConfig object in the task configuration. Config files will override the babel configuration in ui5.yaml

## Task Configuration

You can add the following configurations to the task:

| Name           | Type                 | Default                        | Description                                           |
| -------------- | -------------------- | ------------------------------ | ----------------------------------------------------- |
| include        | `string \| string[]` | `[**/*.js]`                    | Files that should be transformed                      |
| exclude        | `string \| string[]` | `[]`                           | Files that should not me transformed                  |
| babelConfig    | `Object`             | preset-env + Inline SourceMaps | Babel configuration                                   |
| forceExtension | `string \| false`    | `false`                        | Force a specific file extension for transformed files |
| iife           | `boolen`             | `true`                         | Wraps code as iife to ensure top level scope          |

## Middleware Configuration

You can add the following configurations to the middleware:

| Name          | Type                 | Default                        | Description                                                                                                     |
| ------------- | -------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| include       | `string \| string[]` | `[**/*.js]`                    | Files that should be included                                                                                   |
| exclude       | `string \| string[]` | `[]`                           | Files that should be excluded                                                                                   |
| babelConfig   | `Object`             | preset-env + Inline SourceMaps | Babel configuration                                                                                             |
| searchInclude | `string \| string[]` | `[**/*.js]`                    | Files that should be included when Searching the project for fitting files                                      |
| passFile      | `boolean`            | `false`                        | Wether the file should be passed to the next middleware (Only works if next middleware checks `req.passedFile`) |
| iife          | `boolen`             | `true`                         | Wraps code as iife to ensure top level scope                                                                    |

# Regenerator-Runtime and Polyfills
Depending on your babel configuration and the usage of `async/await` or other non-transpilable js features you may need to add polyfills to your app.

If your app runs standalone via an `index.html` file this can easily be done by including the corresponding js files with a script tag.
```html
<script src="https://polyfill.io/v3/polyfill.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/regenerator-runtime@0.13.9/runtime.min.js"></script>
```

If you load your app in **launchpad** and can't change the html file or you don't want to use a cdn for your polyfills you need to add them as resources to your project.

**Project shims for regenerator-runtime and core-js are already provided in this package**

Add regenerator-runtime and core-js-bundle as dependencies
```sh
npm i -D core-js-bundle regenerator-runtime
```

Then add those packages as ui5 dependencies
```yaml
# package.json
"ui5": {
  "dependencies": [
    #...
    "ui5-task-babel",
    "core-js-bundle",
    "regenerator-runtime"
  ]
}
```

Regenerator-runtime and core-js will now be added to your projects resource folder.
You can register them in your `manifest.json`, import them directly in a controller or use them in html as a script tag.

```yaml
# manifest.json
{
  # ...
  "sap.ui5": {
    "resources": {
      "js": [
        {"uri": "/resources/polyfills/core-js-bundle/minified.js"},
        {"uri": "/resources/polyfills/regenerator-runtime/runtime.js"}
      ]
    }
  }
}

```



# Examples

## Setting up typescript support

Install typescript preset and ui5 types

```sh
npm i -D @babel/preset-typescript @sapui5/ts-types
# if you want to setup ESModules install @sapui5/ts-types-esm instead
```

Add preset to babel configuration

```yaml
# babel.config.json
{ "presets": ["@babel/preset-typescript"], "sourceMaps": "inline" }
```

Add a `tsconfig.json` file to configure the typescript compiler and add the installed types

```yaml
# tsconfig.json
{
  "compilerOptions":
    {
      "target": "ES3",
      "module": "ES2020",
      "moduleResolution": "Node",
      "strict": false,
      "types": ["@ui5/ts-types"],
    },
}
```

Change task/middleware configuarion in ui5.yaml

```yaml
# ui5.yaml
builder:
  customTasks:
    - name: ui5-task-babel
      beforeTask: generateComponentPreload
      configuration:
        include: ["**/*.ts"]
        forceExtension: "js"
server:
  customMiddleware:
    - name: ui5-middleware-babel
      beforeMiddleware: serveResources
      configuration:
        searchInclude: ["**/*.ts", "**/*.js"]
```

With this configuration all `.ts` files will be transformed to javascript both in builds and dev server
