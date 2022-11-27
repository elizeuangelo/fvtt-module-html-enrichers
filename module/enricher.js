function createEnricher(pattern, enricher) {
	return {
		pattern,
		enricher,
	};
}

export const lightIcon = {
	on: 'fa-lightbulb-on',
	off: 'fa-lightbulb',
	broken: 'fa-lightbulb-slash',
};

const lightEnricher = createEnricher(/@Light\[([^#\]]+)](?:{([^}]+)})?/g, function (match, { relativeTo, secrets, async }) {
	const ids = match[1],
		name = match[2];

	const light = canvas.lighting.documentCollection.get(ids.split(',')[0]);
	const broken = !Boolean(light);
	const icon = 'fa-regular ' + (broken ? lightIcon.broken : light.hidden ? lightIcon.off : lightIcon.on);

	const dataset = {
		ids,
		tooltip: 'Ambient Light',
		name,
		broken,
	};

	const a = document.createElement('a');
	a.classList.add('light-link', 'custom-link');
	a.draggable = true;

	for (let [k, v] of Object.entries(dataset)) {
		a.dataset[k] = v;
	}

	a.innerHTML = `<i class="${icon}"></i>${name}`;

	return a;
});

export const sceneIcon = {
	normal: 'fa-location-dot',
	broken: 'fa-location-dot-slash',
};

const activateSceneEnricher = createEnricher(/@Activate\[([^#\]]+)](?:{([^}]+)})?/g, function (match, { relativeTo, secrets, async }) {
	const id = match[1],
		name = match[2];

	const scene = game.scenes.get(id);
	const broken = !Boolean(scene);
	const icon = 'fa-regular ' + (broken ? sceneIcon.broken : sceneIcon.normal);

	const dataset = {
		id,
		tooltip: 'Activate Scene',
		name,
		broken,
	};

	const a = document.createElement('a');
	a.classList.add('scene-link', 'custom-link');
	a.draggable = true;

	for (let [k, v] of Object.entries(dataset)) {
		a.dataset[k] = v;
	}

	a.innerHTML = `<i class="${icon}"></i>${name}`;

	return a;
});

Hooks.once('ready', () => {
	CONFIG.TextEditor.enrichers.push(lightEnricher);
	CONFIG.TextEditor.enrichers.push(activateSceneEnricher);

	const a = document.createElement('a');
	a.classList.add('light-link', 'custom-link');
	a.draggable = true;
});
