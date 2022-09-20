/* erstellt eine Variable enableNotificationsButtons, 
die auf ein Array aller Buttons mit der CSS-Klasse 
enable-notifications zeigt. */
let enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
            console.log('service worker registriert')
        })
        .catch(
            err => { console.log(err); }
        );
}

/* Benachrichtigungen mittels Notification-API über die Webanwendung und mit Notification-Konstruktor 
function displayConfirmNotification() {
    let options = { 
        body: 'You successfully subscribed to our Notification service!', 
        icon: './images/icons/ios-mcl57x57.png' }
    new Notification('Successfully subscribed!', options);
}*/


/* Benachrichtigungen mittels Notification-API über den SW und mit showNatification()
des SW  */
function displayConfirmNotification() {
    if('serviceWorker' in navigator) {
        let options = { 
            body: 'You successfully subscribed to our Notification service!', 
            icon: 'src/images/icons/ios-mcl57x57.png', 
            lang: 'de-DE',
            vibrate: [100, 50, 200],
            /* das Gerät vibriert 100 Millisekunden, 
            dann ist 50 Millisekunden Pause und dann vibriert es 
            nochmal für 200 Millisekunden.  */
            badge: 'src/images/icons/ios-mcl76x76.png', // falls nict genug desplay Platz da ist
            tag: 'confirm-notification',
            renotify: true,
            /* renotify gehört zu tag. Wenn der Wert true ist, dann 
            wird die Nutzerin auch dann informiert, wenn eine neue 
            Nachricht zum selben tag angekommen ist. Sonst nicht. */
            actions: [
                { action: 'confirm', title: 'Ok', icon: 'src/images/icons/ios-mcl76x76.png' },
                { action: 'cancel', title: 'Cancel', icon: 'src/images/icons/ios-mcl76x76.png'},
            ]
        }
        navigator.serviceWorker.ready
            .then( sw => {
                sw.showNotification('Successfully subscribed (from SW)!', options);
                // die showNotification erzeugt intern ein Notofication-Objekt
            });
    }
}

function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Anmeldung an die Push-Nachrichten
function configurePushSubscription() {
    if(!('serviceWorker' in navigator)) {
        return
    }
    let swReg; /* swReg = SW Registration - diese Variable wird benötigt, da wir sonst
    den sw nicht im 2. then Block verwenden könnten*/
    navigator.serviceWorker.ready
        .then( sw => {
            swReg = sw; /*speichert die Referenz auf den SW, damit wir 
            ihn auch im 2. then Block Zugriff darauf haben*/
            return sw.pushManager.getSubscription(); /*PushManager-API, deren 
             getSubscription()-Methode eine Promise mit einer 
             existierenden Subscription "sub" zurück git */
        })
        .then( sub => {
            if(sub === null) {
                // Erzeugen einer neuen Subscription
                let vapidPublicKey = 'BOdbH2QnVdRiADUU_WV5jp4yLhOC-i6q9HC57vlKPb2oe5YQu1XM4ALBR-u-lrnzI39ajMZaGz8agAYtYm_yQyo';
                //zum Schützen die vapidPublicKey als ein Base64-ArrayBuffer schützt die Subscription
                let convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
                return swReg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidPublicKey, //zum schützen
                }); 
            } else {
                // already subscribed
                // zum Testen der Subcription wird hiermit die bisher exsistierede Sub gelöscht
                sub.unsubscribe()
                .then( () => {
                    console.log('unsubscribed()', sub)
                })
            }
        })
        //zum Schützen
        .then( newSub => {
            return fetch('http://localhost:3000/subscription', {
                //dieser Endpunkt muss im Backend hinterlegt werden, in der server.js
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(newSub)
            })
            .then( response => {
                if(response.ok) { //Backend gibt OK zurück
                    displayConfirmNotification();
                }
            })
        });
}

// Behandlung des Click-Ereignis des Benachrichtigungsbutton
function askForNotificationPermission() {
    Notification.requestPermission( result => {
        /* die requestPermission() fragt die Nutzerin ob sie Benachrichtigung und Push-Nachrichten zulässt */
        console.log('User choice', result); // result ist ein Promise, das die Werte default, denied oder granted haben kann
        if(result !== 'granted') { // wird nicht erlaubt
            console.log('No notification permission granted');
        } else {
            // notifications granted dh. Benachrichtigungen erlaubt
            // displayConfirmNotification(); war bevor die folgende Funktion geschirben wurde
            configurePushSubscription();
        }
    });
}

if('Notification' in window && 'serviceWorker' in navigator) { // prüfen ob Notification-API und er SW unterstützt wird
    for(let button of enableNotificationsButtons) {
        button.style.display = 'inline-block'; // zeige den Button
        // anmelden des Bottons an das Click-Ereignis
        button.addEventListener('click', askForNotificationPermission);
    }
}

