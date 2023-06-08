//
//  index.ts
//
//  The MIT License
//  Copyright (c) 2021 - 2023 O2ter Limited. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//

import _ from 'lodash';
import { Logger, compileStringAsync } from 'sass';
import { bootstrap } from './bootstrap';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';

const compile = async (
  styles: Record<string, string | number | boolean>,
  logger: Logger,
) => {

  const source = `
    ${_.map(styles, (value, key) => `$${key}: ${value};`).join('\n')}
    @import "bootstrap";
  `;

  const result = await compileStringAsync(source, {
    logger,
    url: new URL('file://'),
    importer: {
      canonicalize(url) { return new URL(url); },
      load(canonicalUrl) {

        const pathname = canonicalUrl.pathname.startsWith('/') ? canonicalUrl.pathname.slice(1) : canonicalUrl.pathname;
        const path = pathname.split('/');
        const privateFile = [...path.slice(0, -1), `_${_.last(path)}`].join('/');

        const contents = bootstrap[pathname] ?? bootstrap[`${pathname}.scss`] ?? bootstrap[`${privateFile}.scss`];
        if (_.isNil(contents)) return null;

        return {
          contents,
          syntax: 'scss'
        };
      },
    },
  });

  return result.css.toString();
}

const prefixer = async (css: string, logger: Logger) => {
  const result = await postcss([autoprefixer()]).process(css);
  if (_.isFunction(logger?.warn)) {
    for (const warning of result.warnings()) {
      logger.warn(warning.toString(), { deprecation: false });
    }
  }
  return result.css;
}

export const compileString = async (
  styles: Record<string, string | number | boolean> = {},
  logger: Logger = Logger.silent,
) => {
  const result = await compile(styles, logger);
  return prefixer(result, logger);
}