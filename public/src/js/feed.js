/* hier werden die Datensätze aus der IndexedDB ausgelesen, 
da hier die Daten zum Erstellen einer Card (Posting) verwendet 
werden.  */

let shareImageButton = document.querySelector('#share-image-button');
let createPostArea = document.querySelector('#create-post');
let closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
let sharedMomentsArea = document.querySelector('#shared-moments');

/* mithilfe von jQuery definieren wir folgene Variablen 
für das Verbinden mit dem "Speichern-Button" und den 
direkten Zugriff auf Steuerlemente. */
let form = document.querySelector('form');
let titleInput = document.querySelector('#title');
let purposeInput = document.querySelector('#purpose');
let checklist_item1Input = document.querySelector('#checklist_item1');
let checklist_item2Input = document.querySelector('#checklist_item2');
let checklist_item3Input = document.querySelector('#checklist_item3');
let locationInput = document.querySelector('#location');

/* Variablen die für die Kamera-Einbindung und Bildhochladen */
let videoPlayer = document.querySelector('#player');
let canvasElement = document.querySelector('#canvas');
let captureButton = document.querySelector('#capture-btn');
let imagePicker = document.querySelector('#image-picker');
let imagePickerArea = document.querySelector('#pick-image');

/* Variablen die für die sendDataToBackend() wichtig sind */
let file = null;
let titleValue = '';
let purposeValue = '';
let checklist_item1Value = '';
let checklist_item2Value = '';
let checklist_item3Value = '';
let locationValue = '';

let imageURI = '';

/* Variablen die für das Click-ereignis des GeoLocation-Button wichtig sind */
let locationButton = document.querySelector('#location-btn');
let locationLoader = document.querySelector('#location-loader');
let fetchedLocation;

let mapDiv = document.querySelector('.map'); // im Script ursprünglich von Katrin auf Slack erwähnt

locationButton.addEventListener('click', event => {
    if(!('geolocation' in navigator)) {
        return;
    }

    locationButton.style.display = 'none';
    locationLoader.style.display = 'block';

    navigator.geolocation.getCurrentPosition( position => {
        locationButton.style.display = 'inline';
        locationLoader.style.display = 'none';
        fetchedLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        console.log('current position: ', fetchedLocation);

        let nominatimURL = 'https://nominatim.openstreetmap.org/reverse'; 
        nominatimURL += '?format=jsonv2';   // format=[xml|json|jsonv2|geojson|geocodejson]
        nominatimURL += '&lat=' + fetchedLocation.latitude;
        nominatimURL += '&lon=' + fetchedLocation.longitude;

        fetch(nominatimURL)
            .then((res) => {
                console.log('nominatim res ...', res);
                return res.json();
            })
            .then((data) => {
                console.log('nominatim res.json() ...', data);
                locationInput.value = data.display_name;
                return data;
            })
            .then( d => {
                locationButton.style.display = 'none';
                locationLoader.style.display = 'none';
                mapDiv.style.display = 'block';

                const map = new ol.Map({ //erstellt neue Landkarte
                    target: 'map',
                    layers: [ //diese Array enthält alle Schichten die zur Landkartendarstellung gebraucht werden
                    new ol.layer.Tile({
                        source: new ol.source.OSM()
                    })
                    ],
                    view: new ol.View({
                    center: ol.proj.fromLonLat([fetchedLocation.longitude, fetchedLocation.latitude]),
                    zoom: 12
                    })
                });

                const layer = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        features: [
                            new ol.Feature({
                                geometry: new ol.geom.Point(ol.proj.fromLonLat([fetchedLocation.longitude, fetchedLocation.latitude]))
                            })
                        ]
                    })
                });
 
                map.addLayer(layer);

                console.log('map', map)
            })
            .catch( (err) => {
                console.error('err', err)
                locationInput.value = 'In Berlin';
            });

        document.querySelector('#manual-location').classList.add('is-focused');

    }, err => {
        console.log(err);
        locationButton.style.display = 'inline';
        locationLoader.style.display = 'none';
        alert('Couldn\'t fetch location, please enter manually!');
        fetchedLocation = null;
    }, { timeout: 5000});
});

/* für die Geo-Localisation */
function initializeLocation() {
    if(!('geolocation' in navigator)) {
        locationButton.style.display = 'none';
    }
}

/* für die Kamera-Einbindung, wir nutzen die MediaDevices API */
function initializeMedia() {
    if(!('mediaDevices' in navigator)) { /* Wenn die MediaDevices-API nicht unterstützt wird */
        navigator.mediaDevices = {};     /* dann erstellen wir einen eigenes MediaDevices-Objekt*/
    }

    /* Polyfill für den Fall das Browser die normale API nicht unterstützt*/ 
    if(!('getUserMedia' in navigator.mediaDevices)) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
            let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            if(!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented'));
            }

            return new Promise( (resolve, reject) => {
                getUserMedia.call(navigator, constraints, resolve, reject);
            })
        }
    }

    navigator.mediaDevices.getUserMedia({video: true})
    .then( stream => {
        videoPlayer.srcObject = stream;
        videoPlayer.style.display = 'block'; //macht den Videoplayer sichtbar
        imagePickerArea.style.display = 'block'; //macht den Filepicker sichtbar auch wenn Cam erlaubt
    })
    .catch( err => { // nur falls kein Kaerazugriff möglich ist, soll die Bildhochladoption erfolgen
        imagePickerArea.style.display = 'block'; //macht den Filepicker sichtbar falls kein Kamerazugriff
    });
}

