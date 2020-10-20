let fs = require('fs-extra');
let rollup = require('rollup');
let commonjs = require('rollup-plugin-commonjs');    // require
let resolve = require('rollup-plugin-node-resolve'); // require from node_modules
let terser = require('rollup-plugin-terser').terser; // minify
let prettier = require('rollup-plugin-prettier');


async function build(inputOptions, outputOptions) {
    // create a bundle
    const bundle = await rollup.rollup(inputOptions);

    // generate code and a sourcemap
    const { code, map } = await bundle.generate(outputOptions);

    // or write the bundle to disk
    await bundle.write(outputOptions);
}

/*******************************************
 *  Debug build
 ******************************************/

build({
    input: 'src/EdgeSplitModifier.js',
    plugins:  [ commonjs(), resolve() ],
    external: [ 'three' ],
}, {
    format: 'umd',
    name: 'THREEEdgeSplitModifier',
    file: './dist/browser/three-js-edge-split-modifier.js',
    globals: {
        'three' : 'THREE'
    }
});


/*******************************************
 *  Minified build
 ******************************************/

build({
    input: 'src/EdgeSplitModifier.js',
    plugins:  [
        commonjs(),
        resolve(),
        terser(),
        prettier({
          parser: 'babel',
          tabWidth: 0,
          singleQuote: false,
          bracketSpacing:false
        })
    ],
    external: [ 'three' ],
}, {
    format: 'umd',
    name: 'THREEEdgeSplitModifier',
    file: './dist/browser/three-js-edge-split-modifier.min.js',
    globals: {
        'three' : 'THREE'
    }
});

