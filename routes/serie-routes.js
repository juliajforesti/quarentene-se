const express = require("express");
const router = express.Router();
const Serie = require("../models/serie");
const ensureLogin = require("connect-ensure-login");

// Series routes
router.get("/series", (req, res, next) => {
    Serie.find()
    .sort({ rating: -1 })
    .then((series) => {
        let genreArr = [
        "Ação",
        "Animação",
        "Aventura",
        "Comédia",
        "Comédia romantica",
        "Cult",
        "Documentário",
        "Drama",
        "Espionagem",
        "Erótico",
        "Fansatia",
        "Faroeste",
        "Ficção científica",
        "Série",
        "Guerra",
        "Musical",
        "Policial",
        "Romance",
        "Suspense",
        "Terror",
        "Trash",
    ];
    res.render("serie/series", { series, user: req.user, genreArr });
    })
    .catch((error) => console.log(error));
});

// SERIE INFO
router.get("/serie/:id", (req, res, next) => {
    const { id } = req.params;

    Serie.findById(id)
    .then((serie) => {
        res.render("serie/serie-detail", { serie, user: req.user });
    })
    .catch((error) => console.log(error));
});

router.post(
    "/serie-review/:id",
    ensureLogin.ensureLoggedIn(),
    (req, res, next) => {
    const { id } = req.params;
    const { comment } = req.body;
    Serie.findByIdAndUpdate(
        id,
        { $push: { review: { user: req.user.username, comment } } },
        { new: true }
    )
        .then((response) => {
        console.log(response);
        res.redirect(`/serie/${id}`);
        })
        .catch((error) => console.log(error));
    }
);

// ADD SERIE
router.get("/add-serie", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  let genreArr = [
    "Ação",
    "Animação",
    "Aventura",
    "Comédia",
    "Comédia romantica",
    "Cult",
    "Documentário",
    "Drama",
    "Espionagem",
    "Erótico",
    "Fansatia",
    "Faroeste",
    "Ficção científica",
    "Série",
    "Guerra",
    "Musical",
    "Policial",
    "Romance",
    "Suspense",
    "Terror",
    "Trash",
    ];
    res.render("serie/add-serie", { user: req.user, genreArr });
});

router.post("/add-serie", ensureLogin.ensureLoggedIn(), (req, res, next) => {
    const { name, resume, rating, genre } = req.body;

    Serie.create({ name, resume, rating, genre })
    .then((response) => {
        console.log(response);
        res.redirect("/series");
    })
    .catch((error) => console.log(error));
});

// filter routes

router.post("/series/search", (req, res, next) => {
    let { search, genre } = req.body;

    let genreArr = [
    "Ação",
    "Animação",
    "Aventura",
    "Comédia",
    "Comédia romantica",
    "Cult",
    "Documentário",
    "Drama",
    "Espionagem",
    "Erótico",
    "Fansatia",
    "Faroeste",
    "Ficção científica",
    "Série",
    "Guerra",
    "Musical",
    "Policial",
    "Romance",
    "Suspense",
    "Terror",
    "Trash",
    ];
    if (!genre) {
    Serie.find({
        name: { $regex: search, $options: "i" },
    })
        .sort({ rating: -1 })
        .then((series) => {
        let buscado = "Buscado";
        res.render("serie/series", {
            series,
            genreArr,
            user: req.user,
            buscado,
            search,
        });
    })
        .catch((error) => console.log(error));
    return;
    }

    Serie.find({
    genre,
    name: { $regex: search, $options: "i" },
    })
    .sort({ rating: -1 })
    .then((series) => {
        let buscado = "Buscado";
        res.render("serie/series", {
            series,
            genreArr,
            user: req.user,
            buscado,
            search,
        });
    })
    .catch((error) => console.log(error));
});

module.exports = router;
