//
//  index.ts
//
//  The MIT License
//  Copyright (c) 2021 - 2022 O2ter Limited. All rights reserved.
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
import sass from 'sass';
import { bootstrap } from './bootstrap';

const defaultThemeColors = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'error',
  'danger',
  'light',
  'dark',
];

const defaultBreakpoints = {
  xs: '0',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1400px',
};

const defaultStyles = {
  white: '#fff',
  'gray-100': '#f8f9fa',
  'gray-200': '#e9ecef',
  'gray-300': '#dee2e6',
  'gray-400': '#ced4da',
  'gray-500': '#adb5bd',
  'gray-600': '#6c757d',
  'gray-700': '#495057',
  'gray-800': '#343a40',
  'gray-900': '#212529',
  black: '#000',

  blue: '#0d6efd',
  indigo: '#6610f2',
  purple: '#6f42c1',
  pink: '#d63384',
  red: '#dc3545',
  orange: '#fd7e14',
  yellow: '#ffc107',
  green: '#198754',
  teal: '#20c997',
  cyan: '#0dcaf0',

  primary: '#0d6efd',
  secondary: '#6c757d',
  success: '#198754',
  info: '#0dcaf0',
  warning: '#ffc107',
  error: '#dc3545',
  danger: '#dc3545',
  light: '#f8f9fa',
  dark: '#212529',

  'min-contrast-ratio': '4.5',

  'color-contrast-dark': '#000',
  'color-contrast-light': '#fff',

  'spacer': '1rem',

  'theme-colors': `(
    ${_.map(defaultThemeColors, (color) => `"${color}": $${color},`).join('\n')}
  )`,

  'grid-breakpoints': `(
    ${_.map(defaultBreakpoints, (value, key) => `${key}: ${value},`).join('\n')}
  )`,
}

export const cssString = async (
  styles: Record<string, string> = {},
) => {

  const _style = _.assign({}, defaultStyles, styles);
  const source = `
    ${_.map(_style, (value, key) => `$${key}: ${value};`).join('\n')}
    @import "bootstrap";
  `;

  const result = await sass.compileStringAsync(source, {
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

export default cssString;