import { test } from 'tape';
import { transparentize, getContrast, getUniqueColorByInt } from '../../src/utils/color.js';

test('Passed color is transparentized', (t) => {
    t.equals(transparentize('#000').opacity, 0);
    t.equals(transparentize('#ccc').opacity, 0);
    t.equals(transparentize('black').opacity, 0);
    t.equals(transparentize('white').opacity, 0);

    t.end();
});

test('Get black or white depending on passed color\'s brightness value', (t) => {
    t.equals(getContrast('#000'), '#fff');
    t.equals(getContrast('#fff'), '#000');
    t.equals(getContrast('white'), '#000');
    t.equals(getContrast('black'), '#fff');
    t.equals(getContrast('yellow'), '#000');
    t.equals(getContrast('deeppink'), '#000');
    t.end();
});

test('Get unique color by integer', (t) => {
    t.equals(getUniqueColorByInt(0), 'rgb(0, 0, 0)');
    t.equals(getUniqueColorByInt(1), 'rgb(0, 0, 1)');
    t.equals(getUniqueColorByInt(2), 'rgb(0, 0, 2)');
    t.equals(getUniqueColorByInt(3), 'rgb(0, 0, 3)');
    t.end();
});
