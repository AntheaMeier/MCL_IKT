importScripts('/src/js/idb.js');
importScripts('/src/js/db.js');

const CACHE_VERSION = 63;
const CURRENT_STATIC_CACHE = 'static-v'+CACHE_VERSION;
const CURRENT_DYNAMIC_CACHE = 'dynamic-v'+CACHE_VERSION;

self.addEventListener('install', event => {
    console.log('service worker --> installing ...', event);
    event.waitUntil(
        caches.open(CURRENT_STATIC_CACHE) //speichert unsere App Shell (Rahmen ohne neue Posts)
        //caches.open(CURRENT_STATIC_CACHE)
        /* eine Funktion aus der Cache API, die einen neunes Cache Objekt erzeugt */
            .then( cache => {
                console.log('Service-Worker-Cache erzeugt und offen');
                cache.addAll([ // alles speichern, dass unsere App ausmacht
                    '/',
                    '/index.html',
                    '/about/index.html',
                    '/src/js/app.js',
                    '/src/js/feed.js',
                    '/src/js/material.min.js',
                    '/src/js/idb.js',
                    '/src/css/about.css',
                    '/src/css/app.css',
                    '/src/css/feed.css',
                    '/src/images/mcl1200.jpg',
                    'https://fonts.googleapis.com/css?family=Roboto:400,700',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    'https://code.getmdl.io/1.3.0/material.blue_grey-red.min.css'
                ]);
            })
    );
})

self.addEventListener('activate', event => {
    console.log('service worker --> activating ...', event);
    event.waitUntil(
        caches.keys()
            .then( keyList => {
                return Promise.all(keyList.map( key => {
                    if(key !== CURRENT_STATIC_CACHE && key !== CURRENT_DYNAMIC_CACHE) {
                        console.log('service worker --> old cache removed :', key);
                        return caches.delete(key);
                    }
                }))
            })
    );
    return self.clients.claim();
})

self.addEventListener('fetch', event => {
    // check if request is made by chrome extensions or web page
    // if request is made for web page url must contain http.
    if (!event.request.url.includes('http')) return;        // skip the request. if request is not made with http protocol
    if (event.request.url.includes('myFile.jpg')) return;   // skip the request. see feed.js fetch(imageURI)

    const url = 'http://localhost:3000/posts';
    if(event.request.url.indexOf(url) >= 0) {
        console.log('event.request', event.request)
        event.respondWith(
            /* Die respondWith()-Funktion ist eine Funktion des fetch-Events 
            und sie sorgt dafür, den Browser von seiner Standardbehandlung 
            des FetchEvents abzuhalten und stattdessen eine eigene Promise 
            für die Behandlung des FetchEvents zu definieren. */
            fetch(event.request)
                .then ( res => {
                    if(event.request.method === 'GET') {
                        const clonedResponse = res.clone(); //clont die zurvor erzeugte Response
                        clearAllData('posts')
                        /* Die Funktion clearAllData() gibt ein Promise-Objekt zurück. 
                        Nach dem erfolgreichen Löschen der Datenbank, können die neuen
                        Daten hinzugefügt werden und das komplette clonedResponse-
                        Promise-Objekt in die then()-Funktion geschoben.  */
                        .then( () => {
                            clonedResponse.json() // wandelt die Response in JSON, d.h. in ein JavaScript-Objekt 
                                                  //mit den Schlüsseln id, title, location und image 
                                                  //- so, wie es vom Backend zurück gegeben wurde
                            .then( data => {
                                for(let key in data) // wir gehen nun durch alle Schluessel-Werte-Paare
                                {
                                    writeData('posts', data[key]); // speichert/schreibt die einzelnen Schlüssel-Werte-Paare aus dem Backend in die IndexedDB in der db.js
                                }
                            })
                        })
                    }
                    return res;
                })
        )
    } else {
        event.respondWith(
            caches.match(event.request)
                .then( response => {
                    if(response) {
                        return response;
                    } else {
                        console.log('event.request', event.request)
                        return fetch(event.request)
                            .then( res => {     // nicht erneut response nehmen, haben wir schon
                                return caches.open(CURRENT_DYNAMIC_CACHE)      // neuer, weiterer Cache namens dynamic
                                    .then( cache => {
                                        cache.put(event.request.url, res.clone());
                                        return res;
                                    })
                            });
                    }
                })
        )
    }
})

