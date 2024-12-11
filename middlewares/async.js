module.exports = function asyncFunction(logic){
    return async function(req,res,next){
        try{
            //businessLogic
            await logic(req,res);
        }catch(err){
            next(err);
        }
    }
}