import responseMsgs from './responseMsgs.js';
const errorHandler = (res,er)=>{
    let errorResult

    if(er.message){
        errorResult = er.message.split(',')
     }
     else if (er.errors && Array.isArray(er.errors)) {
        errorResult = er.errors.map((e) => e.msg);
     }
    else{
        errorResult = [er]
    }

    res.status(400).json({
        'status' : responseMsgs.FAIL,
        data : errorResult
    })
}

export default errorHandler