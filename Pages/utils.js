function getAttributes(ressource, ...attributes) {
    ressource = escapeSparqlChars(ressource);
    const vars = attributes.map(a => '?' + a.replace(':', '_'))
    const filters = attributes.map((a, i) => typeof(a) == String ? null : a[1])
    const uris = attributes.map((a, i) => typeof (a) == String ? a : a[0])
    
    const selects = uris.map((a, i) => `GROUP_CONCAT(DISTINCT ${vars[i]}; SEPARATOR=" | ") AS ${vars[i]}`)
    const options  = attributes.map((a, i) => `OPTIONAL { ${typeof (a) == Stringuris[i]} ${a} ${vars[i]}.`)
    
    return `
        PREFIX dbr: <http://dbpedia.org/resource/>
        PREFIX dbo: <http://dbpedia.org/ontology/>
        PREFIX dbp: <http://dbpedia.org/property/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX prov: <http://www.w3.org/ns/prov#>
        PREFIX dc: <http://purl.org/dc/terms/>
        SELECT ${selects.join(' ')}
        WHERE { ${options.join(' ')}}
    `;
}

function escapeSparqlChars(ressource) {
    for (const c of '(){};.') ressource = ressource.replace(c, '\\' + c)
    return ressource
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
          
          throw new Error('Network response was not ok');
        }
    
        const data = await response.json();

        
        return data.results && data.results.bindings.length 
          ? data.results.bindings[0].isWhat.value 
          : "Generique";
    
    } 
    catch (ressource) {
        //console.error('Error:', error);
        return "Generique";
    }
}

async function redirect(base, ressource, label){
    type = await getType(ressource);
    if(type !== "Generique") window.location.href = `${base}/${type}/detail.html?uri=${encodeURIComponent(ressource)}&label=${encodeURIComponent(label)}`;
    else window.location.href = `${base}/Generique/detail.html?uri=${encodeURIComponent(ressource)}&label=${encodeURIComponent(label)}`;
}

function getUrifiedForm(base, ressource, label, content){

    //return `<a href="${base}/${type}/detail.html?uri=${encodeURIComponent(ressource)}&label=${label}"> ${label}</a>`;
    return `<a href="#" onclick='redirect("${base}", "${ressource}", "${label}")'> ${content}</a>`;
}