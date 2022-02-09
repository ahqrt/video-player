export function isTrue(value?: string | boolean) {
    if (!value) return false

    if (typeof value === 'string') {
        return value === 'true'
    }
    if (typeof value === 'boolean') {
        return value
    }
    return !!value
}
