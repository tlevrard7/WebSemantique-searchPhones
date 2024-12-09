/*
function getImageTelephone_WikiData(nomTel){

    const query = 
    `
        SELECT ?phone ?image 
        WHERE {
            ?phone wdt:P306 ?os. # Permet de filtrer avant de rechercher par label (j'ai pas trouvé de type bien défini pour les smartphones sur wikidata)
            ?phone rdfs:label ?label.
            FILTER(regex(?label, ".*${nomTel}.*", "i")).
            OPTIONAL { ?phone wdt:P18 ?image. } # Image associée au téléphone
        }
        LIMIT 1
    `;
    
    const url = "https://query.wikidata.org/sparql" + "?query=" + encodeURIComponent(query) + "&format=json";

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
    })
    .done((data) => {
        const result = data.results.bindings[0];
        const imageUrl = result.image.value;
        console.log(imageUrl)
        $('#imageTel').attr('src', imageUrl); 
    
    })
    .fail((error) => {
        alert("La requête a échoué. Infos : " + JSON.stringify(error));
    });
}
*/

function getQuery(id, type){
    var query = ``
    
    switch(type){
        case "tel":
            const nomTel = `"${id}"@en`;
            query = `
                    PREFIX dbr: <http://dbpedia.org/resource/>
                    PREFIX dbo: <http://dbpedia.org/ontology/>
                    PREFIX dbp: <http://dbpedia.org/property/>
                    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                    SELECT ?label ?brand ?releaseDate ?cpu ?gpu ?image ?pred
                    WHERE {
                        ?tel a dbo:Device; 
                            rdfs:label ?label;  
                            dbp:type ?type.
                        FILTER(?label = ${nomTel}) .
                        FILTER (lang(?label) = "en") . 
                        {
                            FILTER (regex(?type, ".*PHONE.*", "i")) 
                        }
                        UNION
                        {
                            FILTER (regex(?type, ".*PHABLET.*", "i")) 
                        }
                        OPTIONAL { ?tel dbo:releaseDate ?releaseDate. }
                        OPTIONAL { ?tel dbp:brand ?brand. }
                        OPTIONAL { ?tel dbp:cpu ?cpu. }
                        OPTIONAL { ?tel dbp:gpu ?gpu. }
                        OPTIONAL { ?tel foaf:depiction ?image. }
                        OPTIONAL { ?tel dbp:predecessor ?pred. }
                    }
                `;
    }
    return query;
}


function getDetails(id, type){
    
    const query = getQuery(id, type);
    
    const url = "https://dbpedia.org/sparql" + "?query=" + encodeURIComponent(query) + "&format=json";
    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
    })
        .done((data) => {
            const item = data.results.bindings[0];
            console.log(item);
                
            for (const key in item) {
                var value = item[key].value;
                if (key!="image"){
                    
                    const include = value.includes("http://dbpedia.org/");
                    console.log(value, include);
                    if(include) {
                        // Si c'est une URI on récupère que le texte après le dernier '/'
                        const lastSlashIndex = value.lastIndexOf("/");
                        value = value.substring(lastSlashIndex + 1);
                    }

                    let newRow = `
                        <tr>
                            <td>${key}</td>
                            <td>${value}</td>
                        </tr>
                    `;

                    $('#content-tab-prop').append(newRow);
                } 
                else{
                    $('#imageTel').attr('src', value);
                }
            }
        })
        .fail((error) => {
            alert("La requête a échoué. Infos : " + JSON.stringify(error));
        });
}

$(document).ready(function () {
    
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const type = urlParams.get("type");

    $('#page-title').html(`Détails du ${id}`);
    
    getDetails(id, type);

});
