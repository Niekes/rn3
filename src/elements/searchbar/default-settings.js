import defaults from '../../utils/default-settings';

export default {
    ...defaults,
    request: {
        url: 'https://nominatim.openstreetmap.org',
        options: {
            method: 'GET',
        },
        params: {
            city: '{query}',
            format: 'json',
            limit: 20,
            addressdetails: 1,
            email: 'info@niekes.com',
        },
        callback: response => response.json(),
        error: 'An error occured. Please try again later',
        noResults: 'No results found',
        loading: '...',
    },
    identity: 'osm_id',
    input: {
        pre: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="currentColor" d="M23.7 22.281l-6.887-6.89a9.318 9.318 0 002.171-5.98c0-5.184-4.254-9.4-9.488-9.4C4.266.012 0 4.232 0 9.415c0 5.184 4.254 9.399 9.488 9.399 2.223 0 4.27-.762 5.89-2.036l6.911 6.91a.975.975 0 001.41 0 .97.97 0 000-1.406zM2.015 9.414c0-4.074 3.355-7.383 7.472-7.383 4.117 0 7.473 3.309 7.473 7.383s-3.356 7.383-7.473 7.383-7.472-3.317-7.472-7.383zm0 0"/></svg>',
        item: {
            render: d => d.display_name,
        },
        placeholder: 'Type to search',
        suf: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="currentColor" d="M20.14 4h-9.77a3 3 0 00-2 .78l-.1.11-6 7.48a1 1 0 00.11 1.37l6 5.48a3 3 0 002 .78h9.77A1.84 1.84 0 0022 18.18V5.82A1.84 1.84 0 0020.14 4zm-3.43 9.29a1 1 0 010 1.42 1 1 0 01-1.42 0L14 13.41l-1.29 1.3a1 1 0 01-1.42 0 1 1 0 010-1.42l1.3-1.29-1.3-1.29a1 1 0 011.42-1.42l1.29 1.3 1.29-1.3a1 1 0 011.42 1.42L15.41 12z"/></svg>',
        mic: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="currentColor" d="M15.105 5.117c0-1.71-1.253-3.117-2.777-3.117h-.656c-1.524.004-2.777 1.41-2.781 3.117v.7h6.214zm1.727 2.23c-.52 0-.945.477-.945 1.06v3.382c-.004 1.887-1.274 3.496-2.946 3.727v-1.2c1.266-.32 2.168-1.59 2.164-3.039V6.754H8.891v4.523c0 1.453.902 2.723 2.164 3.04v1.199c-1.668-.23-2.938-1.84-2.942-3.727V8.406c0-.582-.425-1.058-.945-1.058s-.941.476-.941 1.058v3.383c-.004 1.512.52 2.965 1.449 4.055.89 1.047 2.094 1.691 3.379 1.8v2.239H9.05c-.512.015-.922.488-.922 1.058 0 .57.41 1.043.922 1.059h5.898c.508-.016.918-.488.918-1.059 0-.57-.41-1.043-.918-1.058h-2.008v-2.238c1.29-.11 2.493-.754 3.383-1.801.93-1.09 1.45-2.543 1.45-4.055V8.406c0-.582-.426-1.058-.946-1.058zm0 0"/></svg>',
    },
    dropdown: {
        item: {
            render: d => d.display_name,
        },
    },
};
