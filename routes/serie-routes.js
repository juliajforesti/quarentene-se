const express = require("express");
const router = express.Router();
const Serie = require("../models/serie");
const ensureLogin = require("connect-ensure-login");

const uploadCloud = require("../config/cloudinary.js");
const multer = require("multer");
const cloudinary = require("cloudinary");

// capitalize words function
String.prototype.capitalize = function () {
  return this.replace(/(?:^|\s)\S/g, function (a) {
    return a.toUpperCase();
  });
};

// Checking role
const checkRoles = (role) => {
  return (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    } else {
      req.logout();
      res.redirect("/");
    }
  };
};

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
      series = series.filter((item) => item.post);
      res.render("serie/series", { series, user: req.user, genreArr });
    })
    .catch((error) => console.log(error));
});

// SERIE INFO
router.get("/serie/:id", (req, res, next) => {
  const { id } = req.params;

  Serie.findById(id)
    .populate("owner")
    .then((serie) => {
      if (
        (serie.owner &&
          req.user &&
          serie.owner._id.toString() === req.user._id.toString()) ||
        (req.isAuthenticated() && req.user.role === "ADMIN")
      ) {
        serie.isOwner = true;
      }
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
        res.redirect(`/serie/${id}`);
      })
      .catch((error) => console.log(error));
  }
);

// ADDED SERIE
router.get("/serie-adicionada", ensureLogin.ensureLoggedIn(), (req, res, next) => {
  res.render("serie/added-serie")
})

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

router.post(
  "/add-serie",
  ensureLogin.ensureLoggedIn(),
  uploadCloud.single("imgPath"),
  (req, res, next) => {
    const { rating, genre } = req.body;
    let { name, resume } = req.body;
    name = name.capitalize();

    let imgPath = "";

    if (req.file) {
      imgPath = req.file.url;
    } else {
      imgPath =
        "https://res.cloudinary.com/juliajforesti/image/upload/v1587499323/quarentene-se/popcorn_qvsl23_-_co%CC%81pia_c299uu.png";
    }

    Serie.create({
      name,
      resume,
      rating,
      genre,
      owner: req.user._id,
      imgPath,
    })
      .then((response) => {
        res.redirect("/serie-adicionada");
      })
      .catch((error) => console.log(error));
  }
);

// EDIT SERIE ROUTES
router.get(
  "/editar-serie/:serieId",
  ensureLogin.ensureLoggedIn(),
  (req, res, next) => {
    // ensureLogin.ensureLoggedIn(), checkAdmin
    const { serieId } = req.params;
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

    Serie.findById(serieId)
      .then((serie) => {
        genreArr = genreArr.filter((elem) => !serie.genre.includes(elem));
        res.render("serie/edit-serie", { serie, user: req.user, genreArr });
      })
      .catch((error) => console.log(error));
  }
);

router.post(
  "/editar-serie/:serieId",
  uploadCloud.single("imgPath"),
  (req, res, next) => {
    const { rating, genre } = req.body;

    let { name, resume } = req.body;
    name = name.capitalize();

    const { serieId } = req.params;

    if (req.file) {
      const imgPath = req.file.url;
      const imgName = req.file.originalname;

      Serie.findByIdAndUpdate(
        serieId,
        {
          $set: {
            name,
            rating,
            resume,
            genre,
            imgPath,
            imgName,
          },
        },
        { new: true }
      )
        .then((response) => {
          res.redirect(`/serie/${serieId}`);
        })
        .catch((error) => console.log(error));
    }
    Serie.findByIdAndUpdate(
      serieId,
      {
        $set: {
          name,
          rating,
          resume,
          genre,
        },
      },
      { new: true }
    )
      .then((response) => {
        res.redirect(`/serie/${serieId}`);
      })
      .catch((error) => console.log(error));
  }
);

// DELETE ROUTES
router.get("/delete-serie/:serieId", (req, res, next) => {
  // ensureLogin.ensureLoggedIn(), checkAdmin,

  const { serieId } = req.params;
  Serie.findByIdAndDelete(serieId)
    .then((response) => {
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
        series = series.filter((item) => item.post);
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
    genre: { $in: genre },
    name: { $regex: search, $options: "i" },
  })
    .sort({ rating: -1 })
    .then((series) => {
      if (!Array.isArray(genre)) {
        genreArr = genreArr.filter((elem) => !genre.includes(elem));
        let buscado = "Buscado";
        series = series.filter((item) => item.post);
        res.render("serie/series", {
          genreOne: genre,
          series,
          genreArr,
          user: req.user,
          buscado,
          search,
        });
        return;
      } else {
        genreArr = genreArr.filter((elem) => !genre.includes(elem));
        let buscado = "Buscado";
        series = series.filter((item) => item.post);
        res.render("serie/series", {
          genre,
          series,
          genreArr,
          user: req.user,
          buscado,
          search,
        });
      }
    })
    .catch((error) => console.log(error));
});

router.get(
  "/post-serie/:id",
  ensureLogin.ensureLoggedIn(),
  checkRoles("ADMIN"),
  (req, res, next) => {
    const { id } = req.params;
    Serie.findByIdAndUpdate(id, { $set: { post: true } }, { new: true })
      .then((response) => {
        res.redirect("/admin");
      })
      .catch((err) => console.log(err));
  }
);

module.exports = router;
