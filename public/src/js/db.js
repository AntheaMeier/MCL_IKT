/* Soll in der feeds.js zur Verfügung stehen und wird daher in der index.html
als ein script und im Service Worker über ein importScript() eingebunden

erstellt und öffnet eine IndexedDB names "posts-store"
mit Hilfe der openDB()-Funktion aus dem idb-Paket.*/
const db = idb.openDB('posts-store', 2, {
    upgrade(db) {
        // Create a store of objects
        const store1 = db.createObjectStore('posts', {
            /* Der store in post-store heißt posts. 
            In diesem store speichern wir alle Daten der Posts.
            Mit der Eigenschaft keyPath definieren wir den Schlüssel für diesen store. 
            Über diesen Schlüssel gelangen wir an unserer Daten.  */
            keyPath: '_id',
            // If it isn't explicitly set, create a value by auto incrementing.
            autoIncrement: true,
        });
        // Create an index on the '_id' property of the objects.
        store1.createIndex('_id', '_id');
        
        // Create another store of objects
        const store2 = db.createObjectStore('sync-posts', {
            keyPath: 'id',
            autoIncrement: true,
        });
        /* Mithilfe der Funktion createIndex() verbinden wir das Attribut _id 
        unserer Posts-Datensätze mit dem Schlüssel(key-path). Somit ist _id der Schlüssel 
        sowohl in der IndexedDB als auch in unserer MongoDB für alle Posts.    */
        store2.createIndex('id', 'id');
    },
});

//schreibt die Daten aus dem backend in die IndexDB
function writeData(st, data) {
    return db // ein Promise Objekt
    .then( dbPosts => {
        let tx = dbPosts.transaction(st, 'readwrite');
        let store = tx.objectStore(st);
        store.put(data);
        return tx.done; // damit kein schaden endsteht, ist unten durch
                        // die readOnly nicht mehr nötig, da dort eh nur gelesen wird
    })
}

//liest die Daten aus der IndexDB
function readAllData(st) {
    return db
        .then( dbPosts => {
            let tx = dbPosts.transaction(st, 'readonly');
            let store = tx.objectStore(st);
            return store.getAll();
        })
}
/* zum Löschen aller Datensätze aus der IndexDB, wird im SW
immer aufgerufen wenn ein neuer Datensatz hinzugefügt wird*/
function clearAllData(st) {
    return db
        .then( dbPosts => {
            let tx = dbPosts.transaction(st, 'readwrite');
            let store = tx.objectStore(st);
            store.clear();
            return tx.done;
        })
}

/* zum Löschen einzelner Datensätze aus der IndexDB */
function deleteOneData(st, _id) {
    db // promise Objekt
    .then( dbPosts => {
        let tx = dbPosts.transaction(st, 'readwrite');
        let store = tx.objectStore(st);
        store.delete(_id);
        return tx.done;
    })
    .then( () => {
        console.log('Data deleted ...');
    });
}