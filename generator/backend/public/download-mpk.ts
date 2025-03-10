document.addEventListener('DOMContentLoaded', () => {
    const downloadButton = document.getElementById('downloadButton') as HTMLButtonElement;
    const previousButton = document.getElementById('previousButton') as HTMLButtonElement;
    const homeBtn = document.getElementById('homeBtn') as HTMLButtonElement;

    homeBtn?.addEventListener('click', () => {
        removeMendixAppFormLocalStorageItems();
        window.location.href = 'https://if200147.cloud.htl-leonding.ac.at/mendix-generator.html';
    });

    downloadButton.addEventListener('click', (event) => {
        event.preventDefault();

        window.location.href = 'https://if200147.cloud.htl-leonding.ac.at/api/generator/download-mpk';
        advanceProgress(3);
        downloadButton.disabled = true;

    });

    previousButton.addEventListener('click', () => {
        removeMendixAppFormLocalStorageItems();
        window.location.href = 'https://if200147.cloud.htl-leonding.ac.at/index.html';
    });
});

function removeMendixAppFormLocalStorageItems() {
    localStorage.removeItem('appName');
    localStorage.removeItem('token');
    localStorage.removeItem('client');
    localStorage.removeItem('destinationName');
    localStorage.removeItem('host');
    localStorage.removeItem('language');
    localStorage.removeItem('password');
    localStorage.removeItem('routerAddress');
    localStorage.removeItem('sapReleaseVersion');
    localStorage.removeItem('systemNumber');
    localStorage.removeItem('username');
}