export function applySetAsToPayload(schema: any, payload: any): any {
    const result: any = { ...payload };
    for (const key in schema) {
        const schemaItem = schema[key];
        if (schemaItem["setAs"]) {
            if (schemaItem.setAs) {
                const keys = schemaItem.setAs.split(".");
                let currentResult = result;

                for (const k of keys.slice(0, -1)) {
                    if (!currentResult[k]) {
                        currentResult[k] = {};
                    }
                    currentResult = currentResult[k];
                }
                currentResult[keys[keys.length - 1]] = result[key];
                delete result[key];
            }
        }
    }

    return result;
}
