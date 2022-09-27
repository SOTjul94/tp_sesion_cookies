const {loadUsers, storeUsers} = require('../data/db');
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');

module.exports = {
    register : (req,res) => {
        return res.render("register", {title:"Registro"})
      },
    processRegister : (req,res) => {
         let errors = validationResult(req);
        if(errors.isEmpty()){  
          const {name,email,password,surname} = req.body;
          let users = loadUsers();
           
          let newUser = {
            id : users.length > 0 ? users[users.length - 1].id + 1 : 1,
            name : name?name?.trim():"",
            surname : surname?surname?.trim():"",
            email : email?.trim(),
            password : bcryptjs.hashSync(password,12),
            rol : 'user',
            avatar : req.file ? req.file.filename : "avatar.png",
          }
          
          let usersModify = [...users, newUser];
          
          storeUsers(usersModify);
          
          return res.redirect('/users/login');
         }else{
          return res.render("register",{
              errors : errors.mapped(),
              old : req.body
          }) 
         }
      
        
      },
      
  
      login : (req,res) => {
        return res.render("login", {title:"login"})
      },
    
      processLogin : (req,res) => {
      let errors = validationResult(req);
      if (errors.isEmpty()) {
           let {id,name,rol,avatar,email} = loadUsers().find(user => user.email === req.body.email);
    
          req.session.userLogin = {
            id,
            name,
            rol,
            email,
            avatar     
          }; 
          if(req.body.remember){
            res.cookie("liebre16",req.session.userLogin,{
              maxAge : 1000 * 60
            })
          }
             
       return res.redirect("/users/profile")  
      }else{
        return res.render("login",{
         errors : errors.mapped()
       })
     }
   
      },
        /* PROFILE */
        profile : (req,res) => {
          let user = loadUsers().find(user => user.id === req.session.userLogin.id)
          return res.render("profile", {
            title:"profile",
            user
          })
        },
        logout : (req,res) => {
           req.session.destroy();
           return res.redirect("/")
        }    
}