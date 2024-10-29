const divisor = document.getElementById("divisor");
const containerBox = document.getElementById("container-box");

const tituloMoneda = document.createElement("h2");
tituloMoneda.textContent = "Pesos CLP";
tituloMoneda.style.textAlign = "center";
containerBox.appendChild(tituloMoneda);

const inputCantidad = document.createElement("input");
inputCantidad.type = "number";
inputCantidad.placeholder = "Introduce el monto en CLP";
inputCantidad.style.display = "block";
inputCantidad.style.margin = "10px auto";
inputCantidad.style.padding = "10px";
containerBox.appendChild(inputCantidad);

const labelMoneda = document.createElement("label");
labelMoneda.textContent = "Moneda a convertir:";
labelMoneda.style.display = "block";
labelMoneda.style.textAlign = "center";
containerBox.appendChild(labelMoneda);

const selectOpciones = document.createElement("select");
selectOpciones.style.display = "block";
selectOpciones.style.margin = "10px auto";
selectOpciones.style.padding = "10px";

const option2 = document.createElement("option");
const optionDolar = document.createElement("option");
optionDolar.value = "dolar";
optionDolar.textContent = "Dólar";
selectOpciones.appendChild(optionDolar);

const optionEuro = document.createElement("option");
optionEuro.value = "euro";
optionEuro.textContent = "Euro";
selectOpciones.appendChild(optionEuro);

containerBox.appendChild(selectOpciones);

const botonBuscar = document.createElement("button");
botonBuscar.textContent = "Buscar";
botonBuscar.style.display = "block";
botonBuscar.style.margin = "20px auto";
botonBuscar.style.padding = "10px 20px";
containerBox.appendChild(botonBuscar);

const resultadoBox = document.createElement("div");
resultadoBox.id = "resultado";
resultadoBox.style.textAlign = "center";
resultadoBox.style.marginTop = "10px";
resultadoBox.textContent = "...";
containerBox.appendChild(resultadoBox);

async function obtenerTipoCambio(moneda) {
  try {
    const response = await fetch("https://mindicador.cl/api");
    if (!response.ok) {
      throw new Error("Error al obtener los datos de la API");
    }
    const data = await response.json();

    if (moneda === "dolar") return data.dolar.valor;
    if (moneda === "euro") return data.euro.valor;

    return null;
  } catch (error) {
    console.error("Error en la solicitud a la API:", error);
    return null;
  }
}
botonBuscar.addEventListener("click", async () => {
  const cantidad = parseFloat(inputCantidad.value);
  const moneda = selectOpciones.value;

  if (inputCantidad.value.trim() === "" || isNaN(cantidad) || cantidad <= 0) {
    resultadoBox.textContent = "Introduce una cantidad válida.";
    return;
  }

 const tipoCambio = await obtenerTipoCambio(moneda);
  
  if (tipoCambio) {
    const resultado = (cantidad / tipoCambio).toFixed(2);
    resultadoBox.textContent = `Resultado: $${resultado}`;
    
    const historicalData = await obtenerDatosHistoricos(moneda);
    actualizarGrafico(historicalData);
    
  } else {
    resultadoBox.textContent = "Error al obtener el tipo de cambio.";
  }
});

async function obtenerDatosHistoricos(moneda) {
  try {
    const response = await fetch(`https://mindicador.cl/api/${moneda}`);
    if (!response.ok) {
      throw new Error("Error al obtener los datos de la API");
    }
    const data = await response.json();
    
    const valores = data.serie.slice(0, 10).reverse();
    conversionData = valores.map(item => item.valor);
    conversionLabels = valores.map(item => item.fecha.split("T")[0]);
    return conversionData;

  } catch (error) {
    console.error("Error en la solicitud a la API:", error);
    return [];
  }
}


let conversionData = [];
let conversionLabels = [];

const canvas = document.getElementById("conversionChart");
canvas.width = 500; 
canvas.height = 200; 
const ctx = canvas.getContext("2d");

function actualizarGrafico(data) {
  if (window.myChart) {
    window.myChart.destroy();
  }

  window.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: conversionLabels,
      datasets: [{
        label: 'Valor en CLP',
        data: conversionData,
        borderColor: 'rgba(0, 188, 212, 1)',
        backgroundColor: 'rgba(0, 188, 212, 0.2)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}