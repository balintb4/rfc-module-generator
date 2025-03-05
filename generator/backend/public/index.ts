document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  const nextButton = document.getElementById('nextButton') as HTMLButtonElement;
  const alertContainer = document.getElementById('alertContainer') as HTMLDivElement;
  const uploadBox = document.getElementById('uploadBox') as HTMLDivElement;
  
  let jsonObject: any;

  const displayMessage = (message: string) => {
    const statusMessage = document.getElementById('statusMessage') as HTMLParagraphElement;
    if (statusMessage) {
      statusMessage.textContent = message;
    }
  };

  const displayWarningAlert = (message: string) => {
    alertContainer.innerHTML = `
      <div class="alert alert-warning" role="alert">
        ${message}
      </div>
    `;
  };

  const clearAlert = () => {
    alertContainer.innerHTML = '';
  };

  const displayFileInfo = (file: File) => {
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    fileInfo.innerHTML = `
      <p><strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
      <p><strong>Type:</strong> ${file.type}</p>
    `;
    uploadBox.appendChild(fileInfo);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonText = event.target?.result as string;
        jsonObject = JSON.parse(jsonText);
        console.log('JSON-Objekt erfolgreich geparst:', jsonObject);
        nextButton.disabled = false;
        clearAlert();
        displayFileInfo(file);
      } catch (error) {
        displayMessage('Fehler beim Lesen der Datei: ' + (error as Error).message);
      }
    };
    reader.onerror = (error) => {
      console.error('Fehler beim Lesen der Datei:', error);
      displayMessage('Fehler beim Lesen der Datei.');
    };
    reader.readAsText(file);
  };

  const handleNextButtonClick = async () => {
    if (!jsonObject) {
      displayWarningAlert('No file selected');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/generator/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonObject),
      });

      if (!response.ok) {
        throw new Error('Upload fehlgeschlagen.');
      }

      const data = await response.json();
      displayMessage(data.message);

      advanceProgress(0);

      window.location.href = '/select-entities.html';
    } catch (error) {
      displayMessage('Es ist ein Fehler aufgetreten: ' + (error as Error).message);
    }
  };

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) {
      handleFile(file);
    }
  });

  nextButton.addEventListener('click', handleNextButtonClick);
});

document.addEventListener('DOMContentLoaded', () => {
  localStorage.removeItem('currentStep');
  restoreProgress();
});

document.addEventListener('DOMContentLoaded', () => {
  localStorage.removeItem('selectedEntities');
  localStorage.clear();
});

document.addEventListener('DOMContentLoaded', () => {
  const previousMendixGeneratorBtn = document.getElementById('previous-mendix-generator') as HTMLButtonElement;

  previousMendixGeneratorBtn.addEventListener('click', () => {
    window.location.href = 'mendix-generator.html';
  });
});
