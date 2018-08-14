const express=require('express');
// 导入验证码模块 第三方
var svgCaptcha = require('svg-captcha');
let router=express.Router();
//引入自己写的helper工具
const helper=require('../tools/helper');
const path=require('path');

//登录页面
router.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'../template/login.html'));
})
//获取登录界面的信息,信息输入正确的登录跳转
router.post('/login',(req,res)=>{
    // 获取表单提交的数据
    let userName=req.body.userName;
    let password=req.body.password;
    let vCode=req.body.vCode;
    //验证输入的验证码是否正确
    if(vCode==req.session.captcha) {
        helper.find('admin',{userName,password},(result)=>{
            if(result.length!=0) {
                res.redirect('/student/index');
            }else{
                helper.tips(res,'你输入的账号或者密码有误,请重新输入','/manager/login');
            }
        })
    }else{
        //验证码错误
        // 直接提示用户
        helper.tips(res,'验证码错误,哥们你是机器人吗 🐷','/manager/login');
    }
})
//注册页面
router.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname,'../template/register.html'));
})
//获取注册页面的信息,注册成功跳转到登录界面
router.post('/register',(req,res)=>{
    let userName=req.body.userName;
    let userPass=req.body.userPass;
    helper.find('admin',{userName},(result)=>{
        if(result.length==0) {
            helper.insertOne('admin',{userName,userPass},(result)=>{
                if(result.n==1) {
                     // 去登录页
                     helper.tips(res,'注册成功','/manager/login');
                }
            })
        }else{
            helper.tips(res,'注册失败,该用户名已被注册','/manager/register');
        }
    })
})

// 获取验证码的接口
router.get('/vcode', function (req, res) {
    // 使用第三方生成验证码
    var captcha = svgCaptcha.create();
    // 把验证码的信息保存到 session中 方便后续的匹配
    req.session.captcha = captcha.text.toLowerCase();
    // console.log(captcha.text);
    // 设置类型
    res.type('svg');
    // 返回生成的验证码图片
	res.status(200).send(captcha.data);
});


module.exports=router;