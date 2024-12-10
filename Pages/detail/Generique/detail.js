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

const descVar = "Description";


function getUrl(ressource){
    ressource = "dbr:" + ressource;
    query = `
                    SELECT DISTINCT ?Property ?Value
                    WHERE {
                        {${ressource} ?Property ?Value .
                        FILTER (isIRI(?Value) || isBlank(?Value) || LANG(?Value) = "en" || LANG(?Value) = "").
                        FILTER (!regex(?Property, ".*type.*","i")) .
                        FILTER (!regex(?Property, ".*differentFrom.*","i")) .
                        FILTER (!regex(?Property, ".*depiction.*","i")) .
                        FILTER (!regex(?Property, ".*subject.*","i")) .
                        FILTER (!regex(?Property, ".*SameAs.*","i")) .
                        FILTER (!regex(?Property, ".*Wiki.*","i")) .
                        FILTER (!regex(?Property, ".*sid.*","i")) .
                        FILTER (!regex(?Property, ".*soc.*","i")) .
                        FILTER (!regex(?Property, ".*input.*","i")) .
                        }
                        UNION
                        {OPTIONAL{${ressource} dbo:thumbnail ?Value .}}
                    }
                    LIMIT 60
                `;
    url = "https://dbpedia.org/sparql" + "?query=" + encodeURIComponent(query) + "&format=json";
    return url;
}


async function getType(ressource){
    ressource = "dbr:" + ressource;
    query = `
        SELECT ?isWhat
        WHERE {
            ${ressource} dbp:type ?type.
            BIND(IF(
                regex(?type, ".*PHONE.*", "i") || regex(?type, ".*PHABLET.*", "i"),
                "Tel",
                    IF(
                    regex(?type, ".*COMPANY.*", "i"),
                    "Brand",
                    "Generique"
                    )
            ) AS ?isWhat)
        }
    `
    url = "https://dbpedia.org/sparql" + "?query=" + encodeURIComponent(query) + "&format=json";

    try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',  
          }
        });
    
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
    
        const data = await response.json();

        return data.results && data.results.bindings.length 
          ? data.results.bindings[0].isWhat.value 
          : "Generique";
    
    } 
    catch (error) {
        //console.error('Error:', error);
        return "Generique";
    }
}

function getUrifiedForm(ressource, type, label){

    return `<a href="../${type}/detail.html?uri=${ressource}&label=${label}"> ${label}</a>`;
}


function getDetails(ressource){
    
    const url = getUrl(ressource);
    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
    })
        .done((data) => {
            const items = data.results.bindings;
            items.forEach(item => {
                if(item.Property){
                    var newRow;
                    var prop = item["Property"].value;
                    const lastHashIndex = prop.lastIndexOf("#");
                    prop = prop.substring(lastHashIndex + 1);
                    const lastSlashIndex = prop.lastIndexOf("/");
                    prop = prop.substring(lastSlashIndex + 1);
                    prop = String(prop).charAt(0).toUpperCase() + String(prop).slice(1);
                    var value = item["Value"].value;
                    switch(prop){
                        case "Thumbnail":
                            $('#image').attr('src', value);
                        case "ImageCaption":
                            $('#image').attr('alt', value);
                        default:
                            const include = value.includes("http://dbpedia.org/");
                            if(include) {
                                console.log(value);
                                newRow = `
                                    <tr>
                                        <td>${prop}</td>
                                        <td>${value.split(',').map((sub)=>{
                                            // Si c'est une URI on récupère que le texte après le dernier '/'
                                            const lastSlashIndex = sub.lastIndexOf("/");
                                            ressource = sub.substring(lastSlashIndex + 1);
                                            getType(ressource)
                                            .then((type) => {
                                                console.log(sub, type);
                                                return getUrifiedForm(ressource, type, ressource);
                                            });  
                                            
                                        })} </td>
                                    </tr>
                                `;
                            }
                            else {

                                newRow = `
                                    <tr>
                                        <td>${prop}</td>
                                        <td>${value}</td>
                                    </tr>
                                `;
                            }
                                
            
                            $('#content-tab-prop').append(newRow);
                            break;
                    }
                }

            });
            // for (const key in item) {
            //     var value = item[key].value;
            //     switch(key){
            //         case `${imageVar}`:
            //             $('#imageTel').attr('src', value);
            //             break;
            //         default:
            //             const include = value.includes("http://dbpedia.org/");
            //             console.log(value, include);
            //             if(include) {
            //                 // Si c'est une URI on récupère que le texte après le dernier '/'
            //                 const lastSlashIndex = value.lastIndexOf("/");
            //                 label = value.substring(lastSlashIndex + 1);
            //                 var type = "Generique";
            //                 if(type === predVar) type ="Tel";
            //                 value = getUrifiedForm(value, key, label);
            //             }

            //             let newRow = `
            //                 <tr>
            //                     <td>${key}</td>
            //                     <td>${value}</td>
            //                 </tr>
            //             `;

            //             $('#content-tab-prop').append(newRow);
            //     }
            // }
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
    console.log(ressource);
    const lastSlashIndex = ressource.lastIndexOf("/");
    ressource = ressource.substring(lastSlashIndex + 1);
    console.log(ressource);
    getDetails(ressource);

});
