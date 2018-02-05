'use strict'
function _interopDefault(e) {
  return e && typeof e === 'object' && 'default' in e ? e.default : e
}
function prepPage(e, t, n) {
  const r = {}
  return {
    create: function() {
      let e = this,
        t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
        n = new Set([
          'meta',
          'date',
          'path',
          'permalink',
          'anchors',
          'attributes',
          'body'
        ])
      t.exclude &&
        t.exclude.split(',').forEach(function(e) {
          n.has(e) && n.delete(e)
        })
      let r = {}
      return (
        n.forEach(function(t) {
          t === 'attributes' ? (r = Object.assign({}, e[t], r)) : (r[t] = e[t])
        }),
        r
      )
    },
    get meta() {
      const t = Object.assign({}, e)
      return delete t.filePath, t
    },
    get path() {
      const e = this.permalink
      if (!t.page) {
        return e
      }
      if (n || !r.path) {
        const a = t.page.match(/([^_][a-zA-z]*?)\/[^a-z_]*/)
        a && a[1] !== 'index'
          ? (r.path = path.join(a[1], e).replace(/\\|\/\//, '/'))
          : (r.path = e.replace(/\\|\/\//, '/'))
      }
      return r.path
    },
    get permalink() {
      if (n || !r.permalink) {
        let a = this.date,
          o = e.section,
          i = e.fileName,
          s = getSlug(i),
          u = splitDate(a),
          l = {
            section: o,
            slug: s,
            date: a,
            year: u.year,
            month: u.month,
            day: u.day
          },
          c = permalinkCompiler(t.permalink),
          p = path.join('/', c(l, { pretty: !0 }).replace(/%2F/gi, '/'))
        r.permalink = p.replace(/\\|\\\\/g, '/')
      }
      return r.permalink
    },
    get anchors() {
      if (n || !r.anchors) {
        if (e.fileName.search(/\.md$/) > -1) {
          for (
            var a = this._rawData,
              o = t.anchorsLevel,
              i = new RegExp(
                [
                  '(`{3}[\\s\\S]*?`{3}|`{1}[^`].*?`{1}[^`]*?)',
                  '(#{' + (o + 1) + ',})',
                  '(?:^|\\s)#{' + o + '}[^#](.*)'
                ].join('|'),
                'g'
              ),
              s = void 0,
              u = [];
            (s = i.exec(a.body));

          ) {
            let l = slicedToArray(s, 4),
              c = (l[0], l[1]),
              p = l[2],
              d = l[3]
            if (!c && !p && d) {
              const f = '#' + paramCase(d)
              u.push([f, d])
            }
          }
          r.anchors = u
        } else {
          r.anchors = []
        }
      }
      return r.anchors
    },
    get attributes() {
      return this._rawData.attributes
    },
    get body() {
      if (n || !r.body) {
        let a = this._rawData,
          o = t.parsers,
          i = e.dirName,
          s = e.section,
          u = e.fileName
        if (u.search(/\.comp\.md$/) > -1) {
          let l = '.' + path.join(i, s, u)
          ;(l = l.replace(/\\/, '/')), (r.body = { relativePath: l })
        } else {
          u.search(/\.md$/) > -1
            ? (r.body = o.mdParser(o.md, t).render(a.body))
            : u.search(/\.(yaml|yml)$/) > -1 &&
              (r.body = o.yamlParser().render(a.body))
        }
      }
      return r.body
    },
    get date() {
      if (n || !r.date) {
        let a = e.filePath,
          o = e.fileName,
          i = e.section
        if (t.isPost) {
          const s = o.match(/!?(\d{4}-\d{2}-\d{2})/)
          if (!s) {
            throw Error('Post in "' + i + '" does not have a date!')
          }
          r.date = s[0]
        } else {
          const u = fs.statSync(a)
          r.date = dateFns.format(u.ctime, 'YYYY-MM-DD')
        }
      }
      return r.date
    },
    get _rawData() {
      if (n || !r.data) {
        const t = fs.readFileSync(e.filePath).toString()
        if (e.fileName.search(/\.md$/) > -1) {
          let a = fm(t),
            o = a.attributes,
            i = a.body
          r.data = { attributes: o, body: i }
        } else {
          e.fileName.search(/\.(yaml|yml)$/) > -1 &&
            (r.data = { attributes: {}, body: t })
        }
      }
      return r.data
    }
  }
}
function createDatabase(e, t, n, r) {
  let a = path.join(e, t),
    o = globAndApply(a, new Map(), function(a, o) {
      let i = a.index,
        s = a.fileName,
        u = a.section,
        l = path.join(e, t, u, s),
        c = prepPage(
          { index: i, fileName: s, section: u, dirName: t, filePath: l },
          n,
          r
        )
      o.set(c.permalink, c)
    }),
    i = [].concat(toConsumableArray(o.values()))
  return {
    exists: function(e) {
      return o.has(e)
    },
    find: function(e, t) {
      return o.get(e).create(t)
    },
    findOnly: function(e, t) {
      typeof e === 'string' && (e = e.split(','))
      let n = slicedToArray(e, 2),
        r = n[0],
        a = n[1],
        o = max(0, parseInt(r)),
        s = void 0 !== a ? min(parseInt(a), i.length - 1) : null
      if (!s) {
        return i[o].create(t)
      }
      const u = []
      if (s) {
        for (; o <= s; ) {
          u.push(i[o]), o++
        }
      }
      return u.map(function(e) {
        return e.create(t)
      })
    },
    findBetween: function(e, t) {
      let n = this.findOnly,
        r = e.split(','),
        a = slicedToArray(r, 3),
        s = a[0],
        u = a[1],
        l = a[2]
      if (!o.has(s)) {
        return []
      }
      let c = o.get(s).create(t),
        p = c.meta.index,
        d = i.length - 1,
        f = parseInt(u || 0),
        h = void 0 !== l ? parseInt(l) : null
      if (f === 0 && h === 0) {
        return [c]
      }
      let m = void 0
      m = f === 0 ? [] : [max(0, p - f), max(min(p - 1, d), 0)]
      let g = void 0
      return (
        (g =
          h === 0 || (!h && f === 0)
            ? []
            : [min(p + 1, d), min(p + (h || f), d)]),
        [c, n(m, t), n(g, t)]
      )
    },
    findAll: function(e) {
      return i.map(function(t) {
        return t.create(e)
      })
    }
  }
}
function ContentModule(e) {
  let t = this,
    n = nuxtentConfig(this.options.rootDir) || this.options.nuxtent || {},
    r = mergeContentOptions(n.content, {
      page: null,
      permalink: ':slug',
      anchorsLevel: 1,
      isPost: !0,
      generate: []
    }),
    a = path.join(this.options.srcDir, COMPONENTS_DIR),
    o = path.join(this.options.srcDir, CONTENT_DIR),
    i = '~/' + CONTENT_DIR,
    s = process.env.PORT || process.env.npm_package_config_nuxt_port || 3e3,
    u = this.nuxt.options.dev,
    l = ['.vue', '.js'],
    c = {
      md: Object.assign(
        {},
        { highlight: null, use: [] },
        n.parsers && n.parsers.md ? n.parsers.md : {}
      ),
      mdParser: mdParser,
      yamlParser: yamlParser
    },
    p = { contentDir: o, content: r, parsers: c, isDev: u }
  this.addPlugin({ src: path.resolve(__dirname, 'plugins/requestContent.js') }),
    this.addServerMiddleware({
      path: API_SERVER_PREFIX,
      handler: createRouter(
        getAPIOptions(n.api, !1).baseURL,
        API_SERVER_PREFIX,
        p
      )
    }),
    this.nuxt.hook('build:before', function(e) {
      console.log('starting build nuxtent')
      let r = e.isStatic,
        a = getAPIOptions(n.api, r)
      r &&
        t.nuxt.hook('build:done', function(e) {
          if (r) {
            console.log('opening server connection')
            const n = express__default()
            n.use(
              API_SERVER_PREFIX,
              createRouter(a.baseURL, API_SERVER_PREFIX, p)
            )
            const o = n.listen(s)
            t.nuxt.hook('generate:done', function() {
              console.log('closing server connection'), o.close()
            })
          }
        }),
        t.requireModule([
          '@nuxtjs/axios',
          Object.assign({}, a, {
            baseURL: a.baseURL + API_SERVER_PREFIX,
            browserBaseURL:
              a.browserBaseURL + (r ? API_BROWSER_PREFIX : API_SERVER_PREFIX)
          })
        ]),
        buildContent(t, BUILD_DIR, r, p)
    }),
    this.extendBuild(function(e) {
      e.module.rules.push({
        test: /\.comp\.md$/,
        use: [
          'vue-loader',
          {
            loader: path.resolve(__dirname, 'loader'),
            options: { componentsDir: a, extensions: l, content: r, parsers: c }
          }
        ]
      })
    }),
    this.addPlugin({
      src: path.resolve(__dirname, 'plugins/markdownComponents.template.js'),
      options: { contentDirWebpackAlias: i }
    })
}
Object.defineProperty(exports, '__esModule', { value: !0 })
var path = require('path'),
  express = require('express'),
  express__default = _interopDefault(express),
  querystring = require('querystring'),
  chalk = _interopDefault(require('chalk')),
  fs = require('fs'),
  fm = _interopDefault(require('front-matter')),
  dateFns = _interopDefault(require('date-fns')),
  paramCase = _interopDefault(require('param-case')),
  pathToRegexp = _interopDefault(require('path-to-regexp')),
  yamlit = _interopDefault(require('js-yaml')),
  markdownit = _interopDefault(require('markdown-it')),
  markdownAnchors = _interopDefault(require('markdown-it-anchor')),
  name = 'nuxtent',
  version = '1.2.2',
  description = 'Seamlessly use content files in your Nuxt.js sites.',
  main = 'index.js',
  contributors = ['Alid Castano (@alidcastano)', 'Mehdi Lahlou (@medfreeman)'],
  repository = {
    type: 'git',
    url: 'git+https://github.com/nuxt-community/nuxtent-module.git'
  },
  keywords = [
    'Nuxt.js',
    'Vue.js',
    'Content',
    'Blog',
    'Posts',
    'Collections',
    'Navigation',
    'Markdown',
    'Static'
  ],
  license = 'MIT',
  scripts = {
    '#<git hooks>': 'handled by husky',
    precommit: 'lint-staged',
    '#</git hooks>': 'handled by husky',
    lint: 'eslint --fix "**/*.js"',
    pretest: 'npm run lint',
    e2e: 'cross-env NODE_ENV=test jest --runInBand --forceExit',
    test: 'npm run e2e',
    build: 'cross-env NODE_ENV=production rollup -c rollup.config.js',
    watch: 'npm run build -- -w',
    prepare: 'npm run build',
    release: 'standard-version && git push --follow-tags && npm publish'
  },
  peerDependencies = { '@nuxtjs/axios': '^4.3.0' },
  dependencies = {
    chalk: '^2.1.0',
    'date-fns': '^1.28.5',
    'front-matter': '^2.2.0',
    'js-yaml': '^3.10.0',
    'loader-utils': '^1.1.0',
    'markdown-it': '^8.4.0',
    'markdown-it-anchor': '^4.0.0',
    'param-case': '^2.1.1',
    'path-to-regexp': '^2.0.0',
    uppercamelcase: '^3.0.0'
  },
  devDependencies = {
    '@nuxtjs/axios': '^4.3.0',
    'babel-cli': '^6.26.0',
    'babel-eslint': '^8.0.0',
    'babel-plugin-external-helpers': '^6.22.0',
    'babel-plugin-transform-async-to-generator': '^6.24.1',
    'babel-plugin-transform-object-rest-spread': '^6.26.0',
    'babel-plugin-transform-runtime': '^6.23.0',
    'babel-preset-env': '^1.6.1',
    'babel-preset-stage-2': '^6.24.1',
    chai: '^4.1.2',
    codecov: '^2.3.0',
    'cross-env': '^5.0.5',
    eslint: '^4.7.2',
    'eslint-config-i-am-meticulous': '^7.0.1',
    'eslint-config-prettier': '^2.6.0',
    'eslint-config-prettier-standard': '^1.0.1',
    'eslint-config-standard': '^10.2.1',
    'eslint-plugin-babel': '^4.1.2',
    'eslint-plugin-jest': '^21.1.0',
    'eslint-plugin-node': '^5.1.1',
    'eslint-plugin-prettier': '^2.3.1',
    'eslint-plugin-promise': '^3.5.0',
    'eslint-plugin-standard': '^3.0.1',
    express: '^4.15.5',
    'git-exec-and-restage': '^1.0.1',
    husky: '^0.14.3',
    jest: '^21.1.0',
    jsdom: '^11.2.0',
    'lint-staged': '^4.2.3',
    mocha: '^4.0.0',
    nuxt: '^1.0.0-rc11',
    'prettier-standard': '^7.0.0',
    'request-promise-native': '^1.0.5',
    rollup: '^0.50.0',
    'rollup-plugin-babel': '^3.0.2',
    'rollup-plugin-commonjs': '^8.2.1',
    'rollup-plugin-copy': '^0.2.3',
    'rollup-plugin-filesize': '^1.4.2',
    'rollup-plugin-json': '^2.3.0',
    'rollup-plugin-node-resolve': '^3.0.0',
    'rollup-plugin-uglify-es': '0.0.1',
    'rollup-watch': '^4.3.1',
    'serve-static': '^1.12.6',
    sinon: '^4.0.0',
    'sinon-chai': '^2.13.0',
    'standard-version': '^4.2.0'
  },
  jest = {
    testEnvironment: 'node',
    testMatch: ['**/?(*.)test.js'],
    coverageDirectory: './coverage/',
    mapCoverage: !0,
    collectCoverage: !0
  },
  bugs = { url: 'https://github.com/nuxt-community/nuxtent-module/issues' },
  homepage = 'https://github.com/nuxt-community/nuxtent-module#readme',
  directories = { doc: 'docs', example: 'examples', lib: 'lib', test: 'test' },
  author = 'Alid Castano',
  _package = {
    name: name,
    version: version,
    description: description,
    main: main,
    contributors: contributors,
    repository: repository,
    keywords: keywords,
    license: license,
    scripts: scripts,
    peerDependencies: peerDependencies,
    dependencies: dependencies,
    devDependencies: devDependencies,
    jest: jest,
    bugs: bugs,
    homepage: homepage,
    directories: directories,
    author: author,
    'lint-staged': {
      '*.js': [
        'git-exec-and-restage eslint --fix --',
        'git-exec-and-restage prettier-standard'
      ]
    }
  },
  asyncGenerator = (function() {
    function e(e) {
      this.value = e
    }
    function t(t) {
      function n(e, t) {
        return new Promise(function(n, a) {
          const s = { key: e, arg: t, resolve: n, reject: a, next: null }
          i ? (i = i.next = s) : ((o = i = s), r(e, t))
        })
      }
      function r(n, o) {
        try {
          let i = t[n](o),
            s = i.value
          s instanceof e
            ? Promise.resolve(s.value).then(
                function(e) {
                  r('next', e)
                },
                function(e) {
                  r('throw', e)
                }
              )
            : a(i.done ? 'return' : 'normal', i.value)
        } catch (e) {
          a('throw', e)
        }
      }
      function a(e, t) {
        switch (e) {
          case 'return':
            o.resolve({ value: t, done: !0 })
            break
          case 'throw':
            o.reject(t)
            break
          default:
            o.resolve({ value: t, done: !1 })
        }
        ;(o = o.next) ? r(o.key, o.arg) : (i = null)
      }
      let o, i
      ;(this._invoke = n),
        typeof t.return !== 'function' && (this.return = void 0)
    }
    return (
      typeof Symbol === 'function' &&
        Symbol.asyncIterator &&
        (t.prototype[Symbol.asyncIterator] = function() {
          return this
        }),
      (t.prototype.next = function(e) {
        return this._invoke('next', e)
      }),
      (t.prototype.throw = function(e) {
        return this._invoke('throw', e)
      }),
      (t.prototype.return = function(e) {
        return this._invoke('return', e)
      }),
      {
        wrap: function(e) {
          return function() {
            return new t(e.apply(this, arguments))
          }
        },
        await: function(t) {
          return new e(t)
        }
      }
    )
  })(),
  objectWithoutProperties = function(e, t) {
    const n = {}
    for (const r in e) {
      t.indexOf(r) >= 0 ||
        (Object.prototype.hasOwnProperty.call(e, r) && (n[r] = e[r]))
    }
    return n
  },
  slicedToArray = (function() {
    function e(e, t) {
      let n = [],
        r = !0,
        a = !1,
        o = void 0
      try {
        for (
          var i, s = e[Symbol.iterator]();
          !(r = (i = s.next()).done) && (n.push(i.value), !t || n.length !== t);
          r = !0
        ) {}
      } catch (e) {
        ;(a = !0), (o = e)
      } finally {
        try {
          !r && s.return && s.return()
        } finally {
          if (a) {
            throw o
          }
        }
      }
      return n
    }
    return function(t, n) {
      if (Array.isArray(t)) {
        return t
      }
      if (Symbol.iterator in Object(t)) {
        return e(t, n)
      }
      throw new TypeError(
        'Invalid attempt to destructure non-iterable instance'
      )
    }
  })(),
  toConsumableArray = function(e) {
    if (Array.isArray(e)) {
      for (var t = 0, n = Array(e.length); t < e.length; t++) {
        n[t] = e[t]
      }
      return n
    }
    return Array.from(e)
  },
  permalinkCompiler = pathToRegexp.compile,
  getSlug = function(e) {
    const t = e
      .replace(/(\.comp)?(\.[0-9a-z]+$)/, '')
      .replace(/!?(\d{4}-\d{2}-\d{2}-)/, '')
    return paramCase(t)
  },
  splitDate = function(e) {
    let t = e.split('-'),
      n = slicedToArray(t, 3)
    return { year: n[0], month: n[1], day: n[2] }
  },
  max = Math.max,
  min = Math.min,
  globAndApply = function e(t, n, r) {
    const a =
      arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : '/'
    return (
      fs
        .readdirSync(t)
        .reverse()
        .forEach(function(o, i) {
          const s = path.join(t, o)
          fs.statSync(s).isFile()
            ? r({ index: i, fileName: o, section: a }, n)
            : e(s, n, r, path.join(a, o))
        }),
      n
    )
  },
  logRequest = function(e, t) {
    console.log(chalk.blue(e) + ' ' + chalk.green('GET') + ' ' + t)
  },
  response = function(e) {
    return {
      json: function(t) {
        e.setHeader('Content-Type', 'application/json'),
          e.end(JSON.stringify(t), 'utf-8'),
          console.log('\tResponse sent successfully.')
      },
      error: function(t) {
        ;(e.statusCode = 500),
          (e.statusMessage = 'Internal Server Error'),
          e.end(t.stack || String(t)),
          console.log('\tFailed to send response.', t)
      },
      notFound: function() {
        ;(e.statusCode = 404),
          (e.statusMessage = 'Not Found'),
          e.end(),
          console.log('\tPage not found.')
      }
    }
  },
  curryResponseHandler = function(e, t, n, r, a, o) {
    const i = createDatabase(r, n, a, o)
    return function(n, r) {
      let a = response(r),
        o = n.params[0]
      o = o.replace(/\\|\/\//g, '/')
      let s = n.url.match(/\?(.*)/) || [],
        u = slicedToArray(s, 2),
        l = (u[0], u[1]),
        c = querystring.parse(l),
        p = c.only,
        d = c.between,
        f = objectWithoutProperties(c, ['only', 'between'])
      logRequest(t, e + o),
        o === '/'
          ? d
            ? a.json(i.findBetween(d, f))
            : p ? a.json(i.findOnly(p, f)) : a.json(i.findAll(f))
          : i.exists(o) ? a.json(i.find(o, f)) : a.notFound()
    }
  },
  createRouter = function(e, t, n) {
    let r = express.Router(),
      a = n.contentDir,
      o = n.content,
      i = n.parsers,
      s = n.isDev
    return (
      o['/'] ||
        r.use(
          '/',
          new express.Router().get('/', function(e, t) {
            response(t).json({ 'content-endpoints': Object.keys(o) })
          })
        ),
      Object.keys(o).forEach(function(n) {
        let u = Object.assign({}, o[n], { parsers: i }),
          l = curryResponseHandler(e, t, n, a, u, s)
        r.use(n, new express.Router().get('*', l))
      }),
      r
    )
  },
  buildPath = function(e, t, n) {
    const r = e.replace(/(?!^\/)\//g, '.')
    return path.join(n, t, r) + '.json'
  },
  routeName = function(e) {
    return e
      .replace(/^\//, '')
      .replace('/', '-')
      .replace('_', '')
  },
  asset = function(e) {
    const t = JSON.stringify(
      e,
      null,
      process.env.NODE_ENV === 'production' ? 0 : 2
    )
    return {
      source: function() {
        return t
      },
      size: function() {
        return t.length
      }
    }
  },
  interceptRoutes = function(e, t) {
    e.extendRoutes(function(e) {
      e.forEach(function(e) {
        t.has(e.name)
          ? (e.path = '/' + t.get(e.name))
          : e.children &&
            e.children.forEach(function(e) {
              if (t.has(e.name)) {
                const n = e.path.match(/\?$/)
                e.path = n ? t.get(e.name) + '?' : t.get(e.name)
              }
            })
      })
    })
  },
  addRoutes = function(e, t) {
    e.generate || (e.generate = {}),
      e.generate.routes || (e.generate.routes = [])
    const n = e.generate.routes
    Array.isArray(n)
      ? (e.generate.routes = n.concat(t))
      : e.generate.routes().then(function(e) {
          return e.concat(t)
        })
  },
  addAssets = function(e, t) {
    e.build.plugins.push({
      apply: function(e) {
        e.plugin('emit', function(e, n) {
          t.forEach(function(t, n) {
            e.assets[n] = asset(t)
          }),
            n()
        })
      }
    })
  },
  buildContent = function(e, t, n, r) {
    let a = r.contentDir,
      o = r.content,
      i = r.parsers,
      s = r.isDev,
      u = [],
      l = new Map(),
      c = new Map()
    Object.keys(o).forEach(function(e) {
      let r = o[e],
        p = r.page,
        d = r.generate,
        f = r.permalink,
        h = void 0
      if ((p && ((h = routeName(p)), l.set(h, f.replace(/^\//, ''))), d && n)) {
        let m = Object.assign({}, o[e], { parsers: i }),
          g = createDatabase(a, e, m, s)
        d.forEach(function(n) {
          const r = {}
          if (typeof n === 'string') {
            r.method = n
          } else if (Array.isArray(n)) {
            let a = slicedToArray(n, 2),
              o = a[0],
              i = a[1]
            ;(r.method = o),
              (r.query = i.query ? i.query : {}),
              (r.args = i.args ? i.args : [])
          }
          switch (r.method) {
            case 'get':
              if (!p) {
                throw new Error('You must specify a page path')
              }
              g.findAll(r.query).forEach(function(n) {
                u.push(n.permalink), c.set(buildPath(n.permalink, e, t), n)
              })
              break
            case 'getAll':
              c.set(buildPath('_all', e, t), g.findAll(r.query))
              break
            case 'getOnly':
              c.set(buildPath('_only', e, t), g.findOnly(r.args, r.query))
              break
            default:
              throw new Error(
                'The ' + r.method + ' is not supported for static builds.'
              )
          }
        })
      }
    }),
      interceptRoutes(e, l),
      addRoutes(e.options, u),
      addAssets(e.options, c)
  },
  mdParser = function(e, t) {
    let n = t.anchorsLevel,
      r = { preset: 'default', html: !0, typographer: !0, linkify: !0 }
    void 0 !== e.extend && e.extend(r)
    const a = markdownit(r)
    return (
      [[markdownAnchors, { level: [n] }]]
        .concat(e.plugins || [])
        .forEach(function(e) {
          Array.isArray(e) ? a.use.apply(a, e) : a.use(e)
        }),
      void 0 !== e.customize && e.customize(a),
      a
    )
  },
  yamlParser = function() {
    return { render: yamlit.safeLoad }
  },
  nuxtentConfig = function(e) {
    const t = path.join(e, 'nuxtent.config.js')
    try {
      return require(t)
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        return !1
      }
      throw new Error('[Invalid Nuxtent configuration] ' + e)
    }
  },
  mergeContentOptions = function(e, t) {
    const n = {}
    return (
      Array.isArray(e)
        ? e.forEach(function(r) {
            let a = Array.isArray(r),
              o = a ? r[0] : r,
              i = a ? r[1] : {}
            if (o === '/' && e.length > 1) {
              throw new Error(
                'Top level files not allowed with nested registered directories'
              )
            }
            n[path.join('/', o)] = Object.assign({}, t, i)
          })
        : (n['/'] = Object.assign({}, t, e)),
      n
    )
  },
  getAPIOptions = function() {
    let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
      t = arguments[1],
      n = typeof e === 'function' ? e(t) : e,
      r = n.baseURL,
      a = void 0 === r ? '' : r,
      o = n.browserBaseURL,
      i = void 0 === o ? void 0 : o,
      s = n.otherAPIOptions,
      u = void 0 === s ? {} : s
    return Object.assign({ baseURL: a, browserBaseURL: i || a }, u)
  },
  CONTENT_DIR = 'content',
  COMPONENTS_DIR = 'components',
  BUILD_DIR = 'content',
  API_SERVER_PREFIX = '/content-api',
  API_BROWSER_PREFIX = '/_nuxt/content'
;

(exports.default = ContentModule), (exports.meta = _package)
