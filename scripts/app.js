const eindpoint = "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-22/sparql";
const categorieLength = 19
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

runQuery(eindpoint, categorieQuery)
    .then(data => {
        const prettyData = loopData(data)

        console.log(prettyData)
    })

function getGeoQueryForCategory(category) {
    return `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX dc: <http://purl.org/dc/elements/1.1/>
        PREFIX dct: <http://purl.org/dc/terms/>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX edm: <http://www.europeana.eu/schemas/edm/>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        # tel aantallen per materiaal
        SELECT ?subcategorie ?geoLabel (COUNT(?cho) AS ?choCount) WHERE {
        # haal van een term in de thesaurus de subcategorieen op
        ${category} skos:narrower* ?subcategorie .
        # haal de objecten van deze subcategorieen en het materiaal
        ?cho edm:isRelatedTo ?subcategorie .
        ?cho dct:spatial ?geo .
        # haal het Label op van materiaal
        ?geo skos:prefLabel ?geoLabel .
        }
        GROUP BY ?subcategorie ?geoLabel
        ORDER BY DESC(?choCount)
        LIMIT 10`;
}


function loopData(data) {
    const mapDataVanCategorien = mapData(data)
    return mapDataVanCategorien.reduce((newData, currentItem) => {
        runQuery(eindpoint, getGeoQueryForCategory(currentItem.category))
            .then(data => {
                currentItem.landen = data
                    .map(item => {
                        return {
                            gebiedLabel: item.geoLabel.value,
                            aantalObjInGebied: item.choCount.value
                        }
                    })

                newData.push(currentItem)
            })

        return newData
    }, [])
}

function mapData(data) {
    return data.map(item => {
        return {
            category: `<${item.category.value}>`,
            categoryLabel: item.categoryLabel.value,
            countObj: item.choCount.value,
        }
    })
}


function runQuery(url, query) {
    return fetch(url + "?query=" + encodeURIComponent(query) + "&format=json")
        .then(res => res.json())
        .then(data => data.results.bindings)
        .catch(error => {
            console.log(error)
        })
}