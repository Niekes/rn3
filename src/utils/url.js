export function constructUrl(url, params, value) {
    try {
        const u = new URL(url);

        Object
            .keys(params)
            .forEach((key) => {
                const v = String(params[key]);

                if (v.includes('{query}')) {
                    u.searchParams.set(key, v.replace(/{query}/gi, () => value));
                }

                if (!v.includes('{query}')) {
                    u.searchParams.set(key, v);
                }
            });

        return u;
    } catch (e) {
        return null;
    }
}

export function isValidUrl(url) {
    try {
        return new URL(url);
    } catch (e) {
        return false;
    }
}
