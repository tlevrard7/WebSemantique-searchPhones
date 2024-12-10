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
yy        $('#imageTel').attr('src', imageUrl); 
    
    })
    .fail((error) => {
        alert("La requête a échoué. Infos : " + JSON.stringify(error));
    });
}
*/

const predVar = "Predecessor";
const imageVar = "Image";
const gpuVar = "GPU";
const cpuVar = "CPU";
const releaseDateVar = "ReleaseDate";
const brandVar = "Brand";
const labelVar = "Label";

function getQuery(ressource){
    ressource = "dbr:" + ressource;
    return `
                    PREFIX dbr: <http://dbpedia.org/resource/>
                    PREFIX dbo: <http://dbpedia.org/ontology/>
                    PREFIX dbp: <http://dbpedia.org/property/>
                    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                    SELECT ?${labelVar} ?${brandVar} ?${releaseDateVar} ?${cpuVar} ?${gpuVar} ?${imageVar} ?${predVar}
                    WHERE {
                        OPTIONAL { ${ressource} dbo:releaseDate ?${releaseDateVar}. }
                        OPTIONAL { ${ressource} dbp:brand ?${brandVar}. }
                        OPTIONAL { ${ressource} dbp:cpu ?${cpuVar}. }
                        OPTIONAL { ${ressource} dbp:gpu ?${gpuVar}. }
                        OPTIONAL { ${ressource} foaf:depiction ?${imageVar}. }
                        OPTIONAL { ${ressource} dbp:predecessor ?${predVar}. }
                    }
                `;
}

function getUrifiedForm(ressource, type, label){

    return `<a href="../${type}/detail.html?uri=${ressource}&label=${label}"> ${label} </a>`;
}


function getDetails(ressource){
    
    const query = getQuery(ressource);
    
    const url = "https://dbpedia.org/sparql" + "?query=" + encodeURIComponent(query) + "&format=json";
    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
    })
        .done((data) => {
            const item = data.results.bindings[0];
                
            for (const key in item) {
                var value = item[key].value;
                switch(key){
                    case `${imageVar}`:
                        $('#imageTel').attr('src', value);
                        break;
                    default:
                        const include = value.includes("http://dbpedia.org/");
                        if(include) {
                            // Si c'est une URI on récupère que le texte après le dernier '/'
                            const lastSlashIndex = value.lastIndexOf("/");
                            label = value.substring(lastSlashIndex + 1);
                            var type = key;
                            if(type === predVar) type ="Tel";
                            value = getUrifiedForm(value, key, label);
                        }

                        let newRow = `
                            <tr>
                                <td>${key}</td>
                                <td>${value}</td>
                            </tr>
                        `;

                        $('#content-tab-prop').append(newRow);
                }
            }
        })
        .fail((error) => {
            alert("La requête a échoué. Infos : " + JSON.stringify(error));
        });
}

$(document).ready(function () {
    
    const urlParams = new URLSearchParams(window.location.search);
    var label = urlParams.get("label");
    var ressource = urlParams.get("uri");

    $('#page-title').html(`Détails du ${label}`);
    getDetails(ressource);

});
