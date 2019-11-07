const eindpoint = "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-22/sparql";

const categorieQuery = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX edm: <http://www.europeana.eu/schemas/edm/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
# tel aantallen per materiaal
SELECT ?categoryLabel ?category (COUNT(?allChos) AS ?choCount) WHERE {
  ?cho edm:isRelatedTo <https://hdl.handle.net/20.500.11840/termmaster2802> .
  <https://hdl.handle.net/20.500.11840/termmaster2802> skos:narrower ?category .
  ?category skos:prefLabel ?categoryLabel .
  ?category skos:narrower* ?allChos .
}
  
GROUP BY ?categoryLabel ?category
ORDER BY DESC(?choCount)`;

runQuery(eindpoint, categorieQuery, loopData)

function runQuery(url, query, responseFunction) {
    fetch(url + "?query=" + encodeURIComponent(query) + "&format=json")
        .then(res => res.json())
        .then(data => {
            //console.log(data)
            responseFunction(data.results.bindings)
        })
}
objArray = [];

function loopData(data) {
    data.map(item => {
        const newproperty = {
            category: ` <${item.category.value}>`,
            categoryLabel: item.categoryLabel.value,
            countObj: item.choCount.value
        }
        objArray.push(newproperty)
    })

    if (objArray.length == 19) {
        console.log(objArray);
        objArray.forEach(item => {
            const geoQuery = `
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX dc: <http://purl.org/dc/elements/1.1/>
            PREFIX dct: <http://purl.org/dc/terms/>
            PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
            PREFIX edm: <http://www.europeana.eu/schemas/edm/>
            PREFIX foaf: <http://xmlns.com/foaf/0.1/>
            # tel aantallen per materiaal
            SELECT ?subcategorie ?geoLabel (COUNT(?cho) AS ?choCount) WHERE {
              # haal van een term in de thesaurus de subcategorieen op
             ${item.category} skos:narrower* ?subcategorie .
              # haal de objecten van deze subcategorieen en het geo
             ?cho edm:isRelatedTo ?subcategorie .
             ?cho dct:spatial ?geo.
              #<https://hdl.handle.net/20.500.11840/termmaster2> skos:narrower ?geo .
              # haal het Label op van geo
             ?geo skos:prefLabel ?geoLabel .
            }
            GROUP BY ?subcategorie ?geoLabel
            ORDER BY DESC(?choCount)
            LIMIT 10`;
            runQuery(eindpoint, geoQuery, handelGeo)
        });
    }
}
geoArray = [];

function handelGeo(data) {
    geoArray.push(data)
    if (geoArray.length == 19) {
        console.log(geoArray)
    }
}