
const descVar = "Description";


function getUrl(ressource){
    ressource = "<http://dbpedia.org/resource/" + ressource + ">";
    query = `
                    SELECT DISTINCT ?Property (GROUP_CONCAT(?Value; SEPARATOR = ", ") AS ?Value)
                    WHERE {
                        ${ressource} ?Property ?Value .
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
                        OPTIONAL{${ressource} dbo:thumbnail ?Value .}
                    }
                    GROUP BY ?Property
                    LIMIT 60
                `;
    url = "https://dbpedia.org/sparql" + "?query=" + encodeURIComponent(query) + "&format=json";
    return url;
}


async function getType(ressource){
    ressource = "<http://dbpedia.org/resource/" + ressource + ">";
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
        const response = await fetch(url, { sync: true }, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',  
          }
        });
    
        if (!response.ok) {
          console.log("not ok");
          throw new Error('Network response was not ok');
        }
    
        const data = await response.json();

        console.log("bite2");
        return data.results && data.results.bindings.length 
          ? data.results.bindings[0].isWhat.value 
          : "Generique";
    
    } 
    catch (ressource) {
        console.log(type);
        console.log("bite");
        //console.error('Error:', error);
        return "Generique";
    }
}

function getUrifiedForm(ressource, type, label){

    return `<a href="../${type}/detail.html?uri=${encodeURIComponent(ressource)}&label=${label}"> ${label}</a>`;
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
                                            label = sub.substring(lastSlashIndex + 1);
                                            return getUrifiedForm(label, "Generique", label);
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
        })
        .fail((error) => {
            alert("La requête a échoué. Infos : " + JSON.stringify(error));
        });
}

$(document).ready(async function () {
    
    const urlParams = new URLSearchParams(window.location.search);
    var label = urlParams.get("label");
    var ressource = urlParams.get("uri");
    
    console.log(ressource)
    $('#page-title').html(`${label}`);
    type = await getType(ressource);
    if(type !== "Generique") window.location.href = `../${type}/detail.html?uri=${encodeURIComponent(ressource)}&label=${encodeURIComponent(label)}`;
    
    getDetails(ressource);

});
