const getValue = (obj: any, possibleKeys: string[]) => {
    for (const key of possibleKeys) {
        if (obj[key] !== undefined && obj[key] !== null) {
            return obj[key]
        } 
    }
    
    return null
}

export default getValue