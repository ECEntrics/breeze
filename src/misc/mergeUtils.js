const merge = require('deepmerge');
import isPlainObject from 'is-plain-object';

export default function (defaultOptions, customOptions) {
    return merge(defaultOptions, customOptions, {
        isMergeableObject: isPlainObject
    })
}
