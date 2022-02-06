import { test } from 'tape';
import { select } from 'd3';

test.skip('Component should be initialzed correctly', (t) => {
    select('body').html(null);

    const rn3Dropdown = document.createElement('rn3-dropdown');

    rn3Dropdown.setAttribute('id', 'dropdown');

    document.body.appendChild(rn3Dropdown);

    console.log(rn3Dropdown);

    t.equals(rn3Dropdown, true);

    t.end();
});
