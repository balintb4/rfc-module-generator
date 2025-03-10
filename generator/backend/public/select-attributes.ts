document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const entityName = urlParams.get('entity');
    const entityNameElement = document.getElementById('entityName');
    if (entityNameElement) {
        entityNameElement.textContent = entityName || '';
    }

    if (!entityName) {
        console.error('Entity name is not provided in the URL parameters.');
        return;
    }

    try {
        interface Attribute {
            name: string;
            description: string;
        }

        interface Entity {
            name: string;
            attributes: Attribute[];
        }

        const response = await fetch(`https://if200147.cloud.htl-leonding.ac.at/api/generator/entities`);
        const entities: Entity[] = await response.json();
        const entity = entities.find((e: Entity) => e.name === entityName);

        if (entity) {
            const attributesContainer = document.getElementById('attributesContainer');
            if (attributesContainer) {
                attributesContainer.innerHTML = '';

                entity.attributes.forEach((attr: Attribute) => {
                    const card = document.createElement('div');
                    card.classList.add('attribute-item');

                    const attrCheckbox = document.createElement('input');
                    attrCheckbox.type = 'checkbox';
                    attrCheckbox.value = attr.name;
                    attrCheckbox.checked = (JSON.parse(localStorage.getItem(`selectedAttributes_${entityName}`) || '[]')).includes(attr.name);

                    const attrLabel = document.createElement('label');
                    attrLabel.htmlFor = attr.name;
                    attrLabel.textContent = `${attr.name} (${attr.description})`;

                    card.appendChild(attrCheckbox);
                    card.appendChild(attrLabel);
                    attributesContainer.appendChild(card);
                });

                const selectAllButton = document.getElementById('selectAllAttributes');
                const deselectAllButton = document.getElementById('deselectAllAttributes');
                const checkboxes = document.querySelectorAll<HTMLInputElement>('[type="checkbox"]');

                selectAllButton?.addEventListener('click', () => {
                    checkboxes.forEach(checkbox => checkbox.checked = true);
                });

                deselectAllButton?.addEventListener('click', () => {
                    checkboxes.forEach(checkbox => checkbox.checked = false);
                });
            }

            const saveButton = document.getElementById('saveButton');
            if (saveButton) {
                saveButton.addEventListener('click', () => {
                    if (attributesContainer) {
                        const selectedAttributes = Array.from(attributesContainer.querySelectorAll('input[type="checkbox"]:checked')).map((checkbox: Element) => (checkbox as HTMLInputElement).value);
                        localStorage.setItem(`selectedAttributes_${entityName}`, JSON.stringify(selectedAttributes));
                        saveEntityAndAttributes(entityName, selectedAttributes);
                        window.location.href = 'https://if200147.cloud.htl-leonding.ac.at/select-entities.html';
                    }
                });
            }

            const backButton = document.getElementById('backButton');
            if (backButton) {
                backButton.addEventListener('click', () => {
                    window.location.href = 'https://if200147.cloud.htl-leonding.ac.at/select-entities.html';
                });
            }
        }
    } catch (error) {
        console.error('Error loading the attributes:', error);
    }
});

function saveEntityAndAttributes(entityName: string, selectedAttributes: string[]) {
    const selectedEntitiesAndAttributes = JSON.parse(localStorage.getItem('selectedEntitiesAndAttributes') || '[]');
    const entityIndex = selectedEntitiesAndAttributes.findIndex((e: { name: string }) => e.name === entityName);

    if (entityIndex !== -1) {
        selectedEntitiesAndAttributes[entityIndex].attributes = selectedAttributes;
    } else {
        selectedEntitiesAndAttributes.push({ name: entityName, attributes: selectedAttributes });
    }

    localStorage.setItem('selectedEntitiesAndAttributes', JSON.stringify(selectedEntitiesAndAttributes));
}
