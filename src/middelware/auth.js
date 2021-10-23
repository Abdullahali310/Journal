const jwt = require('jsonwebtoken')
const Journalist = require('../models/journalist')

const auth = async (req,res,next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ','')

        const decode = jwt.verify(token,'NodeJournalistAPI')

        const journalist = await Journalist.findOne({_id:decode._id,'tokens.token':token})
        if(!journalist){
            throw new Error()
        }

        req.journalist = journalist

        req.token = token

        next()
    }
    catch(e){
        res.status(401).send({error:'Sing Up Please'})
    }
}

module.exports = auth