import multer from 'multer'

const storage = multer.memoryStorage()

const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith("image/") ||
        file.mimetype.startsWith("video/")) {
        cb(null, true)
    } else {
        cb(new Error('Only images and videos are allowed'), false)
    }
}

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }   // 50MB
})