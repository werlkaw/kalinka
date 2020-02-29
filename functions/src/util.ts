export function cleanString(dirtyStr: string): string {
    let cleanStr = dirtyStr;
    const map: { [id: string]: string; } = {
        'a': 'á|Á',
        'e': 'é|É',
        'i': 'í|Í',
        'o': 'ó|Ó',
        'u': 'ú|Ú'
    };

    cleanStr.toLowerCase();
    for (const pattern in map) {
        cleanStr = cleanStr.replace(new RegExp(map[pattern], 'g'), pattern);
    }
    return cleanStr;
}