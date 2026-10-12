const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const cors = require('cors');
const fs = require('fs');
const app = express();
app.use(cors());
app.get('/', (req,res)=>{
res.send(`<!DOCTYPE html><html><head><title>FRANK PAIR CODE</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#0a0a0a;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}.card{background:#1a1a1a;padding:30px;border-radius:15px;width:90%;max-width:400px;text-align:center;border:1px solid #333}input{width:90%;padding:15px;border-radius:8px;border:none;margin:15px 0;font-size:16px}button{background:#25D366;color:#fff;border:none;padding:15px 30px;border-radius:8px;font-size:16px;font-weight:bold;cursor:pointer;width:100%}#code{margin-top:20px;font-size:32px;letter-spacing:5px;color:#25D366;font-weight:bold}small{color:#888}</style></head><body><div class="card"><h2>FRANK PAIR CODE</h2><small>Your WhatsApp, one code away</small><input id="num" placeholder="2557XXXXXXXX"><button onclick="getCode()">Get Pair Code</button><div id="code"></div><p id="msg"></p></div><script>async function getCode(){const n=document.getElementById('num').value,c=document.getElementById('code'),m=document.getElementById('msg');if(!n){alert('Weka namba');return}c.innerText='...';m.innerText='Subiri...';try{const r=await fetch('/pair?number='+n);const d=await r.json();if(d.code){c.innerText=d.code;m.innerText='WhatsApp > Linked Devices > Link with phone number';}else{c.innerText='';m.innerText=d.error}}catch(e){m.innerText='Error'}}</script></body></html>`);
});
app.get('/pair', async (req,res)=>{
let num=req.query.number; if(!num) return res.json({error:'Weka namba'}); num=num.replace(/[^0-9]/g,'');
try{
const dir='./auth_'+num; if(fs.existsSync(dir)) fs.rmSync(dir,{recursive:true,force:true});
const {state,saveCreds}=await useMultiFileAuthState(dir);
const sock=makeWASocket({auth:state,printQRInTerminal:false,logger:pino({level:'silent'}),browser:["Chrome","Chrome",""]});
sock.ev.on('creds.update',saveCreds); await delay(3000);
let code=await sock.requestPairingCode(num); code=code.match(/.{1,4}/g).join('-')||code;
res.json({code}); setTimeout(()=>{try{sock.ws.close()}catch{} if(fs.existsSync(dir)) fs.rmSync(dir,{recursive:true,force:true})},60000);
}catch(e){res.json({error:'Jaribu tena'}})}
const PORT=process.env.PORT||3000; app.listen(PORT,()=>console.log('Running'));
