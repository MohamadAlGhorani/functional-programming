# functional-programming

## Het concept

## Features 

## API reference

I used SPARQL in this app to retrieve data from the museum's database. For more information about SPARQL [click here](https://nl.wikipedia.org/wiki/SPARQL)

Om mijn concept tot leven te brengen heb ik de volgende data variabelen nodig: alle categorieën van de collectie 
en het aantal objecten per collectie, per categorieën heb ik de meest ten voorkomende gebieden en he aantal objecten daarin. Daardoor moet ik een query schrijven die de categorieën ophaalt met het aantal objecten erin. En omdat er 19 hoofdcategorieën zijn heb ik dan per categorie een query moeten schrijven die de tien gebieden van de categorie kan ophalen. 

Hie onder kun je de queries bekijken die ik geschreven heb om de juiste data binnen te halen.

query voor de hoofdcategorieën
```
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX edm: <http://www.europeana.eu/schemas/edm/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
# tel aantallen per materiaal
SELECT ?category ?categoryLabel (COUNT(?cho) AS ?choCount) WHERE {
 <https://hdl.handle.net/20.500.11840/termmaster2802> skos:narrower ?category .
 ?category skos:prefLabel ?categoryLabel .
 ?category skos:narrower* ?subcategory .
 ?cho edm:isRelatedTo ?subcategory .
 ?cho dct:spatial ?place .
}
GROUP BY ?category ?categoryLabel
ORDER BY DESC(?choCount)
``` 
query die de tien gebieden en het aantal objecten per gebied ophaalt van een van de categorieën :
```
       PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX edm: <http://www.europeana.eu/schemas/edm/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
           # tel aantallen per continent
    SELECT ?continentLabel (COUNT(?cho) AS ?choCount) 
    
    WHERE {
           # haal van een term in de thesaurus de subcategorieen op
           ${category} skos:narrower* ?subcategorie .
           # haal de objecten van deze subcategorieen en de plaats
           ?cho edm:isRelatedTo ?subcategorie .
           ?cho dct:spatial ?place .
           # check het continent
           <https://hdl.handle.net/20.500.11840/termmaster2> skos:narrower ?continent .
           ?continent skos:prefLabel ?continentLabel .
           ?continent skos:narrower* ?place .
    } GROUP BY ?continentLabel
    ORDER BY DESC(?choCount)
```

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

What things you need to install the software and how to install them

```
Give examples
```

### Installing

A step by step series of examples that tell you how to get a development env running

Say what the step will be

```
Give the example
```

And repeat

```
until finished
```

End with an example of getting some data out of the system or using it for a little demo


## Deployment
I used Netlify te deploy my project more information about Netlify [click hier](https://www.netlify.com)

[![Netlify Status](https://api.netlify.com/api/v1/badges/9038e2a3-13d4-44de-aee9-7f3814e8265a/deploy-status)](https://app.netlify.com/sites/functioneel-programmeren/deploys)


## Credits

Thanks to the museum of volkenkunde for sharing their data and hosting us at the museum. And thanks to my teachers and colleagues for their help and sharing their knowledge.


## Authors

**Mohamad Al Ghorani** 


## License

Code is[MIT](https://github.com/MohamadAlGhorani/functional-programming/blob/master/LICENSE)
