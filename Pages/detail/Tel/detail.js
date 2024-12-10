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

const predVar = "Predecessor";
const imageVar = "Image";
const gpuVar = "GPU";
const cpuVar = "CPU";
const releaseDateVar = "ReleaseDate";
const brandVar = "Brand";
const labelVar = "Label";

function getQuery(label){
    return `
                    PREFIX dbr: <http://dbpedia.org/resource/>
                    PREFIX dbo: <http://dbpedia.org/ontology/>
                    PREFIX dbp: <http://dbpedia.org/property/>
                    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                    SELECT ?${labelVar} ?${brandVar} ?${releaseDateVar} ?${cpuVar} ?${gpuVar} ?${imageVar} ?${predVar}
                    WHERE {
                        ?tel a dbo:Device; 
                            rdfs:label ?${labelVar};  
                            dbp:type ?type.
                        FILTER(?${labelVar} = ${label}) .
                        FILTER (lang(?${labelVar}) = "en") . 
                        {
                            FILTER (regex(?type, ".*PHONE.*", "i")) 
                        }
                        UNION
                        {
                            FILTER (regex(?type, ".*PHABLET.*", "i")) 
                        }
                        OPTIONAL { ?tel dbo:releaseDate ?${releaseDateVar}. }
                        OPTIONAL { ?tel dbp:brand ?${brandVar}. }
                        OPTIONAL { ?tel dbp:cpu ?${cpuVar}. }
                        OPTIONAL { ?tel dbp:gpu ?${gpuVar}. }
                        OPTIONAL { ?tel foaf:depiction ?${imageVar}. }
                        OPTIONAL { ?tel dbp:predecessor ?${predVar}. }
                    }
                `;
}

function getUrifiedForm(label, type){

    return `<a href="../${type}/detail.html?label=${label}"> ${label} </a>`;
}


function getDetails(label){
    
    const query = getQuery(label);
    
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
                switch(key){
                    case `${imageVar}`:
                        $('#imageTel').attr('src', value);
                        break;
                    default:
                        const include = value.includes("http://dbpedia.org/");
                        console.log(value, include);
                        if(include) {
                            // Si c'est une URI on récupère que le texte après le dernier '/'
                            const lastSlashIndex = value.lastIndexOf("/");
                            value = value.substring(lastSlashIndex + 1);
                            const type = key;
                            if(type === "Predecessor") type ="Tel";
                            value = getUrifiedForm(value, key);
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
    const label = urlParams.get("label");

    $('#page-title').html(`Détails du ${label}`);
    
    getDetails(label);

});
