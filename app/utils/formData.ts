export function objectToFormData(obj: Record<string, unknown>, files?: File[], fileKey: string = 'images[]'): FormData {
    const fd = new FormData()

    const appendFormData = (data: unknown, rootName?: string) => {
        if (data === null || data === undefined) return

        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                appendFormData(item, rootName ? `${rootName}[${index}]` : `${index}`)
            })
        } else if (typeof data === 'object' && !(data instanceof File) && !(data instanceof Blob)) {
            const objData = data as Record<string, unknown>
            Object.keys(objData).forEach((key) => {
                if (objData[key] === null || objData[key] === undefined) return
                appendFormData(objData[key], rootName ? `${rootName}[${key}]` : key)
            })
        } else {
            if (rootName) {
                fd.append(rootName, data instanceof Blob ? data : String(data))
            }
        }
    }

    appendFormData(obj)

    if (files && files.length > 0) {
        files.forEach((file) => {
            if (file instanceof File) {
                fd.append(fileKey, file, file.name)
            }
        })
    }

    return fd
}