self.addEventListener('sync', event => {
    console.log('service worker --> background syncing ...', event);
    if(event.tag === 'sync-new-post') {
        console.log('service worker --> syncing new posts ...');
        event.waitUntil(
            readAllData('sync-posts')
                .then( dataArray => {
                    for(let data of dataArray) {
                        console.log('data from IndexedDB', data);
                        /* ein Sync-Ereignis wurde registriert! nun sollen die Daten 
                        aus der IndexDB an das Backend geschickt werden */
                        const formData = new FormData();
                        formData.append('title', data.title);
                        formData.append('purpose', data.purpose);
                        formData.append('checklist_item1', data.checklist_item1);
                        formData.append('checklist_item2', data.checklist_item2);
                        formData.append('checklist_item3', data.checklist_item3);
                        formData.append('location', data.location);
                        formData.append('file', data.image_id);

                        console.log('formData', formData)
                    
                        fetch('http://localhost:3000/posts', {
                            method: 'POST',
                            body: formData
                        })
                        .then( response => {
                            console.log('Data sent to backend ...', response);
                            if(response.ok) { //Daten erfolgreich ans BA gesandt
                                // nun Daten aus der db.js löschen, da sie in der IndexDB nicht mehr gebraucht werden
                                deleteOneData('sync-posts', data.id)
                            }
                        })
                        .catch( err => { //falls ein Fehler auftritt
                            console.log('Error while sending data to backend ...', err);
                        })
                    }
                })
        );
    }
})

// SW behandelt das Clickereignis wenn Benachrichtigungen erlaubt werden
self.addEventListener('notificationclick', event => {
    let notification = event.notification;
    let action = event.action;

    console.log(notification);

    if(action === 'confirm') {
        console.log('confirm was chosen');
        notification.close();
    } else {
        console.log(action);
        
        /* es folgt der Code aus dem Modulscript, läuft aber bei Allen nicht
       Mit clients greift der Service Worker auf alle Fenster (Anwendungen, Browser) zu, 
       über die er Kontrolle hat. Die Funktion matcAll() gibt ihm alle diese Clients 
       als ein Array zurück. Mit der JavaScript-Funktion find() laufen wir durch das Array 
       und geben alle die Clients zurück, für die gilt, dass sie sichtbar - im Sinne von 
       erreichbar - sind. Diejenigen Clients, die nicht erreichbar sind, werden gar nicht 
       erst zurückgegeben. Für alle anderen gilt, dass sie entweder bereits geöffnet sind 
       oder nicht. Diejenigen (Browser), die bereits geöffnet sind, navigieren zur 
       URL http://localhost:8080 und die anderen werden mit dieser URL geöffnet. Wenn nun 
       neue Daten eingegeben werden, dann erscheint eine Push-Notifikation und wenn wir 
       darauf klicken, dann öffnet sich unsere Anwendung. */

        event.waitUntil(
            clients.matchAll()    
                .then( clientsArray => {
                    let client = clientsArray.find( c => {
                        return c.visibilityState === 'visible';
                    });

                    if(client !== undefined) {
                        client.navigate(notification.data.url);
                        client.focus();
                    } else {
                        clients.openWindow(notification.data.url);
                    }
                    notification.close();
                })
        );
    }
});


// SW behandelt das Clickereignis wenn Benachrichtigungen geschlossen werden
self.addEventListener('notificationclose', event => {
    console.log('notification was closed', event);
});



// das ist der Code aus dem Modulscript, läuft aber bei Allen nicht
self.addEventListener('push', event => {
    console.log('push notification received', event);
    let data = { title: 'Test', content: 'Fallback message', openUrl: '/'};
    if(event.data) {
        data = JSON.parse(event.data.text());
    }

    let options = {
        body: data.content,
        icon: '/src/images/icons/ios-mcl76x76.png',
        data: {
            url: data.openUrl
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
