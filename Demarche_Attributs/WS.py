from SPARQLWrapper import SPARQLWrapper, JSON

# Configuration de l'endpoint SPARQL DBpedia
sparql = SPARQLWrapper("https://dbpedia.org/sparql")

def get_resource_properties(resource_uri):
    """
    Interroge toutes les propriétés et valeurs d'une ressource DBpedia,
    en affichant uniquement les résultats en anglais.
    """
    query = f"""
    SELECT DISTINCT ?property ?value
    WHERE {{
        <{resource_uri}> ?property ?value .
        FILTER (lang(?value) = "en" || !lang(?value))  # Inclure les valeurs sans langue et en anglais uniquement
    }}
    """
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    return results

def display_properties(resource_uri):
    """
    Affiche toutes les propriétés et valeurs pertinentes d'une ressource.
    """
    print(f"Informations pour la ressource : {resource_uri}\n")
    results = get_resource_properties(resource_uri)
    
    if "results" in results and "bindings" in results["results"]:
        for result in results["results"]["bindings"]:
            property_name = result["property"]["value"]
            value = result["value"]["value"]
            print(f"{property_name} -> {value}")
    else:
        print("Aucune information trouvée.")

# Exemple d'utilisation
if __name__ == "__main__":
    # Remplacez cette URI par celle de la ressource que vous voulez interroger
    resource_uri = "http://dbpedia.org/resource/OnePlus_10_Pro"
    display_properties(resource_uri)