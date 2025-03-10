

document.addEventListener('DOMContentLoaded', async function () {
    let entities: any[] = [];
    

    try {
        const response = await fetch(`https://if200147.cloud.htl-leonding.ac.at/api/generator/entities`);
        entities = await response.json();

        const tableBody = document.getElementById('entitiesTable')!.getElementsByTagName('tbody')[0];
        const entitySearchInput = document.getElementById('entitySearch') as HTMLInputElement;

        function displayEntities(filteredEntities: any[]) {
            tableBody.innerHTML = '';
            filteredEntities.forEach(entity => {
                const row = tableBody.insertRow();
                const selectCell = row.insertCell(0);
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.setAttribute('data-entity', entity.name);

                if (entity.name.includes('Response') || entity.name.includes('Request')) {
                    checkbox.checked = true;
                    checkbox.disabled = true;
                }

                const savedSelection = JSON.parse(localStorage.getItem('selectedEntitiesAndAttributes') || '[]');
                const savedEntity = savedSelection.find((e: any) => e.name === entity.name);
                if (savedEntity) {
                    checkbox.checked = true;
                    localStorage.setItem(`selectedAttributes_${entity.name}`, JSON.stringify(savedEntity.attributes));
                }

                checkbox.addEventListener('change', () => {
                    saveSelectionForAll(entities);
                    updateAttributeLinks(entities);
                });

                selectCell.appendChild(checkbox);
                row.insertCell(1).textContent = entity.name;
                row.insertCell(2).textContent = entity.type;

                const attributesCell = row.insertCell(3);
                const selectedAttributes = JSON.parse(localStorage.getItem(`selectedAttributes_${entity.name}`) || '[]');
                const attributesLink = document.createElement('a');
                attributesLink.href = `attributes.html?entity=${encodeURIComponent(entity.name)}`;
                attributesLink.textContent = `${selectedAttributes.length} of ${entity.attributes.length}`;
                attributesLink.setAttribute('data-entity', entity.name);
                attributesCell.appendChild(attributesLink);
            });
        }

        displayEntities(entities);

        entitySearchInput.addEventListener('input', () => {
            const searchValue = entitySearchInput.value.toLowerCase();
            const filteredEntities = entities.filter(entity => entity.name.toLowerCase().includes(searchValue));
            displayEntities(filteredEntities);
        });

        const selectAllEntitiesCheckbox = document.getElementById('selectAllEntitiesCheckbox') as HTMLInputElement;
        selectAllEntitiesCheckbox.addEventListener('change', function () {
            const checkboxes = tableBody.querySelectorAll('input[type="checkbox"][data-entity]');
            checkboxes.forEach(checkbox => {
                if (!(checkbox as HTMLInputElement).disabled) {
                    (checkbox as HTMLInputElement).checked = selectAllEntitiesCheckbox.checked;
                }
            });
            saveSelectionForAll(entities);
            updateAttributeLinks(entities);
        });

        const selectAllAttributesCheckbox = document.getElementById('selectAllAttributesCheckbox') as HTMLInputElement;
        selectAllAttributesCheckbox.addEventListener('change', function () {
            entities.forEach(entity => {
                const selectAttributes = selectAllAttributesCheckbox.checked;
                const selectedAttributes = selectAttributes ? entity.attributes.map((attr: any) => attr.name) : [];
                localStorage.setItem(`selectedAttributes_${entity.name}`, JSON.stringify(selectedAttributes));

                const attributesLink = tableBody.querySelector(`a[data-entity="${entity.name}"]`) as HTMLAnchorElement;
                if (attributesLink) {
                    attributesLink.textContent = `${selectedAttributes.length} of ${entity.attributes.length}`;
                }
            });
        });

        document.getElementById('submitSelection')?.addEventListener('click', async () => {
            const progressContainer = document.getElementById('progressContainer')!;
            const loadingSpinner = document.getElementById('loadingSpinner')!;
            const navbar = document.querySelector('.header')!;

            progressContainer.style.display = 'block';
            progressContainer.style.alignItems = 'center';
            loadingSpinner.style.display = 'block';

            const selectedEntities = entities.filter(entity => {
                const checkbox = tableBody.querySelector(`input[data-entity="${entity.name}"]`) as HTMLInputElement;
                return checkbox.checked;
            }).map(entity => {
                const selectedAttributes = JSON.parse(localStorage.getItem(`selectedAttributes_${entity.name}`) || '[]');
                return {
                    name: entity.name,
                    type: entity.type,
                    baseType: entity.baseType,
                    attributes: entity.attributes.filter((attr: any) => selectedAttributes.includes(attr.name))
                };
            });

            try {
                advanceProgress(1);

                const response = await fetch('https://if200147.cloud.htl-leonding.ac.at/api/generator/submit-selection', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(selectedEntities)
                });

                if (!response.ok) {
                    throw new Error('Failed to submit selection.');
                }

                loadingSpinner.style.display = 'none';
                progressContainer.style.display = 'none';
                advanceProgress(2);
                window.location.href = 'https://if200147.cloud.htl-leonding.ac.at/download-mpk.html';

            } catch (error) {
                console.error('Error submitting selection:', error);
                alert('Failed to submit selection.');
                window.location.href = 'https://if200147.cloud.htl-leonding.ac.at/index.html';
            }
        });
    } catch (error) {
        console.error('Error loading the entities:', error);
    }
});

function saveSelectionForAll(entities: any[]) {
    const checkboxes = document.querySelectorAll<HTMLInputElement>('[data-entity]');
    const selectedEntities: { name: string, type: string, baseType: string, attributes: string[] }[] = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => {
            const entityName = checkbox.getAttribute('data-entity') || '';
            const entity = entities.find(e => e.name === entityName);
            const selectedAttributes = JSON.parse(localStorage.getItem(`selectedAttributes_${entityName}`) || '[]');
            return {
                name: entityName,
                type: entity?.type ?? '',
                baseType: entity?.baseType ?? '',
                attributes: selectedAttributes.length > 0 ? selectedAttributes : entity?.attributes.map((attr: any) => attr.name) ?? []
            };
        });

    localStorage.setItem('selectedEntitiesAndAttributes', JSON.stringify(selectedEntities));
}

function updateAttributeLinks(entities: any[]) {
    const checkboxes = document.querySelectorAll<HTMLInputElement>('[data-entity]');
    checkboxes.forEach(checkbox => {
        const entityName = checkbox.getAttribute('data-entity')!;
        const entity = entities.find(e => e.name === entityName)!;
        const selectedAttributes = JSON.parse(localStorage.getItem(`selectedAttributes_${entityName}`) || '[]');
        const attributesLink = document.querySelector<HTMLAnchorElement>(`a[data-entity="${entityName}"]`);
        if (attributesLink) {
            attributesLink.textContent = `${selectedAttributes.length} of ${entity.attributes.length}`;
        }
    });
}

document.getElementById('previousButton')?.addEventListener('click', () => {
    localStorage.removeItem('selectedEntitiesAndAttributes');
    window.location.href = 'https://if200147.cloud.htl-leonding.ac.at/index.html';
});
