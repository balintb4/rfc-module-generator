document.addEventListener("DOMContentLoaded", () => {
    const generateMendixAppButton = document.getElementById("generateMendixApp");
    const generateDomainModelButton = document.getElementById("generateDomainModel");

    generateMendixAppButton?.addEventListener("click", () => {
        window.location.href = "https://if200147.cloud.htl-leonding.ac.at/generate-mendix-app.html";
    });

    generateDomainModelButton?.addEventListener("click", () => {
        window.location.href = "https://if200147.cloud.htl-leonding.ac.at/index.html";
    });
});