function openCreatePostModal() {
    setTimeout( () => {
        createPostArea.style.transform = 'translateY(0)'; //Animation Datei-Upload Slider
    }, 1);
    initializeMedia();
    initializeLocation();
}

function closeCreatePostModal() {
    imagePickerArea.style.display = 'none'; 
    videoPlayer.style.display = 'none';
    canvasElement.style.display = 'none';
    locationButton.style.display = 'inline';
	locationLoader.style.display = 'none';
    if(videoPlayer.srcObject) {
        videoPlayer.srcObject.getVideoTracks().forEach( track => track.stop());
    }
    setTimeout( () => {
        createPostArea.style.transform = 'translateY(100vH)'; //Animation Datei-Upload Slider
    }, 1);
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function createCard(card) {
  let cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  let cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  
 /*  Die folgende 3 Zeilen sind zum Darstellen der Bilder aus dem Backend
  mittels Image-Objekt, dem wir als Wert des src-Attributes den 
  base64-String aus image_id übergeben. 
  Dann wird der src-Wert des Image-Objektes als eine URL für das 
  Hintergrundbild einer Card verwendet (Zeilen 6-8). */
  let image = new Image();
  image.src = card.image_id;
  cardTitle.style.backgroundImage = 'url('+ image.src +')';
  
  
  cardTitle.style.backgroundSize = 'cover';
  // hier kein cardTitel.style.heigt 180pm mehr, da jetzt responsive
  cardWrapper.appendChild(cardTitle);
  
  let cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = card.title;
  cardTitleTextElement.classList.add('whiteText');
  cardTitle.appendChild(cardTitleTextElement);

  let cardPurposeText = document.createElement('div');
  cardPurposeText.className = 'mdl-card__supporting-text';
  cardPurposeText.textContent = card.purpose;
  cardPurposeText.style.textAlign = 'center';
  cardWrapper.appendChild(cardPurposeText);

  let cardChecklistItem1Text = document.createElement('div');
  cardChecklistItem1Text.className = 'mdl-card__supporting-text';
  cardChecklistItem1Text.textContent = card.checklist_item1;
  cardChecklistItem1Text.style.textAlign = 'center';
  cardWrapper.appendChild(cardChecklistItem1Text);

  let cardChecklistItem2Text = document.createElement('div');
  cardChecklistItem2Text.className = 'mdl-card__supporting-text';
  cardChecklistItem2Text.textContent = card.checklist_item2;
  cardChecklistItem2Text.style.textAlign = 'center';
  cardWrapper.appendChild(cardChecklistItem2Text);

  let cardChecklistItem3Text = document.createElement('div');
  cardChecklistItem3Text.className = 'mdl-card__supporting-text';
  cardChecklistItem3Text.textContent = card.checklist_item3;
  cardChecklistItem3Text.style.textAlign = 'center';
  cardWrapper.appendChild(cardChecklistItem3Text);
  
  let cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = card.location;
  cardSupportingText.style.textAlign = 'center';
  cardWrapper.appendChild(cardSupportingText);

  
  
  componentHandler.upgradeElement(cardWrapper);

  /*diese Funktion brauchen alle dynamisch erzeugten DOM-Elemente, damit 
  sie von Material Design Lite automatisch verwaltet werden.*/
  sharedMomentsArea.appendChild(cardWrapper);
}

fetch('http://localhost:3000/posts')
    .then((res) => {
        return res.json();
    })
    .then((data) => {
        console.log('From backend ...', data);
        updateUI(data);
    })
    .catch( (err) => {
        if('indexedDB' in window) {
            readAllData('posts')
                .then( data => {
                    console.log('From cache ...', data);
                    updateUI(data);
                })
        }
    });


/* die folgende Funktion macht nichts weiter, als die 
createCard()-Funktion für jeden einzelnen Datensatz aufzurufen */
function updateUI(data) {
    for(let card of data)
    {
       createCard(card);
    }
}

/* funktion, die neue Posts (Titel, Loctation und Bilddatei) ans Backend schickt */
function sendDataToBackend() {
    const formData = new FormData();
    formData.append('title', titleValue);
    formData.append('purpose', purposeValue);
    formData.append('cheklist_item1', checklist_item1Value);
    formData.append('cheklist_item2', checklist_item2Value);
    formData.append('cheklist_item3', checklist_item3Value);
    formData.append('location', locationValue);
    formData.append('file', file);

    console.log('formData', formData)
   
    /* Wir nutzen in der fetch() den GET http://localhost:3000/posts-Endpunkt, um uns 
    alle Daten aus der Datenbank zu holen.  */
    fetch('http://localhost:3000/posts', {
        method: 'POST',
        body: formData
    })
    .then( response => {
        console.log('Data sent to backend ...', response);
        return response.json();
    })
    .then( data => {
        console.log('data ...', data);
        const newPost = {
            title: data.title,
            purpose: data.purpose,
            checklist_item1: data.cheklist_item1,
            checklist_item2: data.cheklist_item2,
            checklist_item3: data.cheklist_item3,
            location: data.location,
            image_id: imageURI
        }
        /* Wir fügen einen Funktionsaufruf 
    einer neuen Funktion updateUI() ein.  */
        updateUI([newPost]); /* zeigt unseren neuerstellten 
                              Backend-Datensatz als neues Posting in der Appan*/
    });
}


/* Submit-Ereignis des Speichern-Buttons  
 wir prüfen, ob beide input-Elemente (title und location) einen Wert 
 enthalten. Die JavaScript-trim() entfernt alle "Leerzeichen" am Ende 
 des Strings (auch Tabs, Zeilenumbrüche etc.). Sollte eines der beiden 
 (oder beide) Eingabefelder leer sein, beenden wir die Funktion 
 mit einem alert und bleiben in dem Formular.Wenn beide Eingabefelder befüllt sind, wird das 
Formularfenster verlassen. */

form.addEventListener('submit', event => {
    event.preventDefault(); // verhindert Absenden der Daten und Neuladen der Seite

    if (file == null) {
        alert('Erst Foto aufnehmen!')
        return;
    }
    if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
        alert('Bitte Felder ausfüllen!')
        return;
    }

    closeCreatePostModal();

    titleValue = titleInput.value;
    purposeValue = purposeInput.value;
    checklist_item1Value = checklist_item1Input.value;
    checklist_item2Value = checklist_item2Input.value;
    checklist_item3Value = checklist_item3Input.value;

    locationValue = locationInput.value;
    
    console.log('titleInput', titleValue)
    console.log('purposeInput', purposeValue)
    console.log('checklist_item1Input', checklist_item1Value)
    console.log('checklist_item2Input', checklist_item2Value)
    console.log('checklist_item3Input', checklist_item3Value)
    console.log('locationInput', locationValue)
    
    console.log('file', file)

    if('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
            .then( sw => {
                let post = {
                    id: new Date().toISOString(),
                    title: titleValue,
                    purpose: purposeValue,
                    checklist_item1: checklist_item1Value,
                    checklist_item2: checklist_item2Value,
                    checklist_item3: checklist_item3Value,
                    location: locationValue,
                    
                    image_id: file
                };
           
                writeData('sync-posts', post)
                .then( () => {
                    return sw.sync.register('sync-new-post');
                })
                .then( () => {
                    let snackbarContainer = new MaterialSnackbar(document.querySelector('#confirmation-toast'));
                    let data = { message: 'Eingaben zum Synchronisieren gespeichert!', timeout: 2000};
                    snackbarContainer.showSnackbar(data);
                });
            });
		} else {
	        sendDataToBackend(); // mit fetch() und POST weren neue Postings ans Backend geschickt
	    }
});

