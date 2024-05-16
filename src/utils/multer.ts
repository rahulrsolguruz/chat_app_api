import multer from 'multer';
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
  }
});
const multerUpload = multer({
  limits: {
    fileSize: 1024 * 1024 * 5
  }
});
// const upload = multer({ storage }).single('image');
const upload = multer({ storage });
const attachmentsMulter = multerUpload.array('files', 5);
export { upload, attachmentsMulter };
