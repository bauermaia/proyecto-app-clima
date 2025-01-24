"use strict"
//usando api de clima y de geolocalización y REST Countries
import CONFIG from './config.js'; // Si usas ES6

const apiKey = CONFIG.apiKey;
const apiUrl= "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const restCountriesUrl= "https://restcountries.com/v3.1/alpha/";
const geoApiUrl= "https://api.openweathermap.org/geo/1.0/direct";


const HTMLcity= document.querySelector(".city");
const HTMLtemp=  document.querySelector(".temp");
const HTMLhum= document.querySelector(".humedad");
const HTMLwind=document.querySelector(".wind");
const HTMLpais=document.querySelector(".pais");
const HTMLimg= document.querySelector(".weather__img");
const sensasion= document.querySelector(".forecast-item-sensasion");
const presion= document.querySelector(".forecast-item-presion");
const max= document.querySelector(".forecast-item-max");
const min= document.querySelector(".forecast-item-min");
const amanecer= document.querySelector(".forecast-item-amanecer");
const atardecer= document.querySelector(".forecast-item-atardecer");
const visibilidad= document.querySelector(".forecast-item-visibilidad");


window.onload= ()=> {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(successCallback,errorCallback);
    } else {
        console.error("No es posible obtener la localización");
    }
};

function successCallback(position) {
    const lat= position.coords.latitude;
    const lon= position.coords.longitude;

    checkClimaCoord(lat,lon);
}

function errorCallback(error) {
    console.error("No se pudo obtener la ubicación:", error.message);
    actualizarHTML("-", "-", "-", "-", "Ubicación no disponible");
}

async function checkClimaCoord(lat,lon) {
    try{
        const respuesta = await fetch(`${apiUrl}&lat=${lat}&lon=${lon}&appid=${apiKey}`);


        if(!respuesta){
            throw new Error("No se pudo obtener el clima por coordenadas");
        }

        const data= await respuesta.json();
        console.log(data);


        HTMLcity.innerHTML = data.name;
        const temp = Math.trunc(data.main.temp);
        HTMLtemp.innerHTML = `${temp}°C`;
        HTMLhum.innerHTML = `${data.main.humidity}%`;
        const wind = Math.trunc(data.wind.speed);
        HTMLwind.innerHTML = `${wind} km/h`;

        //obtener el nombre completo del pais
        const nombrePais= await fetchCountryName(data.sys.country);
        HTMLpais.innerHTML=nombrePais;

        const img= data.weather[0].main;
        HTMLimg.src=`images/${img}.png`;
        const sens= Math.trunc(data.main.feels_like);
        sensasion.innerHTML= `${sens} °c`;
        presion.innerHTML= `${data.main.pressure} hPa`;
        const maxt= Math.trunc(data.main.temp_max);
        max.innerHTML= `${maxt} °c`;
        const mint= Math.trunc(data.main.temp_min);
        min.innerHTML= `${mint} °c`;
        const sunrise= new Date(data.sys.sunrise*1000);
        const sunset= new Date(data.sys.sunset*1000);
        amanecer.innerHTML=`${sunrise.toLocaleTimeString()}`;
        atardecer.innerHTML=`${sunset.toLocaleTimeString()}`;
        const vis= (data.visibility/1000);
        visibilidad.innerHTML= `${vis} Km`
        
    } catch (error) {
        console.error("Error al obtener el clima: "+ error);
        actualizarHTML("-", "-", "-", "-", "Error al obtener el clima");
    }
}


const boton= document.querySelector(".search__button");
boton.addEventListener('click',async()=>{
   const ciudadBuscada= document.getElementById('ciudad').value;
    const resultados= await buscarCiudad(ciudadBuscada);
    // checkClima(ciudadBuscada);

    if (resultados.length > 1) {
        const opcionesDiv = document.querySelector(".opciones");
        opcionesDiv.style.display = "block";
        
        // Generar la lista de opciones
        const opciones = resultados.map((result) => {
            return `<li data-lat="${result.lat}" data-lon="${result.lon}">${result.name}, ${result.state}, ${result.country}</li>`;
        }).join("");
        
        opcionesDiv.innerHTML = `<ul>${opciones}</ul>`;

        // Agregar eventos a las opciones
        document.querySelectorAll(".opciones li").forEach((item) => {
            item.addEventListener("click", (e) => {
                const lat = e.target.dataset.lat;
                const lon = e.target.dataset.lon;
                checkClimaCoord(lat, lon);
                opcionesDiv.style.display = "none";  // Ocultar las opciones después de seleccionar
            });
        });

    } else if (resultados.length === 1) {
        // Si hay solo un resultado, carga directamente el clima
        const lat = resultados[0].lat;
        const lon = resultados[0].lon;
        checkClimaCoord(lat, lon);
    } else {
        // Si no hay resultados
        console.error("No se encontraron resultados para esta ciudad");
        actualizarHTML("-", "-", "-", "-", "Ciudad no encontrada");
    }
});


//para ciudades con mismo nombre en diferentes paises
async function buscarCiudad(ciudad,limit=5) {
    try{
        const respuesta= await fetch(`${geoApiUrl}?q=${ciudad}&limit=${limit}&appid=${apiKey}`);

        if(!respuesta.ok){
            throw new Error("No se encontraron coincidencias");
        }

        const data= await respuesta.json();
        console.log(data);
        return data;
    }catch(error){
        console.log("Error al buscar la ciudad: ", error);
        return[];
    }    
}

//funcion para obtener el nombre completo de pais

async function fetchCountryName(codigo) {
   try{
    const respuesta= await fetch (`${restCountriesUrl}${codigo}`);
    if(!respuesta){
        throw new Error("No se puede obtener el nombre del pais");
    }

    const data = await respuesta.json();
    console.log(data);

    //valida si existen los datos y traducciones
    if (!data || !data[0] || !data[0].translations) {
        throw new Error("No se encontraron datos para el país");
    }

    return data[0].translations.spa.common; // Devuelve el nombre en español
} catch(error){
    console.error("Error al obtener el pais: ", error);
    return "Pais desconocido";
}
   }

   function actualizarHTML(city, temp, hum, wind, pais) {
    HTMLcity.innerHTML = city;
    HTMLtemp.innerHTML = temp;
    HTMLhum.innerHTML = hum;
    HTMLwind.innerHTML = wind;
    HTMLpais.innerHTML = pais;
}

const swiperFavorites = new Swiper('.swiper', {
    grabCursor: true, // Cambia el cursor a una mano para indicar que puedes arrastrar
    slidesPerView: 'auto', // Ajusta automáticamente el número de diapositivas visibles según el ancho
    spaceBetween: 10, // Espacio entre las diapositivas en píxeles
    centeredSlides: true, // Centra las diapositivas activas
});

const verMas= document.querySelector(".vermas");
const verMenos= document.querySelector(".vermenos");
const swiper=document.querySelector(".swiper");
verMas.addEventListener('click', ()=>{
    swiper.style.display="flex";
    verMas.style.display="none";
    verMenos.style.display="block";
});

verMenos.addEventListener('click', ()=>{
    swiper.style.display="none";
    verMas.style.display="block";
    verMenos.style.display="none";
})