captureButton.addEventListener('click', event => {
    event.preventDefault(); // nicht absenden und neu laden
    canvasElement.style.display = 'block'; //füngt das aktuelle Bild des Players in das Canvas Element
    videoPlayer.style.display = 'none';
    captureButton.style.display = 'none';
    let context = canvasElement.getContext('2d'); //Grafikcontext des Canvas-element -> https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
    context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width));
    
    videoPlayer.srcObject.getVideoTracks().forEach( track => {
        track.stop(); //Bild wurde erstellt also stoppen des Videoplayers
    })                 // Standbild wird gezeigt, der gestoppte Player und Button sind unsichtbar
    imageURI = canvas.toDataURL("image/jpg"); // in der globalen Variable imageURI speichern wir den base64-String des Bildes
    // console.log('imageURI', imageURI)       // base64-String des Bildes
    

    /* mithilfe der fetch()-Funktion ein File-Objekt erzeugen: 
    Wir weisen unserem File-Objekt den Dateinamen myFile.jpg zu. 
    Die Referenz auf dieses File-Objekt speichern wir in der 
    globalen Variablen file*/ 
    fetch(imageURI)
    .then(res => {
        return res.blob()
    })
    .then(blob => {
        file = new File([blob], "myFile.jpg", { type: "image/jpg" })
        console.log('file', file)
    })
});

/*  für das Hochladen einer Bilddatei wird nun nur noch das 
change-Event für den upload-Button behandelt.*/ 

imagePicker.addEventListener('change', event => {
    file = event.target.files[0];
});