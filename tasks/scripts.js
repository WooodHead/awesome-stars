import gulp from 'gulp';
import gulpif from 'gulp-if';
import { log, colors } from 'gulp-util';
import named from 'vinyl-named';
import webpack from 'webpack';
import gulpWebpack from 'webpack-stream';
import plumber from 'gulp-plumber';
import livereload from 'gulp-livereload';
import args from './lib/args';

const ENV = args.production ? 'production' : 'development';

gulp.task('scripts', () => gulp.src('app/scripts/*.+(js|jsx)')
  .pipe(plumber({ errorHandler: function() { /* Webpack will log the errors */ } }))
  .pipe(named())
  .pipe(gulpWebpack({
    devtool: args.sourcemaps ? 'inline-source-map' : false,
    watch: args.watch,
    resolve: { extensions: ['.js', '.jsx'] },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': { NODE_ENV: JSON.stringify(ENV) },
        __ENV__: JSON.stringify(ENV),
        __VENDOR__: JSON.stringify(args.vendor),
      }),
    ].concat(args.production ? [new webpack.optimize.UglifyJsPlugin()] : []),
    module: {
      rules: [
        { test: /\.jsx?$/, loader: 'eslint-loader', exclude: /node_modules/, enforce: 'pre' },
        { test: /\.jsx?$/, loader: 'babel-loader', enforce: 'post' }
      ],
    },
  }, webpack, (err, stats) => {
    log(`Finished '${colors.cyan('scripts')}'`, stats.toString({
      chunks: false,
      colors: true,
      cached: false,
      children: false,
    }));
  }))
  .pipe(gulp.dest(`dist/${args.vendor}/scripts`))
  .pipe(gulpif(args.watch, livereload())));
