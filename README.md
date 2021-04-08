# Internship searcher
## Description
A la base ça devait être un bot qui postule automatiquement à des annonces indeed mais il y a trop de contrainte qui fait que ça n'est pas intéressant, du coup pour l'instant le bot se contente juste de parser les annonces

## Les contraintes en question
* ne peut fonctionner que sur des formulaires uniformisés pour chaque annonce (les candidatures faciles)
* après trie, il y a très peu de candidature facile
* les questions posées par le recruteur
* le formulaire de recrutement se trouve dans un iframe lui-même dans un iframe, ce qui le rend particulièrement difficile à traiter
* il aurait fallu que je me lance dans ce projet bien plus tôt

## Fichier dotenv (.env)
```
WIDTH=1100
HEIGHT=480

OFFER_LINK=https://fr.indeed.com/jobs?q=Stage+D%C3%A9veloppeur+Web&l=Paris+%2875%29&jt=internship&fromage=7
CO_LINK=https://secure.indeed.com/account/login?hl=fr&co=FR&continue=http%3A%2F%2Fmessages.indeed.com%2Fconversations%2F%3Ffrom%3Dgnav-util-homepage%26from%3Dgnav-util-messaging--messaging-service%26from%3Dgnav-util-messaging--messaging-service%26from%3Dgnav-util-messaging--messaging-service%26gnavTK%3D1f2egt42m3je4001%26tk%3D1f2egt42fsspv800%26co%3DFR%26hl%3Dfr%26filter%3DInbox

EMAIL=email_de_connection
PASSWORD=mot_de_passe

FORM=form#loginform
INPUT_EMAIL=__email
INPUT_PASS=__password
```

## Fichier config.json (exemple)
```json
{
    "optionView" : {
        "title" : true,
        "link" : true,
        "company" : true,
        "location" : true
    },
    "optionFilter" : {
        "title" : [
            "stage|internship|stagiaire",
            "d(é|e)veloppe(ur|ment)",
            "web|java|backend|fullstack|node|nodejs"
        ],
        "location" : ["paris"]
    }
}
```