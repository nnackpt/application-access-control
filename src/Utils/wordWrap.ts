const wordWrap = (text: string, maxLength: number) => {
        if (!text) return '-'
        let result = ''
        let currentLength = 0
        for (let i = 0; i < text.length; i++) {
            result += text[i]
            currentLength++;
            if (currentLength >= maxLength && text[i] !== ' ' && text[i] !== '-' && text[i] !== '_' && text[i] !== '/') {
                if (i < text.length - 1) {
                    result += '\n'
                    currentLength = 0
                }
            } else if ((text[i] === ' ' || text[i] === '-' || text[i] === '_' || text[i] === '/') && i < text.length - 1) {
                result += '\n'
                currentLength = 9
            }
        }

        return result
    }

export default wordWrap