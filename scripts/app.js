 //margin, width and height and raduis for teh circle
 const margin = {
         top: 20,
         right: 20,
         bottom: 20,
         left: 20
     },
     width = 500 - margin.right - margin.left,
     height = 500 - margin.top - margin.bottom,
     raduis = width / 2;
 // arc generator
 const arc = d3.arc()
     .outerRadius(raduis - 10)
     .innerRadius(0);

 const color = d3.scaleOrdinal(d3.schemeDark2);

 // labelArc genraren om de label te centereren
 const labelArc = d3.arc()
     .outerRadius(raduis - 50)
     .innerRadius(raduis - 50);

 // pie generator
 const pie = d3.pie()
     .sort(null)
     .value(function (d) {
         return d.countObj
     });
 // define svg
 const svg = d3.select("#dashboard").append("svg")
     .attr("width", width)
     .attr("height", height)
     .append("g")
     .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

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
         return prettyData
     })
     .then(data => {
         koppelData(data)
     })


 function koppelData(data) {
     // parse the  data
     console.dir(data)

     data.forEach(function (d) {
         d.countObj = +d.countObj; // "23" => 23
         d.categoryLabel = d.categoryLabel; // "name" => "name"
     });

     //append g element (.arc)
     const g = svg.selectAll(".arc")
         .data(pie(data))
         .enter().append('g')
         .attr("class", "arc");
     // append path to g(.arc)
     g.append("path")
         .attr("d", arc)
         .style("fill", function (d) {
             return color(d.data.categoryLabel)
         });

     //appen the text (labels)
     g.append('text')
         .attr("transform", function (d) {
             return "translate(" + labelArc.centroid(d) + ")"
         })
         .attr('font-size', '8')
         .attr("dy", ".35em")
         .text(function (d) {
             return d.data.categoryLabel
         });
 }

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
         return mapDataVanCategorien
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