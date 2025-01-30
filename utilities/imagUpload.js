import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },

  filename: (req, file, cb) => {
    console.log(file);
    let orginalName = path.basename(
      file.originalname,
      path.extname(file.originalname)
    );
    let ext = file.mimetype.split("/")[1];
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userName = decoded.name ? decoded.name : "unKnown User";
    const date = new Date().toISOString().split("T")[0];
    let name = orginalName + "-" + userName + "-" + date + "." + ext;
    cb(null, name);
  },
});

const docProfile = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/doc-img");
  },

  filename: (req, file, cb) => {
    console.log(file);
    let orginalName = path.basename(
      file.originalname,
      path.extname(file.originalname)
    );
    let ext = file.mimetype.split("/")[1];
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const docName = decoded.name ? decoded.name : "unKnown User";
    const date = new Date().toISOString().split("T")[0];
    let name = orginalName + "-" + docName + "-" + date + "." + ext;
    cb(null, name);
  },
});

const patientProfile = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/patients/profilePics");
  },

  filename: (req, file, cb) => {
    let originalName = path.basename(
      file.originalname,
      path.extname(file.originalname)
    );
    let ext = file.mimetype.split("/")[1];
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const userName = decoded.name ? decoded.name : "unknown patient";
    const date = new Date().toISOString().split("T")[0];
    let name = originalName + "-" + userName + "-" + date + "." + ext;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });
const uploadDocProfile = multer({ storage: docProfile });
const uploadPatientProfile = multer({ storage: patientProfile });

export default{ upload, uploadDocProfile, uploadPatientProfile };
