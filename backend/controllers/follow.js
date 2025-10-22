const PruebaFollows = (req,res) =>{
    return res.status(200).send({
        message: "Mensaje Enviado desde Follows"
    })
}
module.exports ={
    PruebaFollows
}
