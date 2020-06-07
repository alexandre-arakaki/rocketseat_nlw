const express = require("express")
const server = express()


// "start": "node src/server.js"
//pega o db
const db = require("./database/db.js")

// pasta publica
server.use(express.static("public"))

//habilitar req.body
server.use(express.urlencoded({extended: true}))

// template engine
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCashe: true
})

//caminhos
server.get("/", (req, res) => {

    console.log(req.query)
    db.all(`SELECT city FROM places`, function(err, cities){
        if(err){
            return console.log(err)
        }

        return res.render("index.html", {cities:cities})
    })
})

server.get("/create-point", (req, res) => {

    // query string
    return res.render("create-point.html", {saved: false})
})

server.post("/savepoint", (req, res) => {
    console.log(req.body)

    const query = `
        INSERT INTO places 
            (image, name, address, address2, state, city, items) 
        VALUES (?,?,?,?,?,?,?);
    `

    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items,
    ]

    function afterInsertData(err){
        if(err){
            return console.log(err)
            return res.send("Erro no cadastro!") // adicionar página de erro
        }

        console.log("Cadastrado com sucesso")
        console.log(this)
        return res.render("create-point.html", {saved:true})
    }

    db.run(query, values, afterInsertData)

})

server.get("/search", (req, res) => {

    const search = req.query.search;
    
    if (search == "") {
        return res.render("search-results.html", {total:0})
    }

    // pega no banco de dados
    // db.all(`SELECT * FROM places`, function(err, rows){
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows){
        if(err){
            return console.log(err)
        }

        const total = rows.length

        // mostrar a página html com os dados do banco de dados
        return res.render("search-results.html", {places: rows, total})
    })

})

// ligar servidor
server.listen(process.env.PORT || 3000)