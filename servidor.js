var app = require('http').createServer(principal);
var fs = require('fs')
var firebase = require('firebase')
var io = require('socket.io')(app)


//configuramos la base de datos para la conexion
var config = {
  	apiKey: "AIzaSyDngA8rkI0RnA9pCRtJAL634cYmd71axsk",
  	authDomain: "proyecto-efd72.firebaseapp.com",
  	databaseURL: "https://proyecto-efd72.firebaseio.com",
  	storageBucket: "",
};

//aplicamos las caracteristicas de conexion
firebase.initializeApp(config);

//llamamos a la base de datos 
var dataBase = firebase.database();

//configuracion sin conexion
var presenceRef = dataBase.ref("disconnectmessage");
// Write a string when this client loses connection
presenceRef.onDisconnect().set("estoy desconectado de la red");


//miarar si esta en conexion o no(online or offline)
var connectedRef = dataBase.ref(".info/connected");
connectedRef.on("value", function(snap) {
  if (snap.val() === true) {
    console.log("connected");
  } else {
    console.log("not connected");
  }
});


function principal(request,response) {
	if (request.url == '/paginaDatos.html') {
        cargarPaginaInicio(request,response)
	}else if (request.url == "/Ingresar") {
        Ingresar(request,response)
	}else if (request.url == "/status") {
		cargarDatos(request,response)
	}else{
		response.end('la pagina no se encuentra')
	}
}


function cargarPaginaInicio(request,response) {
	fs.readFile('/Users/JuanCamiloArboleda/Desktop/node/firebase'+request.url,cargar)
	function cargar(error,data) {
		if (error) {
			console.log(error)
			response.end()
		}else{
			response.write(data)
			response.end()
		}
	}
}


 io.on('connection',function(socket) {
		socket.on('datosSeguridad',function (mensaje) {
			var bandera = 'Incorrecto'
			console.log(mensaje)
			var data = JSON.parse(mensaje)
			var nombre_usuario = data.usuario
			var contraseña_usuario = data.contraseña 
			var ref = dataBase.ref("/Usuarios/"+nombre_usuario)
			ref.on("value", function(snapshot) {
  					if ((snapshot.val()).contraseña == contraseña_usuario) {
  						bandera = 'correcto'
  						console.log(bandera)
  						io.emit('datosSeguridad',bandera)
  						socket.on('end', function (){
    						socket.disconnect(0);
						});
  					}else{
  						io.emit('datosSeguridad',bandera)
  						console.log(bandera)
  						socket.on('end', function (){
    						socket.disconnect(0);
						});
  					}

				}, function (errorObject) {
  					console.log("The read failed: " + errorObject.code);
			 });
		
	})
		
})	

function Ingresar(request,response) {
	request.on("data",recibir)
	function recibir(data) {
			var datos = JSON.parse(data)
			var ref = dataBase.ref("/Usuarios/"+datos.name).set({ 
               contraseña: datos.contraseña
			})
			response.end()
	}
}

function cargarDatos(request,response) {
	var ref = dataBase.ref("/")
	ref.on("value", function(snapshot){
		response.write(JSON.stringify(snapshot.val()));
		response.end()
	})
}

console.log('servidor creado')
app.listen(8080)