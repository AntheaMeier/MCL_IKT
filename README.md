# 0) MyCheckList - Version 0.1 als Progressive Web App (PWA)

Dieses Projekt ist die Semesteraufgabe für das Modul "Aktuelle Trends der Informations- und Kommunikationstechnik 2022" in Form einer PWA. Diese README gibt Auskunft über die Installation, die Nutzung der hier vorliegenden PWA (V.0.1), die PWA Funktionalitäten und über das Produktziel bzw. die Vision die hinter MyCheckList steckt sowie die Änderungen zum aktuellen Projekt. Das hier vorliegende Projekt (Version 0.1) ist nur als ein erstes Inkrement von einem längerfristigen Projektvorhaben zu verstehen und dient der Entwicklerin mehr als erste Skizze für die spätere App und um die Integration von PWA Funktionalitäten zu üben.


## 1) Die Installation von MyCheckList - V.0.1

Voraussetzung zum Ausführen des Projektes ist die vorherige Installation von Node.js (https://nodejs.org) und einer einer MongoDB auf dem Computer, was bei der Verwendung eines M1-Macbook etwas aufwendiger sein kann: https://linuxhint.com/install-mongodb-mac-m1/.


Zum Starten des Projektes im Terminal in den Projektordner "MCL_IKT" gehen und dort 

    `npm install`

ausführen, dadurch werden alle erforderlichen Abhängigkeiten installiert. Im Anschluss bitte

	`npm start` 

ausführen, um das Frontend zu starten und es im Browser unter localhost:8080 zu öffnen.


Nun ein weiteres Terminalfenster öffnen und in den Ordner "backend" wechseln und dort
    
    `npm run watch` 

ausführen, um das Backend zu starten und zum automatischen Anlegen einer zum Projekt passenden Database "posts", in welcher die mit der App erstellten Postings gespeichert werden können.



## 2) Die Nutzung der Anwendung (MyCheckList - V.0.1)

Auf der Startseite können erstens die Übersicht über alle aktuell angelegten Checklisten eingesehen werden - zu Beginn sind dort noch keine (nur eine Beispiel-Checklist ist für die Semesteraufgabenabgabe als Bilddatei eingebunden).

Auf der Startseite können zweitens über das rote Plus-Icon das Eingabeformular um eine neue Checkliste zu erstellen, geöffnet werden.

Nun kann eine Kategorie für die zu erstellende Checkliste frei gewählt werden, z.B. Reisen (Diese Wort erscheint dann später als Titel auf dem Banner-Bild. Als nächstes wird der Zweck bzw. der Anlass der Checkliste angegeben, z.B. "Ausflüge mit meiner 2,5 jährigen Tochter" und dann können die drei wichtigsten Dinge, die bei dem jeweiligen Anlass unbedingt dabei sein sollten und die man nicht vergessen möchte, gelistet werden.

Nachdem alle textuellen Eingaben getätigt wurden, muss noch ein Banner-Bild über die Gerätekamera oder ein Dateiupload und eine Stardortangabe hinzugefügt werden. Letztere kann manuell oder über den Location-Finder Button erfolgen um den Ortungsdienst zu nutzen.

Durch den Button "Checkliste speichern" wird der Erstellungsprozess abgeschlossen und durch Neuladen der Seite erscheint die neu erstellte Checkliste am Fuße der Seite. 

Über das Navigationsmenu oben rechts bei großen Bildschirmen oder im Hamburger Menu oben links bei schmaleren Bildschirmen kann entweder auf einer "About" Seite eine Hilfestellung zur Nutzung der Anwendung angesehen werden oder über den Benachrichtigunsbutton, die Erlaubnis zum Empfang von Push-Nachrichten erteilt werden.

Um den Sinn der Erstellung der Checklisten besser zu verstehen, bitte Punkt 4) in dieser Datei lesen.


## 3) Die PWA Funktionalitäten von MyCheckList - V.0.1

Die Anwendung hat ein responsives Frontend und eine MongoDB im Backend und in ihrem Code sind folgende PWA Funktionalitäten angelegt:

- Offline-Nutzbarkeit und Hintergrundsynchronisation, d.h. es können neue Postings erstellt werden, aber die neuen Einträge können im Ergebnis erst beim nächsten Onlinebesuch gesehen werden und der Standort muss offline ohne den Location-Finder, 
d.h. manuell erfolgen.

- Installierbarkeit der App

- Gerätezugriff auf die Kamera als Alternative zum Dateiupload

- Verwendung der Geolocation API um den Ortungsdienst zur Standorterfassung nutzen zu können

- Erlaubniserteilung der Userin zum Empfang von Push-Notifications


## 4) Das Produktziel von MyCheckList

MyChecklist hilft einem an wichtige Dinge zu denken und bereits als gut empfundene Kombinationen beim Kochen oder Sichkleiden in einer Datenbank zu speichern und wieder abzurufen.

Userinnen könnnen sich mit der fertigen App Checklisten erstellen, z.B. Rezept-, Einkaufs- und Reisegepäcklisten und dabei ihre individuelle Datenbank mit den entsprechenden Checklist-Items stetig erweitern. 

Diese Checklist-Items können im Textformat und/oder nur als Foto hinterlegt sein. Wenn eine neue Checkliste erstellt wird können bereits vorhandene Checklist-Items durch Klicken hinzugefügt werden. 

Die Datenbank kann von mehreren Userinnen aufgebaut/geteilt werden. Um auf die Dinge die unbedingt dabei sein sollten aufmerksam zu machen werden je nach gewähltem Zeitraum/Eventart bestimmte Checklist-Items hervorgehoben zur Auswahl angeboten z.B. bei einer Einkaufsliste saisonales Obst und Gemüse oder je nach Ausflugsart (Tagestrip oder mit Übernachtung) passend zum Alter des mitreisenden Kindes. 

Die App kann die Nutzerin um so besser beim Einkaufen, Kochen und Packen unterstützen um so größer und feiner kategorisiert die Checklist-Items-Datenbank ist. Der Aufbau und das Einpflegen dieser Datenbank muss von der Userin selbst geleistet werden, da es die Kenntnis ihrer individuellen Bedürfnisse voraussetzt. 

Somit bietet die App keine sehr langen Universallisten zu bestimmten Themen (Packen, Kochen etc.), sondern hilft der Userin nur die eigenen selbst geschrieben oder abgelichteten Checklist-Items zu verwalten. Dabei hilft die App, bereits für sich herausgefundene Erkenntnisse auch in Situationen mit hohem Zeitdruck wieder verfügbar zu machen. Durch das teilen von gemeinsamen User-Accounts können Einkaufslisten schnell und ortsunabhängig geteilt werden und Erkenntnisse für geänderte Packlisten von Personen die mit dem gleichen Kind abwechselnd unterwegs sind genutzt werden.

1. Benefit: Einfache Erstellung von Checklisten und Miteinbeziehung von bereits Gelerntem.

2. Benefit: Schnelle Übersicht über den Ist-Zustand. Die Ckecklisten ermöglichen der Userin beim Packen oder Einkaufen, die entsprechenden Checklist-Items abzuhaken um schnell eine Übersicht über die noch offenen ToDos zu erhalten.



## 5) Geplante Änderungen und Erweiterungen von V.0.1 um das Produktziel zu erreichen

- Kategorien sind nicht mehr frei wählbar, sondern es gibt die vier vordefinierten Bereiche: Reisen/Unterwegs, Shopping (für Einkaufslisten), Food (für Gerichte) und Outfits

- nicht nur drei, sondern eine sehr hohe Anzahl an Dingen (Checklist-Items) listen können

- Diese Checklist-Items müssen auch nur beim ersten Mal getippt oder als Foto hochgeladen werden und können dann später einfach selected werden

- es müssen keine Fotos und auch kein Banner-Bild hinzugefügt werden, Dateiupload und Kamerazurgriff werden optional angeboten

- eine Standortangabe wird nicht mehr angeboten

- Die Checklist-Items werden auch nicht nur gelistet, sondern erscheinen mit Checkboxes, so dass diese abgehakt werden können

- Der Bereich Outfits kann ggf. um einen Konfigurator erweitert werden, mit dem Outfit-Teile kombiniert und Kombination auch optisch als Gesamtbild gespeichert werden können

- es bedarf passwortgeschützter User-Accounts, die Unserinnen bei Bedarf mit andern Userinnen teilen können

- Push-Notificationen werden nur bei geteilten User-Accounts angeboten um informiert zu werden, wenn der andere Account User Änderungen vorgenommen hat.