import BaseService from "./index";

export default class FileApi {

    static uploadFile(formData: FormData) {
        return BaseService.post('/message/send/file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
    }

    static downloadFile(id: number) {
        return BaseService.get('/file/download/' + id, {
            responseType: "blob",
        })
    }
}