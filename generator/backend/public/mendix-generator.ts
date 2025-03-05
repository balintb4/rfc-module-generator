document.addEventListener("DOMContentLoaded", () => {
    const generateMendixAppButton = document.getElementById("generateMendixApp");
    const generateDomainModelButton = document.getElementById("generateDomainModel");

    generateMendixAppButton?.addEventListener("click", () => {
        window.location.href = "generate-mendix-app.html";
    });

    generateDomainModelButton?.addEventListener("click", () => {
        window.location.href = "index.html";
    });
});
