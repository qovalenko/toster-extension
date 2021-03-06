import camelCase from 'lodash/camelCase';
import { Observable } from 'typescript-observable';
import { FeaturesAttribute, FeaturesCollection } from '@/features';
import { EventType } from '@/features/types';
import { User } from '@/entity/user';
import { createElementFromHTML } from '@/libs/utils';
import { Storage } from '@/libs/storage';
import { QuestionId, StorageType, Tag } from '@/libs/types';

export abstract class Feature {
    protected storage = new Storage(StorageType.CONTENT);
    protected features: FeaturesCollection = {};
    protected eventBus: Observable = null;

    protected get onQuestionPage (): boolean {
        return !!document.location.pathname.match(/\/q\/(\d+)/i);
    }

    protected get onUserQuestionsPage (): boolean {
        return !!document.location.pathname.match(
            /\/user\/([^\/]+)\/questions/i
        );
    }

    protected get onUserAnswersPage (): boolean {
        const currentUser = this.currentUser;

        if (!currentUser) {
            return false;
        }

        const regexp = new RegExp(`/user/${currentUser.nick}/answers`, 'i');

        return !!document.location.pathname.match(regexp);
    }

    protected get questionsList (): HTMLLIElement[] {
        const questionsList = document.querySelectorAll<HTMLLIElement>(
            '.content-list__item[role="content-list_item"]'
        );

        return questionsList ? Array.from(questionsList) : [];
    }

    protected get top24QuestionsList (): NodeListOf<HTMLDivElement> | any[] {
        const questionsList = document.querySelectorAll<HTMLLIElement>(
            'aside.column_sidebar [role="most_interest"] .content-list.content-list_sidebar-block > .content-list__item'
        );

        return questionsList ? Array.from(questionsList) : [];
    }

    protected get currentUser (): User {
        const userLink = document.querySelector<HTMLAnchorElement>(
            '.user-panel_head a.user-panel__user-name'
        );

        if (!userLink) {
            return null;
        }

        const name = userLink.innerText.trim();
        const nick = userLink
            .getAttribute('href')
            .trim()
            .split('/')
            .pop();
        const user = new User(name, nick);

        return user;
    }

    public setObservers (eventBus: Observable): void {
        this.eventBus = eventBus;

        this.eventBus.on(
            EventType.FEATURES_UPDATE,
            (features: FeaturesCollection) => {
                this.features = features;
            }
        );
    }

    public async execute (): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    protected getAuthorBlock (
        author: User,
        showName: boolean = true,
        showNick: boolean = true
    ): HTMLElement {
        return createElementFromHTML(`
<div class="user-summary__desc" data-user-url="${author.tosterUserPageUrl}">
    ${
        showName
            ? `<a class="user-summary__name" href="${
                  author.tosterUserPageUrl
              }">${author.name}</a>`
            : ''
    }
    ${
        showNick
            ? `<span class="user-summary__nickname">@${author.nick}</span>`
            : ''
    }
</div>
`);
    }

    protected setBodyAttribute (
        featureName: FeaturesAttribute,
        value: string
    ): void {
        document.body.setAttribute(
            `data-feature-${camelCase(featureName)}`,
            value
        );
    }

    protected removeQuestionFromListById (id: QuestionId): void {
        const element = document.querySelector(`[data-question-id="${id}"]`);
        if (element) {
            element.parentElement.removeChild(element);
        }
    }

    protected injectCSSToPage (codeOrUrl: string, inline: boolean = true): void {
        if (inline) {
            const style = document.createElement('style');
            style.textContent = codeOrUrl;
            document.head.appendChild(style);
        } else {
            const link = document.createElement('link');
            link.href = codeOrUrl;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    }

    protected injectJavaScriptToPage (
        codeOrUrl: string,
        inline: boolean = true
    ): void {
        const script = document.createElement('script');
        if (inline) {
            script.textContent = codeOrUrl;
        } else {
            script.src = codeOrUrl;
        }
        document.head.appendChild(script);
    }

    protected makeTags (
        tags: Tag[],
        includeImage: boolean = true
    ): HTMLUListElement {
        const ul = document.createElement('ul');
        ul.className = 'tags-list';
        tags.forEach((tag: Tag) => {
            const li = document.createElement('li');
            const tagLink = document.createElement('a');

            if (includeImage) {
                const imageLink = document.createElement('a');
                const imageImg = document.createElement('img');
                imageLink.className = 'question__tags-image';
                imageLink.href = `https://toster.ru/tag/${tag.slug}`;
                imageImg.className = 'tag__image tag__image_bg';
                imageImg.src = tag.image;

                if (tag.image) {
                    imageLink.appendChild(imageImg);
                    li.appendChild(imageLink);
                }
            }

            li.className = 'tags-list__item';
            tagLink.href = `https://toster.ru/tag/${tag.slug}`;
            tagLink.innerText = tag.name;

            li.appendChild(tagLink);
            ul.appendChild(li);
        });

        return ul;
    }
}
