const multer = require('multer')
const path = require('path')
const jwt = require("jsonwebtoken")

const storage = multer.diskStorage({
    
    destination:(req,file,cb)=>{
        cb(null,'./uploads')
    },
    
    filename : (req,file,cb)=>{
        console.log(file)
        let orginalName = path.basename(file.originalname,path.extname(file.originalname))
        let ext= file.mimetype.split('/')[1]
        const token = req.cookies.jwt
        const decoded = jwt.verify(token, process.env.jwtKey);
        const userName = decoded.name ? decoded.name : "unKnown User"
        const date = new Date().toISOString().split('T')[0]
        let name = orginalName + '-' + userName + '-' + date + '.' + ext
        cb(null,name)
    }

  
})

const upload = multer({storage : storage})

module.exports = upload