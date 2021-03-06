import { browser } from 'webextension-polyfill-ts';

export const omniboxOnInputEnteredHandler = (search: string) => {
    const url = `https://toster.ru/search?q=${encodeURIComponent(search)}`;

    browser.tabs.query({ active: true }).then((activeTabs) => {
        const tab = activeTabs[0];
        browser.tabs.update(tab.id, { url });
    });
};
