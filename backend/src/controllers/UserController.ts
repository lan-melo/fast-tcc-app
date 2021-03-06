import { User as enumUser } from '../enum/user'
const User = require('../models/User')
const authService = require('../services/auth.service')
const AuthService = new authService()
const jwt = require('jsonwebtoken')

const ObjectId = require('mongodb').ObjectID

module.exports = {

  async login (req, res) {
    if (!req.body.email && !req.body.password) {
      return res.status(400).send(
        {
          message: 'E-mail e senha precisam ser preenchidos!',
          type: 'danger'
        }
      )
    }

    const isValidUser: boolean = await module.exports.isUserCredentialsValid(req.body)

    if (isValidUser) {
      const user = await User.findOne({ email: req.body.email })
      const id = user._id

      const token = jwt.sign({ id }, process.env.SECRET, {
        expiresIn: '24h'
      })

      res.status(200).send({
        token: token,
        message: 'Seja bem vindo!',
        type: 'success'
      })
    } else {
      res.status(403).send({
        message: 'E-mail ou senha inválidos.',
        type: 'danger'
      })
    }
  },

  async checkEmailExist (emailUser: string) {
    try {
      const result = await User.find({ email: emailUser })
      return result.length > 0
    } catch (e) {
      return e
    }
  },

  async isUserCredentialsValid (credentials: { email: string; password: string }) {
    const user = await User.findOne({
      email: credentials.email
    })

    if (user && credentials.password && credentials.email) {
      return credentials.email === user.email &&
            AuthService.comparePassword(credentials.password, user.password)
    };
  },

  async insert (req, res) {
    const emailIsExist: boolean = await module.exports.checkEmailExist(req.body.email)

    if (emailIsExist) {
      return res.status(400).send(
        {
          message: 'E-mail já utilizado na plataforma.',
          type: 'danger'
        }
      )
    }

    // Encripta a senha do usuário para o padrão salt
    req.body.password = AuthService.cryptPassword(req.body.password)

    await User.create(req.body)
      .then(response => {
        return res.json({
          message: 'Acesso criado com sucesso!',
          type: 'success'
        })
      }, error => {
        return res.status(400).send({
          message: error,
          type: 'danger'
        })
      })
  },

  async dataUserLogged (req, res, next) {
    const user = await User.findOne({
      _id: req.userId
    })

    try {
      return res.status(200).send({
        data: user,
        success: true
      })
    } catch (e) {
      return res.status(400).send({
        data: [],
        message: 'Não foi possível carregar os dados do usuário.',
        success: false
      })
    }
  },

  async favoriteEstablishmentToggle (req, res) {
    const { favoriteId } = req.body
    const { userId } = req

    User.findById({ _id: userId }, function (err = null, user) {
      const fav = user.favorites.id(favoriteId)

      if (fav) {
        fav.remove()
      } else {
        user.favorites.push({ _id: favoriteId })
      }

      user.save(function (err) {
        if (err) return res.status(400).send({ type: 'error', message: 'Não foi possível favoritar' })
        return res.json(user)
      })
    })
  },

  async listFavoritesEstablishments (req, res) {
    const { userId } = req

    User.findById({ _id: userId }, function (err = null, user) {
      const favoritesId = user.favorites.map(favorite => {
        return ObjectId(favorite._id)
      })

      User.find({
        _id: {
          $in: [favoritesId]
        }
      }, function (error = null, favorites) {
        if (error) return res.status(400).send(error)

        res.send({
          data: favorites,
          type: 'success'
        })
      })
    })
  }

}
