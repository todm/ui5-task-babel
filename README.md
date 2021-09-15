# ui5-task-babel

Task (and **Middleware**) for transpiling next-gen javascript into backwards compatible code using [BabelJS](https://babeljs.io/).

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

## Middleware Configuration

You can add the following configurations to the middleware:

| Name          | Type                 | Default                        | Description                                                                                                     |
| ------------- | -------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| include       | `string \| string[]` | `[**/*.js]`                    | Files that should be included                                                                                   |
| exclude       | `string \| string[]` | `[]`                           | Files that should be excluded                                                                                   |
| babelConfig   | `Object`             | preset-env + Inline SourceMaps | Babel configuration                                                                                             |
| searchInclude | `string \| string[]` | `[**/*.js]`                    | Files that should be included when Searching the project for fitting files                                      |
| passFile      | `boolean`            | `false`                        | Wether the file should be passed to the next middleware (Only works if next middleware checks `req.passedFile`) |

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
{
  "presets": ["@babel/preset-typescript"],
  "sourceMaps": "inline"
}
```

Add a `tsconfig.json` file to configure the typescript compiler and add the installed types

```yaml
# tsconfig.json
{
  "compilerOptions": {
    "target": "ES3",
    "module": "ES2020",
    "moduleResolution": "Node",
    "strict": false,
    "types": ["@ui5/ts-types"]
  }
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
