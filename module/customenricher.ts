//@ts-nocheck

interface Button {
	label: string;
	class: string;
	icon: string;
	onclick: (config) => {};
	onclick2: (config, link: string) => {};
}

interface ContextMenuEntry {
	name: string;
	icon: string;
	callback: (el, link, id) => void;
}

interface ButtonData {
	hook: string;
	btn: Button;
}

interface ContextMenuData {
	hook: string;
	btn: ContextMenuEntry;
}

interface Data {
	name: string;
	action?: string;
	defaultLinkName?: string;
	tooltip: string;
	button?: ButtonData;
	contextmenu?: ContextMenuData;
	collection: any;
	linkicon: (doc: any) => string;
	onclick: (documents: any[], el: HTMLElement) => void;
}

export class CustomEnricher {
	static enrichers: Record<string, CustomEnricher> = {};
	readonly name: string;
	readonly action: string;
	readonly defaultLinkName: string;
	readonly button: ButtonData | undefined;
	readonly contextmenu: ContextMenuData | undefined;
	readonly onclick: () => void;
	readonly linkicon: (doc: any) => string;
	readonly pattern: RegExp;
	readonly collection: any;

	constructor(data: Data) {
		this.name = data.name;
		this.action = data.action ?? this.name.titleCase();
		this.defaultLinkName = data.defaultLinkName ?? this.name.titleCase();
		this.tooltip = data.tooltip;
		this.onclick = data.onclick;
		this.linkicon = data.linkicon;
		this.pattern = new RegExp(`@${this.action}\\[([^#\\]]+)](?:{([^}]+)})?`, 'g');
		this.collection = data.collection;

		this.button = data.button;
		this.hookButton();

		this.contextmenu = data.contextmenu;
		this.hookContextMenu();

		if (game.ready) CONFIG.TextEditor.enrichers.push({ pattern: this.pattern, enricher: this.enricher.bind(this) });
		else Hooks.once('ready', () => CONFIG.TextEditor.enrichers.push({ pattern: this.pattern, enricher: this.enricher.bind(this) }));

		CustomEnricher.enrichers[this.name] = this;
	}

	createLink(ids: string[], name) {
		if (!name) name = this.collection.get(ids[0])?.name ?? this.defaultLinkName;
		return `@${this.action}[${ids}]{${name}}`;
	}
	hookButton() {
		if (this.button === undefined) return;
		this.button.btn.onclick2 = this.button.btn.onclick;
		Hooks.on(this.button.hook, (config, buttons: Button[]) => {
			if (!game.user.isGM) return;
			this.button!.btn.onclick = (event) => {
				const link = this.createLink([config.object.id]);
				this.button.btn.onclick2(config, link);
			};
			buttons.unshift(this.button!.btn);
		});
	}
	hookContextMenu() {
		if (this.contextmenu === undefined) return;
		this.contextmenu.entry.onclick = this.contextmenu.entry.callback;
		Hooks.on(this.contextmenu.hook, (ev, entries) => {
			if (!game.user.isGM) return;
			this.contextmenu.entry.callback = (li) => {
				const id = li[0].dataset.documentId;
				const link = this.createLink([id]);
				this.contextmenu.entry.onclick(li, link, id);
			};
			entries.push(this.contextmenu!.entry);
		});
	}
	enricher(match: RegExpMatchArray): HTMLElement {
		const ids = match[1],
			name = match[2];

		const doc = this.collection.get(ids.split(',')[0]);
		const broken = !Boolean(doc);
		const icon = 'fa-regular ' + this.linkicon(doc);

		const dataset = {
			ids,
			tooltip: this.tooltip,
			name,
		};

		const a = document.createElement('a');
		a.classList.add(`${this.name}-link`, 'custom-link');
		if (broken) a.classList.add('broken');
		a.draggable = true;

		for (let [k, v] of Object.entries(dataset)) {
			a.dataset[k] = v;
		}

		a.innerHTML = `<i class="${icon}"></i>${name}`;

		return a;
	}
}

document.addEventListener('dragstart', (ev) => {
	let el = ev.target;
	for (let i = 0; i < 2; i++) {
		if (!el) break;
		if (el.localName === 'a' && el.classList.contains('custom-link')) {
			const match = /([a-z-]+)-link/.exec(el.className);
			if (!match) break;
			const enricher = CustomEnricher.enrichers[match[1]];
			const link = enricher.createLink(el.dataset.ids, el.dataset.name);
			ev.dataTransfer?.setData('text/plain', link);
			return;
		}
		el = el.parentElement;
	}
});

document.addEventListener('click', async (pointerEvent: PointerEvent) => {
	let el = pointerEvent.target;
	for (let i = 0; i < 2; i++) {
		if (!el) break;
		if (el.localName === 'a' && el.classList.contains('custom-link') && !el.classList.contains('broken')) {
			const match = /([a-z-]+)-link/.exec(el.className);
			if (!match) break;
			const enricher = CustomEnricher.enrichers[match[1]];
			const ids = el.dataset.ids.split(',');
			enricher.onclick(
				ids.map((id) => enricher.collection.get(id)),
				el
			);
			return;
		}
		el = el.parentElement;
	}
});
