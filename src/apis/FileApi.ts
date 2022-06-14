import BaseService from "./index";

export default class FileApi {

    static uploadFile(formData: FormData) {
        return BaseService.post('/message/send/file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
    }
}