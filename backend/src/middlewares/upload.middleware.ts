import multer from 'multer'

const storage = multer.memoryStorage()

const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image.jpeg') {
        cb(null, true)
    } else {
        cb(new Error('Only PNG, JPG, JPEG allowed'), false)
    }
}

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }   // 10MB
})